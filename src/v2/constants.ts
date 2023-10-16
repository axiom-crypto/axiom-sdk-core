import { ethers } from "ethers";

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGas: "0x05d21dba00",
  DefaultCallbackGasLimit: 200000,
  DefaultDataQueryCalldataGasLimit: 100000,

  ProofGas: 400000,
  AxiomQueryBaseFeeGwei: 3000000,

  EmptyComputeQuery:
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  EmptyBytes4: "0x00000000",
  EmptyComputeQueryObject: {
    k: 0,
    resultLen: 0,
    vkey: [] as string[],
    computeProof: "0x00",
  },
  EmptyCallbackObject: {
    callbackAddr: ethers.ZeroAddress,
    callbackFunctionSelector: "0x00000000",
    resultLen: 0,
    callbackExtraData: ethers.ZeroHash,
  },
});
