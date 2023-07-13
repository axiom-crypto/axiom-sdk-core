import axios, { HttpStatusCode } from "axios";
import { BlockHashWitness } from "../shared/types";
import { InternalConfig } from "./internalConfig";
import { SDK_VERSION } from "../version";

export class Block {
  private readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  private async getRequest(endpoint: string, blockNumber: number) {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const uri = `${baseUrl}${endpoint}`;
    try {
      const result = await axios.get(uri, {
        params: {
          blockNumber,
          mock: this.config.mock,
          chainId: this.config.chainId,
        },
        headers: {
          "x-axiom-api-key": this.config.apiKey,
          "x-provider-uri": this.config.providerUri,
          "User-Agent": 'axiom-sdk-ts/' + SDK_VERSION,
        }
      });
      return result.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getBlockHashWitness(blockNumber: number): Promise<BlockHashWitness | null> {
    const endpoint = this.config.getConstants().Endpoints.GetBlockHashWitness;
    const data = await this.getRequest(endpoint, blockNumber);
    return data?.blockHashWitness ?? null;
  }

  async getBlockMerkleProof(blockNumber: number): Promise<string[] | null> {
    const endpoint = this.config.getConstants().Endpoints.GetBlockMerkleProof;
    const data = await this.getRequest(endpoint, blockNumber);
    return data?.merkleProof ?? null;
  }

  async getBlockRlpHeader(blockNumber: number): Promise<string | null> {
    const endpoint = this.config.getConstants().Endpoints.GetBlockRlpHeader;
    const data = await this.getRequest(endpoint, blockNumber);
    return data ?? null;
  }

  async getBlockParams(blockNumber: number): Promise<any | null> {
    const endpoint = this.config.getConstants().Endpoints.GetBlockParams;
    const data = await this.getRequest(endpoint, blockNumber);
    return data ?? null;
  }

  async getBlockMmrProof(blockNumber: number): Promise<any | null> {
    const endpoint = this.config.getConstants().Endpoints.GetBlockMmrProof;
    const data = await this.getRequest(endpoint, blockNumber);
    return data ?? null;
  }
}
