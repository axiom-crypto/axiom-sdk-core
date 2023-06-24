import { ZeroAddress, ZeroHash, ethers, keccak256 } from "ethers";
import { QueryData, QueryRow, ResponseTree } from "../shared/types";
import {
  getBlockResponse,
  getFullAccountResponse,
  getFullStorageResponse,
} from "./response";
import { encodeQuery, encodeQueryData, encodeRowHash } from "./encoder";
import { InternalConfig } from "../shared/internalConfig";
import { 
  concatHexStrings,
  getAccountData, 
  sortAddress,
  sortBlockNumber,
  sortSlot 
} from "../shared/utils";
import { Constants } from "../shared/constants";
import { validateQueryRow } from "./validate";
import MerkleTree from "merkletreejs";

export class QueryBuilder {
  private queries: QueryRow[] = [];
  private readonly config: InternalConfig;
  private readonly maxSize: number;

  constructor(config: InternalConfig) {
    this.maxSize = Constants(config.version).Values.MaxQuerySize;
    if ((this.maxSize & (this.maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
    this.config = new InternalConfig(config);
  }

  /// Appends a `QueryRow` to the current `QueryBuilder` instance. If the `QueryBuilder`
  /// has reached its maximum size, or if validation for that `QueryRow` fails then an 
  /// error will be thrown.
  async append(queryRow: QueryRow) {
    const processedRow = await this.processQueryRow(queryRow);
    await validateQueryRow(this.config.provider, processedRow);
    this.queries.push(processedRow);
  }

  /// Appends a `QueryRow` to the current `QueryBuilder` instance without validating the 
  /// the values first. If there are invalid values (such as the account address being an 
  /// empty account at the specified block number), then the proof generation of the Query 
  /// will fail after submitting the transaction, making it impossible to fulfill the 
  /// Query on-chain.
  async appendWithoutValidation(queryRow: QueryRow) {
    const processedRow = await this.processQueryRow(queryRow);
    this.queries.push(processedRow);
  }

  /// Gets the current number of `QueryRow`s appended to the instance of `QueryBuilder`.
  getCurrentSize(): number {
    return this.queries.length;
  }

  /// Gets the number of `QueryRow`s that can still be appended
  getRemainingSize(): number {
    return this.maxSize - this.queries.length;
  }

  /// Gets the maximum number of `QueryRow`s that the current instance of `QueryBuilder`
  /// supports
  getMaxSize(): number {
    return this.maxSize;
  }

  /// Gets the current `QueryRow` values as a formatted string in the order that they
  /// were appended
  asFormattedString(): string {
    return this.formatQueries(this.queries);
  }

  /// Sorts the queries first before formatting the output string
  asSortedFormattedString(): string {
    const sortedQueries = this.sortQueries();
    return this.formatQueries(sortedQueries);
  }

  /// Builds the query response and query data to be sent to the Axiom contract.
  async build(): Promise<{
    keccakQueryResponse: string;
    queryHash: string;
    query: string;
  }> {
    if (this.queries.length === 0) {
      throw new Error(
        "Cannot build query response and query data with no queries"
      );
    }
    const sortedQueries = this.sortQueries();
    const keccakQueryResponse = await this.buildQueryResponse(sortedQueries);
    const query = this.buildQueryData(sortedQueries);
    const queryHash = keccak256(query);

    return {
      keccakQueryResponse,
      queryHash,
      query,
    };
  }

  /// Processes an input `QueryRow` and gets a value from the provider if necessary
  private async processQueryRow(queryRow: QueryRow) {
    if (this.queries.length >= this.maxSize) {
      throw new Error(
        `QueryBuilder has reached its maximum size of ${this.maxSize}. Either reduce the number of queries or pass in a larger size to QueryBuilder.`
      );
    }

    if (queryRow.address === null && queryRow.slot !== null) {
      throw new Error(
        "If `slot` is specified, then `address` must not be null"
      );
    }

    // Ensure valid address
    if (queryRow.address !== null) {
      if (queryRow.address.match(/^0x[0-9a-fA-F]{40}$/) === null) {
        throw new Error(`Invalid address format for: ${queryRow.address}`);
      }
    }

    if (!queryRow.value) {
      if (queryRow.address !== null && queryRow.slot !== null) {
        // Note that this may fail silently if the archive node is not able to get the value at the slot
        queryRow.value = await this.config.provider.getStorage(
          queryRow.address,
          queryRow.slot,
          queryRow.blockNumber
        );
      } else {
        queryRow.value = null;
      }
    }

    return queryRow;
  }

  /// Sorts queries in order of blockNumber, address, and slot
  private sortQueries(): QueryRow[] {
    return this.queries.sort((a, b) => {
      // Sorts by blockNumber, then address, then slot
      return (
        sortBlockNumber(a.blockNumber, b.blockNumber) ||
        sortAddress(a.address, b.address) ||
        sortSlot(a.slot, b.slot)
      );
    });
  }

  /// Formats queries into a pretty-printable string
  private formatQueries(queries: QueryRow[]): string {
    let str = "";
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      str += `query: ${i}, blockNumber: ${query.blockNumber}, address: ${query.address}, slot: ${query.slot}, value: ${query.value}\n`;
    }
    return str;
  }

  /// Builds a queryResponse from the sorted queries
  private async buildQueryResponse(sortedQueries: QueryRow[]): Promise<string> {
    const queryData = await this.getQueryDataFromRows(sortedQueries);
    const responseTree = this.buildResponseTree(queryData);

    // Calculate the merkle root for each column
    const blockResponseRoot = responseTree.blockTree.getHexRoot();
    const accountResponseRoot = responseTree.accountTree.getHexRoot();
    const storageResponseRoot = responseTree.storageTree.getHexRoot();

    // Calculate the queryResponse
    const queryResponse = keccak256(
      concatHexStrings(
        blockResponseRoot,
        accountResponseRoot,
        storageResponseRoot
      )
    );
    return queryResponse;
  }

  buildResponseTree(data: QueryData[]): ResponseTree {
    // Calculate each of the column responses and append them to each column
    let blockResponseColumn: string[] = [];
    let accountResponseColumn: string[] = [];
    let storageResponseColumn: string[] = [];

    const rowHashMap = new Map(data.map((row, i) => [row.rowHash, i]));
    for (const query of data) {
      // Calculate the keccakBlockResponse
      const blockResponse = getBlockResponse(
        query.blockHash,
        query.blockNumber
      );
      blockResponseColumn.push(blockResponse);

      const address = query.address;
      if (!address) {
        accountResponseColumn.push(ZeroHash);
        storageResponseColumn.push(ZeroHash);
      } else {
        const nonce = query.nonce;
        const balance = query.balance;
        const storageHash = query.storageHash;
        const codeHash = query.codeHash;
        if (
          nonce === undefined ||
          balance === undefined ||
          storageHash === undefined ||
          codeHash === undefined
        ) {
          throw new Error(
            `Could not find account data for ${address} at block ${query.blockNumber}`
          );
        }

        // Calculate keccakFullAccountResponse
        const fullAccountResponse = getFullAccountResponse(
          query.blockNumber,
          address,
          nonce,
          balance,
          storageHash,
          codeHash
        );
        accountResponseColumn.push(fullAccountResponse);

        const slot = query.slot;
        if (!slot) {
          storageResponseColumn.push(ZeroHash);
        } else {
          const value = query.value;
          if (!value) {
            throw new Error(
              `Could not find storage data for slot ${slot} in account ${address} at block ${query.blockNumber}`
            );
          }
          // Calculate keccakFullStorageResponse
          const fullStorageResponse = getFullStorageResponse(
            query.blockNumber,
            address,
            slot,
            value
          );
          storageResponseColumn.push(fullStorageResponse);
        }
      }
    }

    // Fill in the remaining unused rows in the columns with zeros
    const numUnused = this.maxSize - data.length;
    blockResponseColumn = blockResponseColumn.concat(
      Array(numUnused).fill(ZeroHash)
    );
    accountResponseColumn = accountResponseColumn.concat(
      Array(numUnused).fill(ZeroHash)
    );
    storageResponseColumn = storageResponseColumn.concat(
      Array(numUnused).fill(ZeroHash)
    );

    const blockTree = new MerkleTree(blockResponseColumn, keccak256);
    const accountTree = new MerkleTree(accountResponseColumn, keccak256);
    const storageTree = new MerkleTree(storageResponseColumn, keccak256);

    return {
      blockTree,
      accountTree,
      storageTree,
      rowHashMap,
      data,
    };
  }


  async getQueryDataFromRows(sortedQueries: QueryRow[]): Promise<QueryData[]> {
    // Collapse blockNumber, account, and slot into hash table keys to reduce total
    // number of JSON-RPC calls
    let blockNumberToBlock: { [key: string]: ethers.Block | null } = {};
    let blockNumberAccountToAccount: { [key: string]: any | null } = {};
    let blockNumberAccountStorageToValue: { [key: string]: any | null } = {};

    for (let i = 0; i < sortedQueries.length; i++) {
      const blockNumber = sortedQueries[i].blockNumber;
      blockNumberToBlock[`${blockNumber}`] = null;

      const address = sortedQueries[i].address;
      if (address !== null) {
        blockNumberAccountToAccount[`${blockNumber},${address}`] = null;
      }

      const slot = sortedQueries[i].slot;
      if (
        address !== null &&
        slot !== null &&
        sortedQueries[i].value !== undefined
      ) {
        blockNumberAccountStorageToValue[`${blockNumber},${address},${slot}`] =
          sortedQueries[i].value;
      }
    }

    // Get all of the block hashes
    for (const blockNumberStr of Object.keys(blockNumberToBlock)) {
      const blockNumber = parseInt(blockNumberStr);
      const block = await this.config.provider.getBlock(blockNumber);

      if (block === null || block.hash === null) {
        throw new Error(
          `Could not get block ${blockNumber} from provider ${this.config.providerUri}`
        );
      }
      blockNumberToBlock[blockNumber] = block;
    }

    // Get all of the data for the accounts
    for (const blockNumberAccountStr of Object.keys(
      blockNumberAccountToAccount
    )) {
      const [blockNumberStr, address] = blockNumberAccountStr.split(",");
      const blockNumber = parseInt(blockNumberStr);
      const account = await getAccountData(
        blockNumber,
        address as `0x${string}`,
        [],
        this.config.provider
      );
      blockNumberAccountToAccount[blockNumberAccountStr] = account;
    }

    let queryData: QueryData[] = []

    for (let i = 0; i < sortedQueries.length; i++) {
      const blockNumber = sortedQueries[i].blockNumber;
      if (blockNumber === null) {
        throw new Error(
          `Block number cannot be '0' for queries within this set of rows. Row: ${i}`
        );
      }

      const block = blockNumberToBlock[blockNumber.toString()];
      if (block === null) {
        throw new Error(
          `Could not find get ${blockNumber} in mapping of blocks`
        );
      }

      const blockHash = block.hash;
      if (blockHash === null) {
        throw new Error(`Could not find hash for block ${blockNumber}`);
      }

      const address = sortedQueries[i].address;
      const slot = sortedQueries[i].slot;

      const rowHash = encodeRowHash(blockNumber, address ?? undefined, slot ?? undefined);

      let row: QueryData = {
        rowHash,
        blockNumber,
        blockHash,
      };

      if (address != null) {
        row.address = address;
        const accountData =
          blockNumberAccountToAccount[`${blockNumber},${address}`];
        row.nonce = accountData?.nonce;
        row.balance = accountData?.balance;
        row.storageHash = accountData?.storageHash;
        row.codeHash = accountData?.codeHash;
        if (
          row.nonce === undefined ||
          row.balance === undefined ||
          row.storageHash === undefined ||
          row.codeHash === undefined
        ) {
          throw new Error(
            `Could not find account data for ${address} at block ${blockNumber}`
          );
        }

        row.slot = sortedQueries[i].slot?.toString() ?? undefined;
        if (slot != null) {
          row.value =
            blockNumberAccountStorageToValue[
            `${blockNumber},${address},${slot}`
            ];

        }
      }

      queryData.push(row);
    }
    return queryData;

  }

  /// Builds a packed queryData blob from the sorted queries
  private buildQueryData(sortedQueries: QueryRow[]): string {
    // Extra data that we'll encode with the query data
    const numQueries = sortedQueries.length;
    const versionIdx = Constants(this.config.version).Values.QueryEncodingVersion;

    const encodedQueries: string[] = [];
    for (let i = 0; i < numQueries; i++) {
      let length = 0;

      // Check for block number
      const blockNumber = sortedQueries[i].blockNumber;
      if (blockNumber === null) {
        const encodedQuery = encodeQuery(length, 0, ZeroAddress, 0, 0);
        encodedQueries.push(encodedQuery);
        continue;
      }

      // Query has block number; check for address
      length++;
      const address = sortedQueries[i].address;
      if (address === null) {
        const encodedQuery = encodeQuery(length, blockNumber, ZeroAddress, 0, 0);
        encodedQueries.push(encodedQuery);
        continue;
      }

      // Query has block number and address; check for slot
      length++;
      const slot = sortedQueries[i].slot;
      const value = sortedQueries[i].value;
      if (slot === null || value === null || value === undefined) {
        const encodedQuery = encodeQuery(length, blockNumber, address, 0, 0);
        encodedQueries.push(encodedQuery);
        continue;
      }

      // Query has all of the fields
      length += 2;
      const encodedQuery = encodeQuery(
        length,
        blockNumber,
        address,
        slot,
        value
      );
      encodedQueries.push(encodedQuery);
    }

    // Finally return all of the encoded query data
    return encodeQueryData(versionIdx, numQueries, encodedQueries);
  }
}
