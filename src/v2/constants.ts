import { ethers } from "ethers";

const VKEY_LEN = 10;
const PROOF_LEN = 10;

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGas: "0x09184e72a000",
  DefaultCallbackGasLimit: 300_000,
  MaxOutputs: 5,
  VkeyLen: VKEY_LEN,
  ProofLen: PROOF_LEN,

  QueryBaseFeeGwei: 5000000,
  SubqueryHeaderFeeGwei: 1000000,
  SubqueryAccountFeeGwei: 1000000,
  SubqueryStorageFeeGwei: 1000000,
  SubqueryTxFeeGwei: 1000000,
  SubqueryReceiptFeeGwei: 1000000,
  SubquerySolidityNestedMappingFeeGwei: 1000000,
  SubqueryBeaconFeeGwei: 1000000,

  EmptyComputeQuery: "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
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
  }
});