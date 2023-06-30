import axios, { HttpStatusCode } from "axios";
import { BlockHashWitness } from "../shared/types";
import { InternalConfig } from "./internalConfig";
import { SDK_VERSION } from "../version";

export class Block {
  private readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  async getBlockHashWitness(blockNumber: number): Promise<BlockHashWitness | null> {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetBlockHashWitness;
    const uri = `${baseUrl}${endpoint}`;
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
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.blockHashWitness !== undefined) {
        return result.data.blockHashWitness;
      }
    }
    return null;
  }

  async getBlockMerkleProof(blockNumber: number): Promise<string[] | null> {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetBlockMerkleProof;
    const uri = `${baseUrl}${endpoint}`;
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
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.merkleProof !== undefined) {
        return result.data.merkleProof;
      }
    }
    return null;
  }

  async getBlockRlpHeader(blockNumber: number): Promise<string | null> {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetBlockRlpHeader;
    const uri = `${baseUrl}${endpoint}`;
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
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data !== undefined) {
        return result.data;
      }
    }
    return null;
  }

  async getBlockParams(blockNumber: number): Promise<any | null> {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetBlockParams;
    const uri = `${baseUrl}${endpoint}`;
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
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data !== undefined) {
        return result.data;
      }
    }
    return null;
  }

  async getBlockMmrProof(blockNumber: number): Promise<any | null> {
    const baseUrl = this.config.getConstants().Urls.ApiBaseUrl;
    const endpoint = this.config.getConstants().Endpoints.GetBlockMmrProof;
    const uri = `${baseUrl}${endpoint}`;
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
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data !== undefined) {
        return result.data;
      }
    }
    return null;
  }
}
