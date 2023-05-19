import { ethers, keccak256 } from "ethers";
import { Query } from "../shared/types";
import { getBlockResponse, getFullAccountResponse, getFullStorageResponse, getKeccakMerkleRoot } from "./response";
import { encodeQuery, encodeQueryData } from "./encoder";
import { Config } from "../shared/config";
import { concatHexStrings, getAccountData, zeroBytes } from "../shared/utils";
import { Versions } from "../shared/constants";

export class QueryBuilder {
  private queries: Query[] = [];
  private readonly config: Config;
  private readonly provider: ethers.JsonRpcProvider;

  constructor(
    private readonly maxSize: number,
    config: Config,
  ) {
    if ((maxSize & (maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
    this.config = new Config(config);
    this.provider = new ethers.JsonRpcProvider(this.config.providerUri);
  }

  /// Appends a `Query` to the current `QueryBuilder` instance. If the `QueryBuilder` 
  /// has reached its maximum size, then an error will be thrown.
  append(query: Query): void {
    if (this.queries.length >= this.maxSize) {
      throw new Error(`QueryBuilder has reached its maximum size of ${this.maxSize}. Either reduce the number of queries or pass in a larger size to QueryBuilder.`);
    }

    if (query.address === null && query.slot !== null) {
      throw new Error("If `slot` is specified, then `address` must not be null");
    }

    this.queries.push(query);
  }

  /// Gets the current number of `Query`s appended to the instance of `QueryBuilder`.
  getCurrentSize(): number {
    return this.queries.length;
  }

  /// Gets the maximum number of `Query`s that can be appended to the instance of 
  /// `QueryBuilder`.
  getMaxSize(): number {
    return this.maxSize;
  }

  /// Gets the current `Query` values as a formatted string.
  asFormattedString(): string {
    let str = "";
    for (let i = 0; i < this.queries.length; i++) {
      const query = this.queries[i];
      str += `Query ${i}: BlockNumber: ${query.blockNumber}, Address: ${query.address}, Slot: ${query.slot}\n`;
    }
    return str;
  }

  /// Builds the query response and query data to be sent to the Axiom contract.
  async build(): Promise<{queryResponse: string, queryData: string}> {
    if (this.queries.length === 0) {
      throw new Error("Cannot build query response and query data with no queries");
    }
    const queryResponse = await this.buildQueryResponse();
    const queryData = this.buildQueryData();

    return {
      queryResponse,
      queryData,
    }
  }

  private async buildQueryResponse(): Promise<string> {
    // Collapse blockNumber, account, and slot into hash table keys to reduce total 
    // number of JSON-RPC calls
    let blockNumberToBlock: {[key: string]: ethers.Block | null} = {};
    let blockNumberAccountToAccount: {[key: string]: any | null} = {};
    let blockNumberAccountStorageToValue: {[key: string]: any | null} = {};

    for (let i = 0; i < this.queries.length; i++) {
      const blockNumber = this.queries[i].blockNumber;
      blockNumberToBlock[`${blockNumber}`] = null;

      const address = this.queries[i].address;
      if (address !== null) {
        blockNumberAccountToAccount[`${blockNumber},${address}`] = null;
      }

      const slot = this.queries[i].slot;
      if (address !== null && slot !== null) {
        blockNumberAccountStorageToValue[`${blockNumber},${address},${slot}`] = null;
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

    // Get all of the storage slot data
    for (const blockNumberAccountStorageStr of Object.keys(blockNumberAccountStorageToValue)) {
      const [blockNumberStr, address, slotStr] = blockNumberAccountStorageStr.split(",");
      const blockNumber = parseInt(blockNumberStr);
      const slot = slotStr;
      const storageData = await this.provider.getStorage(address, slot, blockNumber);
      blockNumberAccountStorageToValue[blockNumberAccountStorageStr] = storageData;
    }

    // Calculate each of the column responses and append them to each column
    let blockResponseColumn: string[] = [];
    let accountResponseColumn: string[] = [];
    let storageResponseColumn: string[] = [];

    for (let i = 0; i < this.queries.length; i++) {
      const blockNumber = this.queries[i].blockNumber;
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

      const address = this.queries[i].address;
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

        const slot = this.queries[i].slot;
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
    const numUnused = this.maxSize - this.queries.length;
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

  private buildQueryData(): string {
    // Extra data that we'll encode with the query data 
    const numQueries = this.queries.length;
    const versionIdx = Versions.indexOf(this.config.version);

    const encodedQueries = [];
    for (let i = 0; i < numQueries; i++) {
      let length = 0;

      // Check for block number
      const blockNumber = this.queries[i].blockNumber;
      if (blockNumber === null) {
        const encodedQuery = encodeQuery(length, 0, "0", 0);
        encodedQueries.push(encodedQuery);
        continue;
      } 
      
      // Query has block number; check for address
      length++;
      const address = this.queries[i].address;
      if (address === null) {
        const encodedQuery = encodeQuery(length, blockNumber, "0", 0);
        encodedQueries.push(encodedQuery);
        continue;
      } 

      // Query has block number and address; check for slot
      length++;
      const slot = this.queries[i].slot;
      if (slot === null) {
        const encodedQuery = encodeQuery(length, blockNumber, address, 0);
        encodedQueries.push(encodedQuery);
        continue;
      } 

      // Query has all of the fields
      length++;
      const encodedQuery = encodeQuery(length, blockNumber, address, slot);
      encodedQueries.push(encodedQuery);
    }

    // Finally return all of the encoded query data
    return encodeQueryData(versionIdx, numQueries, encodedQueries);
  }
}