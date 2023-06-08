import { ethers, keccak256 } from "ethers";
import { QueryRow } from "../shared/types";
import { getBlockResponse, getFullAccountResponse, getFullStorageResponse, getKeccakMerkleRoot } from "./response";
import { encodeQuery, encodeQueryData } from "./encoder";
import { Config } from "../shared/config";
import { concatHexStrings, getAccountData, zeroBytes } from "../shared/utils";
import { Constants, Versions } from "../shared/constants";

export class QueryBuilder {
  private queries: QueryRow[] = [];
  private readonly config: Config;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly maxSize: number;

  constructor(
    config: Config,
  ) {
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
      throw new Error(`QueryBuilder has reached its maximum size of ${this.maxSize}. Either reduce the number of queries or pass in a larger size to QueryBuilder.`);
    }

    if (query.address === null && query.slot !== null) {
      throw new Error("If `slot` is specified, then `address` must not be null");
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
        query.value = await this.provider.getStorage(query.address, query.slot, query.blockNumber);
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
  async build(): Promise<{queryResponse: string, query: string}> {
    if (this.queries.length === 0) {
      throw new Error("Cannot build query response and query data with no queries");
    }
    const sortedQueries = this.sortQueries();
    const queryResponse = await this.buildQueryResponse(sortedQueries);
    const query = this.buildQueryData(sortedQueries);

    return {
      queryResponse,
      query,
    }
  }

  /// Sorts queries in order of blockNumber, address, and slot
  private sortQueries(): QueryRow[] {
    const sortBlockNumber = (a: number, b: number) => {
      return a - b;
    }

    const sortAddress = (a: `0x${string}` | null, b: `0x${string}` | null) => {
      if (a === null && b === null) {
        return 0;
      } else if (a === null) {
        return -1;
      } else if (b === null) {
        return 1;
      }
      return parseInt(a, 16) - parseInt(b, 16);
    }

    const sortSlot = (a: ethers.BigNumberish | null, b: ethers.BigNumberish | null) => {
      if (a === null && b === null) {
        return 0;
      } else if (a === null) {
        return -1;
      } else if (b === null) {
        return 1;
      }
      return parseInt(a.toString(), 16) - parseInt(b.toString(), 16);
    }

    return this.queries.sort((a, b) => {
      // Sorts by blockNumber, then address, then slot
      return sortBlockNumber(a.blockNumber, b.blockNumber) 
      || sortAddress(a.address, b.address)
      || sortSlot(a.slot, b.slot);
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
    let blockNumberToBlock: {[key: string]: ethers.Block | null} = {};
    let blockNumberAccountToAccount: {[key: string]: any | null} = {};
    let blockNumberAccountStorageToValue: {[key: string]: any | null} = {};

    for (let i = 0; i < sortedQueries.length; i++) {
      const blockNumber = sortedQueries[i].blockNumber;
      blockNumberToBlock[`${blockNumber}`] = null;

      const address = sortedQueries[i].address;
      if (address !== null) {
        blockNumberAccountToAccount[`${blockNumber},${address}`] = null;
      }

      const slot = sortedQueries[i].slot;
      if (address !== null && slot !== null && sortedQueries[i].value !== undefined) {
        blockNumberAccountStorageToValue[`${blockNumber},${address},${slot}`] = sortedQueries[i].value;
      }
    }

    // Get all of the block hashes
    for (const blockNumberStr of Object.keys(blockNumberToBlock)) {
      const blockNumber = parseInt(blockNumberStr);
      const block = await this.provider.getBlock(blockNumber);

      if (block === null || block.hash === null) {
        throw new Error(`Could not get block ${blockNumber} from provider ${this.config.providerUri}`);
      }
      blockNumberToBlock[blockNumber] = block;
    }

    // Get all of the data for the accounts
    for (const blockNumberAccountStr of Object.keys(blockNumberAccountToAccount)) {
      const [blockNumberStr, address] = blockNumberAccountStr.split(",");
      const blockNumber = parseInt(blockNumberStr);
      const account = await getAccountData(blockNumber, address as `0x${string}`, this.provider);
      blockNumberAccountToAccount[blockNumberAccountStr] = account;
    }

    // Calculate each of the column responses and append them to each column
    let blockResponseColumn: string[] = [];
    let accountResponseColumn: string[] = [];
    let storageResponseColumn: string[] = [];

    for (let i = 0; i < sortedQueries.length; i++) {
      const blockNumber = sortedQueries[i].blockNumber;
      if (blockNumber === null) {
        throw new Error(`Block number cannot be '0' for queries within this set of rows. Row: ${i}`);
      }

      const block = blockNumberToBlock[blockNumber.toString()];
      if (block === null) {
        throw new Error(`Could not find get ${blockNumber} in mapping of blocks`);
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
        const accountData = blockNumberAccountToAccount[`${blockNumber},${address}`];
        const nonce = accountData?.nonce;
        const balance = accountData?.balance;
        const storageHash = accountData?.storageHash;
        const codeHash = accountData?.codeHash;
        if (nonce === undefined || balance === undefined || storageHash === undefined || codeHash === undefined) {
          throw new Error(`Could not find account data for ${address} at block ${blockNumber}`);
        }

        // Calculate keccakFullAccountResponse
        const fullAccountResponse = getFullAccountResponse(blockNumber, address, nonce, balance, storageHash, codeHash);
        accountResponseColumn.push(fullAccountResponse);

        const slot = sortedQueries[i].slot;
        if (slot === null) {
          storageResponseColumn.push(zeroBytes(32));
        } else {
          const value = blockNumberAccountStorageToValue[`${blockNumber},${address},${slot}`];

          // Calculate keccakFullStorageResponse
          const fullStorageResponse = getFullStorageResponse(blockNumber, address, slot, value);
          storageResponseColumn.push(fullStorageResponse);
        }
      }
    }

    // Fill in the remaining unused rows in the columns with zeros
    const numUnused = this.maxSize - sortedQueries.length;
    blockResponseColumn = blockResponseColumn.concat(Array(numUnused).fill(zeroBytes(32)));
    accountResponseColumn = accountResponseColumn.concat(Array(numUnused).fill(zeroBytes(32)));
    storageResponseColumn = storageResponseColumn.concat(Array(numUnused).fill(zeroBytes(32)));

    // Calculate the merkle root for each column
    const blockResponseRoot = getKeccakMerkleRoot(blockResponseColumn);
    const accountResponseRoot = getKeccakMerkleRoot(accountResponseColumn);
    const storageResponseRoot = getKeccakMerkleRoot(storageResponseColumn);

    // Calculate the queryResponse
    const queryResponse = keccak256(concatHexStrings(blockResponseRoot, accountResponseRoot, storageResponseRoot));
    return queryResponse
  }

  /// Builds an RLP-encoded queryData blob from the sorted queries
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
      const encodedQuery = encodeQuery(length, blockNumber, address, slot, value);
      encodedQueries.push(encodedQuery);
    }

    // Finally return all of the encoded query data
    return encodeQueryData(versionIdx, numQueries, encodedQueries);
  }
}