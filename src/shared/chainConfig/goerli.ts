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
      Axiom: "0x071b7aA74f060B40cB7EEE577c30E634276e7C9f",
      AxiomQuery: "0x507c2Bf1C9549cC158FFF428dfc7367E6f33E8C8",
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

export let versionOverrideGoerliMock: any = {
  v1: {
    Addresses: {
      Axiom: "0x8d41105949fc6C418DfF1A76Ff5Ae69128Ade55a",
      AxiomQuery: "0x4Fb202140c5319106F15706b1A69E441c9536306",
    },
  },
  v2: {
    Addresses: {
      Axiom: "0x2aE6ad6127C222f071C023086C442080B03AfCCe",
      AxiomQuery: "0xbEb34aBec311213bAAAFeed834079437c2a57e40",
    },
  },
};
