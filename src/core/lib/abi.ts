import { ethers } from "ethers";
import { abi as AxiomV1QueryAbi } from "./abi/AxiomV1Query.json";
import { abi as AxiomV2QueryAbi } from "./abi/AxiomV2Query.json";

export function getAxiomQueryAbiForVersion(
  version: string
): ethers.InterfaceAbi {
  switch (version) {
    case "v1":
      return AxiomV1QueryAbi;
    case "v2":
      return AxiomV2QueryAbi;
    default:
      throw new Error(`Version ${version} does not have a Query ABI`);
  }
}
