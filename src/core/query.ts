import axios, { HttpStatusCode } from "axios";
import { AxiomConfig, QueryData, ResponseTree, SolidityAccountResponse, SolidityBlockResponse, SolidityStorageResponse } from "..";
import { Constants } from "../shared/constants";
import { getBlockResponse, getFullAccountResponse, getFullStorageResponse } from "../query/response";
import { ZeroHash, keccak256 } from "ethers";
import MerkleTree from "merkletreejs";
import { encodeRowHash } from "../query/encoder";
import { BigNumberish } from "ethers";

export class Query {
  private readonly providerUri: string;
  private readonly apiKey: string;
  private readonly chainId: number;
  private readonly version: string;

  constructor(config: AxiomConfig) {
    this.providerUri = config.providerUri;
    this.apiKey = config.apiKey;
    this.chainId = config.chainId ?? 1;
    this.version = config.version as string;
  }

  private async getDataForQuery(
    queryHash: string,
  ): Promise<QueryData[] | undefined> {
    const baseUrl = Constants(this.version).Urls.ApiQueryUrl;
    const endpoint = Constants(this.version).Endpoints.GetDataForQuery;
    const uri = `${baseUrl}${endpoint}`;
    const contractAddress = Constants(this.version).Addresses.AxiomQuery
    const result = await axios.get(uri, {
      params: { queryHash, chainId: this.chainId, contractAddress },
      headers: {
        "x-axiom-api-key": this.apiKey,
        "x-provider-uri": this.providerUri,
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
    const numUnused = Constants(this.version).Values.MaxQuerySize - blockResponseColumn.length;
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
}