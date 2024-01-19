import { Endpoints, Path } from "../endpoints";

export let versionDataMainnet: any = {
  v0: {
    Addresses: {
      Axiom: "0x2251c204749e18a0f9A7a90Cff1b554F8d492b3c",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v0",
    },
    Endpoints: {
      GetBlockHashWitness: Endpoints.GetBlockHashWitness,
      GetBlockMerkleProof: Endpoints.GetBlockMerkleProof,
      GetBlockParams: Endpoints.GetBlockParams,
      GetBlockRlpHeader: Endpoints.GetBlockRlpHeader,
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
      GetBlockHashWitness: Endpoints.GetBlockHashWitness,
      GetBlockMerkleProof: Endpoints.GetBlockMerkleProof,
      GetBlockParams: Endpoints.GetBlockParams,
      GetBlockRlpHeader: Endpoints.GetBlockRlpHeader,
      GetBlockMmrProof: Endpoints.GetBlockMmrProof,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 1,
    },
  },
  v1: {
    Addresses: {
      Axiom: "0x33ea514cc54b641ad8b84e4a31d311f3722d1bb5",
      AxiomQuery: "0xd617ab7f787adf64c2b5b920c251ea10cd35a952",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v1",
    },
    Endpoints: {
      GetBlockHashWitness: Path.Block + Endpoints.GetBlockHashWitness,
      GetBlockMerkleProof: Path.Block + Endpoints.GetBlockMerkleProof,
      GetBlockParams: Path.Block + Endpoints.GetBlockParams,
      GetBlockRlpHeader: Path.Block + Endpoints.GetBlockRlpHeader,
      GetBlockMmrProof: Path.Block + Endpoints.GetBlockMmrProof,
      GetAllQueries: Path.Query + Endpoints.GetAllQueries,
      GetDataForQuery: Path.Query + Endpoints.GetDataForQuery,
      GetQueryCount: Path.Query + Endpoints.GetQueryCount,
      GetQueryData: Path.Query + Endpoints.GetQueryData,
      GetQuery: Path.Query + Endpoints.GetQuery,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 1,
    },
  },
  v2: {
    Addresses: {
      Axiom: "0x69963768F8407dE501029680dE46945F838Fc98B",
      AxiomQuery: "0x83c8c0B395850bA55c830451Cfaca4F2A667a983",
    },
    Urls: {
      ApiBaseUrl: "https://api.axiom.xyz/v2",
    },
    Endpoints: {
      GetBlockHashWitness: Path.Block + Endpoints.GetBlockHashWitness,
      GetBlockMerkleProof: Path.Block + Endpoints.GetBlockMerkleProof,
      GetBlockParams: Path.Block + Endpoints.GetBlockParams,
      GetBlockRlpHeader: Path.Block + Endpoints.GetBlockRlpHeader,
      GetBlockMmrProof: Path.Block + Endpoints.GetBlockMmrProof,
      GetAllQueries: Path.Query + Endpoints.GetAllQueries,
      GetDataForQuery: Path.Query + Endpoints.GetDataForQuery,
      GetQueryCount: Path.Query + Endpoints.GetQueryCount,
      GetQueryData: Path.Query + Endpoints.GetQueryData,
      GetQuery: Path.Query + Endpoints.GetQuery,
    },
    Values: {
      MaxQuerySize: 64,
      QueryEncodingVersion: 2,
    },
  }
};

export let versionOverrideMainnetMock: any = {
  v1: {
    Addresses: {
      Axiom: "0x33ea514cc54b641ad8b84e4a31d311f3722d1bb5",
      AxiomQuery: "0xd617ab7f787adf64c2b5b920c251ea10cd35a952",
    },
  },
  v2: {
    Addresses: {
      Axiom: "0x69963768F8407dE501029680dE46945F838Fc98B",
      AxiomQuery: "0x83c8c0B395850bA55c830451Cfaca4F2A667a983",
    },
  },
};
