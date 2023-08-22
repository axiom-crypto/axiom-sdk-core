import { ethers } from "ethers";

export const ConstantsV2 = Object.freeze({
  EmptyComputeQuery: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  EmptyBytes4: "0x00000000",
  EmptyComputeQueryObject: {
    k: 0,
    omega: ethers.ZeroHash,
    vkey: ethers.ZeroHash,
    resultLen: 0,
    computeProof: ethers.ZeroHash,
  },
  EmptyCallbackObject: {
    callbackAddr: ethers.ZeroAddress,
    callbackFunctionSelector: "0x00000000",
    callbackExtraData: ethers.ZeroHash,
  }
});