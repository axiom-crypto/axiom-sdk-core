import axios, { HttpStatusCode } from "axios";
import { 
  KeccakResponses,
  QueryData,
  ResponseTree,
  SolidityAccountResponse,
  SolidityBlockResponse,
  SolidityStorageResponse,
  ValidationWitnessResponse,
  decodePackedQuery
} from "..";
import { ethers } from "ethers";
import { encodeRowHash } from "../query/encoder";
import { BigNumberish } from "ethers";
import { getAxiomQueryAbiForVersion } from "./lib/abi";
import { QueryBuilder } from "../query/queryBuilder";
import { InternalConfig } from "./internalConfig";
import { 
  getBlockResponse,
  getFullAccountResponse,
  getFullStorageResponse
} from "../query/response";
import { SDK_VERSION } from "../version";

export class Query {
  private readonly config: InternalConfig;

  /**
   * @param config Axiom internal configuration parameters
   */
  constructor(config: InternalConfig) {
    this.config = config;
  }

  /**
   * Calls the API to get the QueryData rows for a given Query. Requires either one of 
   * keccakQueryResponse or queryHash to be specified.
   * @param keccakQueryResponse (optional) A keccak256 hash of the entire query data blob
   * @param queryHash (optional) A keccak256 hash of the entire query data blob
   * @returns QueryData[] | undefined
   */
  private async getDataForQuery(
    keccakQueryResponse?: string,
    queryHash?: string
  ): Promise<QueryData[] | undefined> {
    if (keccakQueryResponse === undefined && queryHash === undefined) {
      throw new Error("Must specify either keccakQueryResponse or queryHash");
    }
    if (keccakQueryResponse !== undefined && queryHash !== undefined) {
      throw new Error("Cannot specify both keccakQueryResponse and queryHash");
    }
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetDataForQuery;
    const uri = `${baseUrl}${endpoint}`;
    const contractAddress = this.config.getConstants().Addresses.AxiomQuery;
    const headers = {
      "x-axiom-api-key": this.config.apiKey,
      "x-provider-uri": this.config.providerUri,
      "User-Agent": 'axiom-sdk-ts/' + SDK_VERSION,
    }
    let params;
    if (keccakQueryResponse !== undefined) {
      params = {
        keccakQueryResponse,
        chainId: this.config.chainId,
        contractAddress,
        mock: this.config.mock,
      }
    } else {
      params = {
        queryHash,
        chainId: this.config.chainId,
        contractAddress,
        mock: this.config.mock,
      }
    }
    const result = await axios.get(uri, { params, headers });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data !== undefined) {
        return result.data;
      }
    }
    return undefined;
  }

  /**
   * Gets parsed transaction logs from a transaction hash
   * @param txHash Transaction hash from the `sendQuery` call
   * @returns (ethers.LogDescription | null)[]
   */
  private async getTxLogsForTxHash(txHash: string): Promise<(ethers.LogDescription | null)[]> {
    let tx = await this.config.provider.getTransactionReceipt(txHash);
    if (!tx) {
      throw new Error(
        "Could not find transaction (ensure you are using the tx hash of the `sendQuery` transaction)"
      );
    }
    let contract = new ethers.Contract(
      this.config.getConstants().Addresses.Axiom,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.provider
    );
    let logs = tx.logs.map((log) => 
      contract.interface.parseLog({ data: log.data, topics: log.topics as string[] })
    );
    return logs;
  }

  /**
   * Gets parsed transaction description from a transaction hash
   * @param txHash Transaction hash from the `sendQuery` call
   * @returns ethers.TransactionDescription | null
   */
  private async getTxDecodedForTxHash(txHash: string): Promise<(ethers.TransactionDescription | null)> {
    let tx = await this.config.provider.getTransaction(txHash);
    if (!tx) {
      throw new Error(
        "Could not find transaction (ensure you are using the tx hash of the `sendQuery` transaction)"
      );
    }
    let contract = new ethers.Contract(
      this.config.getConstants().Addresses.Axiom,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.provider
    );
    let decodedTx = contract.interface.parseTransaction({ data: tx.data, value: tx.value });
    return decodedTx;
  }

  /**
   * Gets a `ResponseTree` for a given queryHash
   * @param keccakQueryResponse A keccak256 hash calculated from the Query
   * @returns ResponseTree
   */
  async getResponseTreeForKeccakQueryResponse(
    keccakQueryResponse: string,
  ): Promise<ResponseTree> {
    keccakQueryResponse = keccakQueryResponse.toLowerCase();
    const data = await this.getDataForQuery(keccakQueryResponse);
    if (data === undefined) {
      throw new Error(`Could not find query data for ${keccakQueryResponse}`);
    }
    let qb = new QueryBuilder(this.config);
    const responseTree = qb.buildResponseTree(data);
    return responseTree;
  }

  /**
   * Gets a `ResponseTree` for a given queryHash
   * @param queryHash A keccak256 hash of the entire query data blob
   * @returns ResponseTree
   */
  async getResponseTreeForQueryHash(
    queryHash: string,
  ): Promise<ResponseTree> {
    queryHash = queryHash.toLowerCase();
    const data = await this.getDataForQuery(undefined, queryHash);
    if (data === undefined) {
      throw new Error(`Could not find query data for ${queryHash}`);
    }
    let qb = new QueryBuilder(this.config);
    const responseTree = qb.buildResponseTree(data);
    return responseTree;
  }

  /**
   * Gets a ValidationWitnessResponse, which contains the blockResponse, accountResponse, 
   * and storageResponse
   * @param responseTree A `ResponseTree` object
   * @param blockNumber The block number to get the witness for
   * @param address (optional) the address to get the witness for
   * @param slot (optional) the slot to get the witness for
   * @returns ValidationWitnessResponse | undefined
   */
  getValidationWitness(
    responseTree: ResponseTree,
    blockNumber: number,
    address?: string,
    slot?: BigNumberish
  ): ValidationWitnessResponse | undefined {
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

  /**
   * Gets a keccakQueryResponse from the transaction hash (from the `sendQuery` call)
   * @param txHash Transaction hash from the `sendQuery` call
   * @returns keccakQueryResponse | undefined
   */
  async getKeccakQueryResponseFromTxHash(txHash: string): Promise<string | undefined> {
    let logs = await this.getTxLogsForTxHash(txHash);
    return logs[0]?.args?.keccakQueryResponse;
  }

  /**
   * Gets a queryHash from a the transaction hash (from the `sendQuery` call)
   * @param txHash Transaction hash from the `sendQuery` call
   * @returns keccakQueryResponse | undefined
   */
  async getQueryHashFromTxHash(txHash: string): Promise<string | undefined> {
    let logs = await this.getTxLogsForTxHash(txHash);
    return logs[0]?.args?.queryHash;
  }

  /**
   * Gets a ResponseTree by passing in the transaction hash (from the `sendQuery` call)
   * @param txHash Transaction hash from the `sendQuery` call
   * @returns ResponseTree
   */
  async getResponseTreeFromTxHash(txHash: string): Promise<ResponseTree> {
    let decodedTx = await this.getTxDecodedForTxHash(txHash);
    let query = decodedTx?.args.query;
    let decodedQuery = decodePackedQuery(query);
    if (!decodedQuery) {
      throw new Error(
        "Could not find query in transaction (ensure you are using the tx hash of the `sendQuery` transaction)"
      );
    }

    let qb = new QueryBuilder(this.config);
    const queryData = await qb.getQueryDataFromRows(decodedQuery.body);
    const responseTree = qb.buildResponseTree(queryData);

    return responseTree;
  }

  /**
   * Convenience function for getting the `KeccakResponses` from a `ResponseTree`
   * @param responseTree A `ResponseTree` object
   * @returns KeccakResponses
   */
  getResponses(responseTree: ResponseTree): KeccakResponses {
    return {
      keccakBlockResponse: responseTree.blockTree.getHexRoot(),
      keccakAccountResponse: responseTree.accountTree.getHexRoot(),
      keccakStorageResponse: responseTree.storageTree.getHexRoot(),
    }
  }

  /**
   * A passthrough function that identifies the hash function used in `getBlockResponse`
   * @param blockHash Block hash of the block to use
   * @param blockNumber Block number of the block to use
   * @returns string - Keccak hash of the block response
   */
  getKeccakBlockResponse(
    blockHash: string, 
    blockNumber: number
  ): string {
    return getBlockResponse(blockHash, blockNumber);
  }

  /**
   * A passthrough function that identifies the hash function used in `getAccountResponse`
   * @param blockNumber Block number of the block to use
   * @param address Address of the account to use
   * @param nonce Nonce of the account
   * @param balance Balance of the account
   * @param storageRoot Storage root (aka storage hash) of the account
   * @param codeHash Code hash of the account
   * @returns string - Keccak hash of the account response
   */
  getKeccakAccountResponse(
    blockNumber: number,
    address: string,
    nonce: BigNumberish,
    balance: BigNumberish,
    storageRoot: string,
    codeHash: string
  ): string {
    return getFullAccountResponse(blockNumber, address, nonce, balance, storageRoot, codeHash);
  }

  /**
   * A passthrough function that identifies the hash function used in `getStorageResponse`
   * @param blockNumber Block number of the block to use
   * @param address Address of the account to use
   * @param slot Slot of the storage in the account
   * @param value Value at that slot
   * @returns string - Keccak hash of the storage response
   */
  getKeccakStorageResponse(
    blockNumber: number,
    address: string,
    slot: BigNumberish,
    value: BigNumberish
  ): string {
    return getFullStorageResponse(blockNumber, address, slot, value);
  }
}