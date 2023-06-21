import { Endpoints } from "../endpoints";

export let versionDataMainnet: any = {
  v0: {
    Addresses: {
      Axiom: "0x2251c204749e18a0f9A7a90Cff1b554F8d492b3c",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v0",
    },
    Endpoints: {
      GetBlockHashWitness: Endpoints.getBlockHashWitness,
      GetBlockMerkleProof: Endpoints.getBlockMerkleProof,
      GetBlockParams: Endpoints.getBlockParams,
      GetBlockRlpHeader: Endpoints.getBlockRlpHeader,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 1,
    },
  },
  v0_2: {
    Addresses: {
      Axiom: "0xF990f9CB1A0aa6B51c0720a6f4cAe577d7AbD86A",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v0_2",
    },
    Endpoints: {
      GetBlockHashWitness: Endpoints.getBlockHashWitness,
      GetBlockMerkleProof: Endpoints.getBlockMerkleProof,
      GetBlockParams: Endpoints.getBlockParams,
      GetBlockRlpHeader: Endpoints.getBlockRlpHeader,
      GetBlockMmrProof: Endpoints.getBlockMmrProof,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 1,
    },
  },
  v1: {
    Addresses: {
      Axiom: "",
      AxiomQuery: "",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v1",
      ApiQueryUrl: "https://api.axiom.xyz/query",
    },
    Endpoints: {
      GetBlockHashWitness: Endpoints.getBlockHashWitness,
      GetBlockMerkleProof: Endpoints.getBlockMerkleProof,
      GetBlockParams: Endpoints.getBlockParams,
      GetBlockRlpHeader: Endpoints.getBlockRlpHeader,
      GetBlockMmrProof: Endpoints.getBlockMmrProof,
      GetAllQueries: Endpoints.getAllQueries,
      GetDataForQuery: Endpoints.getDataForQuery,
      GetQueryCount: Endpoints.getQueryCount,
      GetQueryData: Endpoints.getQueryData,
      GetQuery: Endpoints.getQuery,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 1,
    },
  },
};