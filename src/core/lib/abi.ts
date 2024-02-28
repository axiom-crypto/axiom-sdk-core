import { ethers } from "ethers";
import AxiomV2QueryAbi from "./abi/AxiomV2Query.json";

export function getAxiomQueryAbiForVersion(
  version: string
): ethers.InterfaceAbi {
  switch (version) {
    case "v2":
      return AxiomV2QueryAbi.abi;
    default:
      throw new Error(`Version ${version} does not have a Query ABI`);
  }
}
