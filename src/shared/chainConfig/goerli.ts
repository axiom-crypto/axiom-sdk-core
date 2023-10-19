import { AxiomV2CircuitConstant } from "@axiom-crypto/tools";
import { Endpoints, Path } from "../endpoints";

export let versionDataGoerli: any = {
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
      Axiom: "0x8d41105949fc6C418DfF1A76Ff5Ae69128Ade55a",
      AxiomQuery: "0x4Fb202140c5319106F15706b1A69E441c9536306",
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
      Axiom: "",
      AxiomQuery: "0x0aa81B0b21C72AfE5cb2Cd63cA7882FD8Ef0D36b",
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
  }
};

export let versionOverrideGoerliMock: any = {
  v1: {
    Addresses: {
      Axiom: "0x8d41105949fc6C418DfF1A76Ff5Ae69128Ade55a",
      AxiomQuery: "0x4Fb202140c5319106F15706b1A69E441c9536306",
    },
  },
  v2: {
    Addresses: {
      Axiom: "",
      AxiomQuery: "0x28CeE427fCD58e5EF1cE4C93F877b621E2Db66df",
    },
  },
};
