import { ethers } from "ethers";

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGas: "0x05d21dba00",
  DefaultCallbackGasLimit: 200000,
  ProofGas: 500000,
  QueryBaseFeeGwei: 5000000,

  MaxOutputs: 5,

  EmptyComputeQuery:
    "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  EmptyBytes4: "0x00000000",
  EmptyComputeQueryObject: {
    k: 0,
    vkeyLen: 0,
    vkey: [] as string[],
    computeProof: "",
  },
  EmptyCallbackObject: {
    callbackAddr: ethers.ZeroAddress,
    callbackFunctionSelector: "0x00000000",
    resultLen: 0,
    callbackExtraData: ethers.ZeroHash,
  },

  TxFieldIdxOffset: 0,
  TxCalldataIdxOffset: 100,
  TxContractDataIdxOffset: 100000,
  ReceiptFieldIdxOffset: 0,
  ReceiptLogIdxOffset: 100,
  ReceiptTopicIdxOffset: 0,
  ReceiptAddressOffset: 50,
  ReceiptDataIdxOffset: 100,
});
