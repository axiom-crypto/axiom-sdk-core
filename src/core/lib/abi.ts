import { ethers } from "ethers";
import AxiomV1QueryAbi from "./abi/AxiomV1Query.json";
import AxiomV2QueryAbi from "./abi/AxiomV2Query.json";

export function getAxiomQueryAbiForVersion(
  version: string
): ethers.InterfaceAbi {
  switch (version) {
    case "v1":
      return AxiomV1QueryAbi.abi;
    case "v2":
      return AxiomV2QueryAbi.abi;
    default:
      throw new Error(`Version ${version} does not have a Query ABI`);
  }
}
