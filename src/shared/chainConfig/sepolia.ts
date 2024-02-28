import { AxiomV2CircuitConstant } from "@axiom-crypto/tools";
import { Endpoints, Path } from "../endpoints";

export let versionDataSepolia: any = {
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
      MaxQuerySize: AxiomV2CircuitConstant.UserMaxSubqueries,
      QueryEncodingVersion: 2,
    },
  },
};

export let versionOverrideSepoliaMock: any = {
  v2: {
    Addresses: {
      Axiom: "0x69963768F8407dE501029680dE46945F838Fc98B",
      AxiomQuery: "0x83c8c0B395850bA55c830451Cfaca4F2A667a983",
    },
  },
};
