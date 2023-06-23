import axios, { HttpStatusCode } from "axios";
import { 
  QueryData,
  ResponseTree,
  SolidityAccountResponse,
  SolidityBlockResponse,
  SolidityStorageResponse,
  decodePackedQuery
} from "..";
import { Constants } from "../shared/constants";
import { ethers } from "ethers";
import { encodeRowHash } from "../query/encoder";
import { BigNumberish } from "ethers";
import { getAxiomQueryAbiForVersion } from "./lib/abi";
import { QueryBuilder } from "../query/queryBuilder";
import { Config } from "../shared/config";
import { 
  getBlockResponse,
  getFullAccountResponse,
  getFullStorageResponse
} from "../query/response";

export class Query {
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private async getDataForQuery(
    queryHash: string,
  ): Promise<QueryData[] | undefined> {
    const baseUrl = Constants(this.config.version).Urls.ApiQueryUrl;
    const endpoint = Constants(this.config.version).Endpoints.GetDataForQuery;
    const uri = `${baseUrl}${endpoint}`;
    const contractAddress = Constants(this.config.version).Addresses.AxiomQuery
    const result = await axios.get(uri, {
      params: { queryHash, chainId: this.config.chainId, contractAddress },
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
  ): Promise<ResponseTree> {
    queryHash = queryHash.toLowerCase();
    const data = await this.getDataForQuery(queryHash);
    if (data === undefined) {
      throw new Error(`Could not find query data for ${queryHash}`);
    }
    let qb = new QueryBuilder(this.config);
    const responseTree = qb.buildResponseTree(data);
    return responseTree;

  }

  getValidationWitness(
    responseTree: ResponseTree,
    blockNumber: number,
    address?: string,
    slot?: BigNumberish
  ): {
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

  async getQueryHashFromTxHash(txHash: string): Promise<string> {
    let tx = await this.config.provider.getTransactionReceipt(txHash);
    if (!tx) {
      throw new Error("Could not find transaction");
    }
    let contract = new ethers.Contract(
      Constants(this.config.version).Addresses.Axiom,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.provider
    );
    let logs = tx.logs.map((log) => contract.interface.parseLog({ data: log.data, topics: log.topics as string[] }));
    return logs[0]?.args?.queryHash;
  }

  async getResponseTreeFromTxHash(txHash: string): Promise<ResponseTree> {
    let tx = await this.config.provider.getTransaction(txHash);
    if (!tx) {
      throw new Error("Could not find transaction");
    }
    let contract = new ethers.Contract(
      Constants(this.config.version).Addresses.Axiom,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.provider
    );
    let decodedTx = contract.interface.parseTransaction({ data: tx.data, value: tx.value });
    let query = decodedTx?.args.query;
    let decodedQuery = decodePackedQuery(query);
    if (!decodedQuery) {
      throw new Error("Could not find query in transaction");
    }

    let qb = new QueryBuilder(this.config);
    const queryData = await qb.getQueryDataFromRows(decodedQuery.body);
    const responseTree = qb.buildResponseTree(queryData);

    return responseTree;
  }

  /// Passthrough appropriately-named user-facing function for getting the block response
  getKeccakBlockResponse(
    blockHash: string, 
    blockNumber: number
  ): string {
    return getBlockResponse(blockHash, blockNumber);
  }

  /// Passthrough appropriately-named user-facing function for getting the full account response.
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

  /// Passthrough appropriately-named user-facing function for getting the full storage response.
  getKeccakStorageResponse(
    blockNumber: number,
    address: string,
    slot: BigNumberish,
    value: BigNumberish
  ): string {
    return getFullStorageResponse(blockNumber, address, slot, value);
  }
}