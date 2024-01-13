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
      Axiom: "",
      AxiomQuery: "0xD4E7469fdB3cAe2C85db4dacD44cb974757CbeD9",
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
      Axiom: "0xF57252Fc4ff36D8d10B0b83d8272020D2B8eDd55",
      AxiomQuery: "0x56A380e544606ad713A8A19BAc1903aa7C2017FF",
    },
  },
};
