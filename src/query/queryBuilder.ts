import { AddressLike, BigNumberish, ZeroHash, ethers, keccak256 } from "ethers";
import {
  QueryData,
  QueryRow,
  ResponseTree,
  SolidityAccountResponse,
  SolidityBlockResponse,
  SolidityStorageResponse,
} from "../shared/types";
import {
  getBlockResponse,
  getFullAccountResponse,
  getFullStorageResponse,
  getKeccakMerkleRoot,
} from "./response";
import { encodeQuery, encodeQueryData, encodeRowHash } from "./encoder";
import { Config } from "../shared/config";
import { concatHexStrings, getAccountData, zeroBytes } from "../shared/utils";
import { Constants, Versions } from "../shared/constants";
import axios, { HttpStatusCode } from "axios";
import MerkleTree from "merkletreejs";

export class QueryBuilder {
  private queries: QueryRow[] = [];
  private readonly config: Config;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly maxSize: number;

  constructor(config: Config) {
    this.maxSize = Constants[config.version].Values.MaxQuerySize;
    if ((this.maxSize & (this.maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
    this.config = new Config(config);
    this.provider = new ethers.JsonRpcProvider(this.config.providerUri);
  }

  /// Appends a `QueryRow` to the current `QueryBuilder` instance. If the `QueryBuilder`
  /// has reached its maximum size, then an error will be thrown.
  async append(query: QueryRow) {
    if (this.queries.length >= this.maxSize) {
      throw new Error(
        `QueryBuilder has reached its maximum size of ${this.maxSize}. Either reduce the number of queries or pass in a larger size to QueryBuilder.`
      );
    }

    if (query.address === null && query.slot !== null) {
      throw new Error(
        "If `slot` is specified, then `address` must not be null"
      );
    }

    // Ensure valid address
    if (query.address !== null) {
      if (query.address.match(/^0x[0-9a-fA-F]{40}$/) === null) {
        throw new Error(`Invalid address format for: ${query.address}`);
      }
    }

    if (!query.value) {
      if (query.address !== null && query.slot !== null) {
        // Note that this may fail silently if the archive node is not able to get the value at the slot
        query.value = await this.provider.getStorage(
          query.address,
          query.slot,
          query.blockNumber
        );
      } else {
        query.value = null;
      }
    }

    this.queries.push(query);
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

  /// Sorts queries in order of blockNumber, address, and slot
  private sortQueries(): QueryRow[] {
    const sortBlockNumber = (a: number, b: number) => {
      return a - b;
    };

    const sortAddress = (a: `0x${string}` | null, b: `0x${string}` | null) => {
      if (a === null && b === null) {
        return 0;
      } else if (a === null) {
        return -1;
      } else if (b === null) {
        return 1;
      }
      return parseInt(a, 16) - parseInt(b, 16);
    };

    const sortSlot = (
      a: ethers.BigNumberish | null,
      b: ethers.BigNumberish | null
    ) => {
      if (a === null && b === null) {
        return 0;
      } else if (a === null) {
        return -1;
      } else if (b === null) {
        return 1;
      }
      return parseInt(a.toString(), 16) - parseInt(b.toString(), 16);
    };

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
      const block = await this.provider.getBlock(blockNumber);

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
        this.provider
      );
      blockNumberAccountToAccount[blockNumberAccountStr] = account;
    }

    // Calculate each of the column responses and append them to each column
    let blockResponseColumn: string[] = [];
    let accountResponseColumn: string[] = [];
    let storageResponseColumn: string[] = [];

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

      // Calculate the keccakBlockResponse
      const blockResponse = getBlockResponse(blockHash, blockNumber);
      blockResponseColumn.push(blockResponse);

      const address = sortedQueries[i].address;
      if (address === null) {
        accountResponseColumn.push(zeroBytes(32));
        storageResponseColumn.push(zeroBytes(32));
      } else {
        const accountData =
          blockNumberAccountToAccount[`${blockNumber},${address}`];
        const nonce = accountData?.nonce;
        const balance = accountData?.balance;
        const storageHash = accountData?.storageHash;
        const codeHash = accountData?.codeHash;
        if (
          nonce === undefined ||
          balance === undefined ||
          storageHash === undefined ||
          codeHash === undefined
        ) {
          throw new Error(
            `Could not find account data for ${address} at block ${blockNumber}`
          );
        }

        // Calculate keccakFullAccountResponse
        const fullAccountResponse = getFullAccountResponse(
          blockNumber,
          address,
          nonce,
          balance,
          storageHash,
          codeHash
        );
        accountResponseColumn.push(fullAccountResponse);

        const slot = sortedQueries[i].slot;
        if (slot === null) {
          storageResponseColumn.push(zeroBytes(32));
        } else {
          const value =
            blockNumberAccountStorageToValue[
              `${blockNumber},${address},${slot}`
            ];

          // Calculate keccakFullStorageResponse
          const fullStorageResponse = getFullStorageResponse(
            blockNumber,
            address,
            slot,
            value
          );
          storageResponseColumn.push(fullStorageResponse);
        }
      }
    }

    // Fill in the remaining unused rows in the columns with zeros
    const numUnused = this.maxSize - sortedQueries.length;
    blockResponseColumn = blockResponseColumn.concat(
      Array(numUnused).fill(zeroBytes(32))
    );
    accountResponseColumn = accountResponseColumn.concat(
      Array(numUnused).fill(zeroBytes(32))
    );
    storageResponseColumn = storageResponseColumn.concat(
      Array(numUnused).fill(zeroBytes(32))
    );

    // Calculate the merkle root for each column
    const blockResponseRoot = getKeccakMerkleRoot(blockResponseColumn);
    const accountResponseRoot = getKeccakMerkleRoot(accountResponseColumn);
    const storageResponseRoot = getKeccakMerkleRoot(storageResponseColumn);

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

  /// Builds a packed queryData blob from the sorted queries
  private buildQueryData(sortedQueries: QueryRow[]): string {
    // Extra data that we'll encode with the query data
    const numQueries = sortedQueries.length;
    const versionIdx = Versions.indexOf(this.config.version);

    const encodedQueries: string[] = [];
    for (let i = 0; i < numQueries; i++) {
      let length = 0;

      // Check for block number
      const blockNumber = sortedQueries[i].blockNumber;
      if (blockNumber === null) {
        const encodedQuery = encodeQuery(length, 0, "0", 0, 0);
        encodedQueries.push(encodedQuery);
        continue;
      }

      // Query has block number; check for address
      length++;
      const address = sortedQueries[i].address;
      if (address === null) {
        const encodedQuery = encodeQuery(length, blockNumber, "0", 0, 0);
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

  private async getDataForQuery(
    queryHash: string,
    contractAddress?: string
  ): Promise<QueryData[] | undefined> {
    const baseUrl = Constants[this.config.version].Urls.ApiQueryUrl;
    const endpoint = Constants[this.config.version].Endpoints.GetDataForQuery;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, {
      params: { queryHash, chaindId: this.config.chainId, contractAddress },
      headers: {
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.config.providerUri,
      },
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data !== undefined) {
        return result.data;
      }
    }
    return undefined;
  }

  async getResponseTreeForQuery(
    queryHash: string,
    contractAddress?: string
  ): Promise<ResponseTree> {
    const data = await this.getDataForQuery(queryHash, contractAddress);
    if (data === undefined) {
      throw new Error(`Could not find query data for ${queryHash}`);
    }
    // This is all copied from this.buildQueryResponse, should refactor
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
    const numUnused = this.maxSize - blockResponseColumn.length;
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

  getValidationWitness(
    responseTree: ResponseTree,
    blockNumber: number,
    address?: string,
    slot?: BigNumberish
  ):
    | {
        blockResponse: SolidityBlockResponse;
        accountResponse?: SolidityAccountResponse;
        storageResponse?: SolidityStorageResponse;
      }
    | undefined {
    const rowHash = encodeRowHash(blockNumber, address, slot);
    const leafIdx = responseTree.rowHashMap.get(rowHash);
    if (leafIdx === undefined) {
      console.log(`Could not find this query in the responseTree`);
      return undefined;
    }
    const rowData = responseTree.data[leafIdx];
    const blockTree = responseTree.blockTree;
    const blockProof = blockTree.getHexProof(
      blockTree.getLeaf(leafIdx),
      leafIdx
    );
    const blockResponse = {
      blockNumber,
      blockHash: rowData.blockHash,
      leafIdx,
      proof: blockProof,
    };
    let accountResponse: SolidityAccountResponse | undefined;
    let storageResponse: SolidityStorageResponse | undefined;
    if (address) {
      const accountTree = responseTree.accountTree;
      const accountProof = accountTree.getHexProof(
        accountTree.getLeaf(leafIdx),
        leafIdx
      );
      if (
        !rowData.nonce ||
        !rowData.balance ||
        !rowData.storageHash ||
        !rowData.codeHash
      ) {
        return undefined;
      }
      accountResponse = {
        blockNumber,
        addr: address,
        nonce: rowData.nonce,
        balance: rowData.balance,
        storageRoot: rowData.storageHash,
        codeHash: rowData.codeHash,
        leafIdx,
        proof: accountProof,
      };

      if (slot) {
        const storageTree = responseTree.storageTree;
        const storageProof = storageTree.getHexProof(
          storageTree.getLeaf(leafIdx),
          leafIdx
        );
        if (!rowData.value) {
          return undefined;
        }
        storageResponse = {
          blockNumber,
          addr: address,
          slot,
          value: rowData.value,
          leafIdx,
          proof: storageProof,
        };
      }
    }
    return {
      blockResponse,
      accountResponse,
      storageResponse,
    };
  }
}
