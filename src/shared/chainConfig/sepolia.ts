import { AxiomV2CircuitConstant } from "@axiom-crypto/tools";
import { Endpoints, Path } from "../endpoints";

export let versionDataSepolia: any = {
  v0: {
    Addresses: {
      Axiom: "",
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
      Axiom: "",
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
      Axiom: "",
      AxiomQuery: "",
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
      Axiom: "0xbCBa296B560FA58c15eC220df1353B8Ab8c7A419",
      AxiomQuery: "0xb3034090C3A2BE1194e271C7850E1137D1Ad007f",
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
      MaxQuerySize: AxiomV2CircuitConstant.UserMaxSubqueries,
      QueryEncodingVersion: 2,
    },
  },
};

export let versionOverrideSepoliaMock: any = {
  v1: {
    Addresses: {
      Axiom: "",
      AxiomQuery: "",
    },
  },
  v2: {
    Addresses: {
      Axiom: "0x69963768F8407dE501029680dE46945F838Fc98B",
      AxiomQuery: "0x83c8c0B395850bA55c830451Cfaca4F2A667a983",
    },
  },
};
