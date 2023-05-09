import axios, { HttpStatusCode } from "axios";
import { Constants, VersionsType } from "../shared/constants";
import { AxiomConfig, BlockHashWitness } from "../shared/types";

export class Merkle {
  private readonly providerUri: string;
  private readonly version: string;

  constructor(readonly config: AxiomConfig) {
    this.providerUri = config.providerUri;
    this.version = config.version as string;
  }

  async getBlockMerkleProof(blockNumber: number): Promise<BlockHashWitness | null> {
    const baseUrl = Constants[this.version].Urls.ApiBaseUrl;
    const endpoint = Constants[this.version].Endpoints.GetBlockMerkleProof;
    const uri = `${baseUrl}${endpoint}}`;
    const result = await axios.post(uri, {
      blockNumber,
      providerUri: this.providerUri,
    });
    if (result?.status === HttpStatusCode.Ok) {
      if (result?.data?.data?.blockHashWitness !== undefined) {
        return result.data.data.blockHashWitness;
      }
    }
    return null;
  }
}
