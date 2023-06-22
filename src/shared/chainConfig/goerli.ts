import { Endpoints } from "../endpoints";

export let versionDataGoerli: any = {
  v0: {
    Addresses: {
      Axiom: "",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-staging.vercel.app/v0",
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
      Axiom: "",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-staging.vercel.app/v0_2",
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
      Axiom: "0x8eb3a522cab99ed365e450dad696357de8ab7e9d",
      AxiomQuery: "0x82842F7a41f695320CC255B34F18769D68dD8aDF",
    },
    Urls: {
      ApiBaseUrl: "https://axiom-api-staging.vercel.app/v1",
      ApiQueryUrl: "https://axiom-api-staging.vercel.app/query",
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
