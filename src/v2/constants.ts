import { ethers } from "ethers";

const VKEY_LEN = 27;
const PROOF_LEN = 63;

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGas: "0x05d21dba00",
  DefaultCallbackGasLimit: 200000,
  ProofGas: 500000,
  QueryBaseFeeGwei: 5000000,

  MaxOutputs: 5,
  VkeyLen: VKEY_LEN,
  ProofLen: PROOF_LEN,

  EmptyComputeQuery:
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  EmptyBytes4: "0x00000000",
  EmptyComputeQueryObject: {
    k: 0,
    omega: ethers.ZeroHash,
    vkey: Array(VKEY_LEN).fill(ethers.ZeroHash),
    computeProof: Array(PROOF_LEN).fill(ethers.ZeroHash),
  },
  EmptyCallbackObject: {
    callbackAddr: ethers.ZeroAddress,
    callbackFunctionSelector: "0x00000000",
    resultLen: 0,
    callbackExtraData: ethers.ZeroHash,
  },
});
