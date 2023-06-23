import { ethers } from "ethers";
import AxiomV0Abi from "./abi/AxiomV0.json";
import { abi as AxiomV02Abi } from "./abi/AxiomV02.json";
import { abi as AxiomV1Abi } from "./abi/AxiomV1Query.json";

export function getAbiForVersion(version: string): ethers.InterfaceAbi {
  switch (version) {
    case "v0":
      return AxiomV0Abi;
    case "v0_2":
      return AxiomV02Abi;
    case "v1":
      return AxiomV1Abi;
    default:
      throw new Error("Invalid ABI");
  }
}
