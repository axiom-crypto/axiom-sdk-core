import axios, { HttpStatusCode } from "axios";
import { Constants } from "../shared/constants";
import { AxiomConfig, BlockHashWitness } from "../shared/types";

export class Block {
  private readonly providerUri: string;
  private readonly version: string;

  constructor(readonly config: AxiomConfig) {
    this.providerUri = config.providerUri;
    this.version = config.version as string;
  }

  async getBlockHashWitness(blockNumber: number): Promise<BlockHashWitness | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockHashWitness;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, { 
      params: { blockNumber },
      headers: { 
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.providerUri,
      } 
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data?.blockHashWitness !== undefined) {
        return result.data.data.blockHashWitness;
      }
    }
    return null;
  }

  async getBlockMerkleProof(blockNumber: number): Promise<string[] | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockMerkleProof;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, { 
      params: { blockNumber },
      headers: { 
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.providerUri,
      } 
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data?.merkleProof !== undefined) {
        return result.data.data.merkleProof;
      }
    }
    return null;
  }

  async getBlockRlpHeader(blockNumber: number): Promise<string | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockRlpHeader;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, { 
      params: { blockNumber },
      headers: { 
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.providerUri,
      } 
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data !== undefined) {
        return result.data.data;
      }
    }
    return null;
  }

  async getBlockParams(blockNumber: number): Promise<any | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockParams;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, { 
      params: { blockNumber },
      headers: { 
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.providerUri,
      } 
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data !== undefined) {
        return result.data.data;
      }
    }
    return null;
  }

  async getBlockMmrProof(blockNumber: number): Promise<any | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockMmrProof;
    const uri = `${baseUrl}${endpoint}`;
    const result = await axios.get(uri, { 
      params: { blockNumber },
      headers: { 
        "x-axiom-api-key": this.config.apiKey,
        "x-provider-uri": this.providerUri,
      } 
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data !== undefined) {
        return result.data.data;
      }
    }
    return null;
  }
}
