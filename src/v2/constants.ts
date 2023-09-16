import { ethers } from "ethers";
import { DataQueryRequestV2 } from "./types";

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
    computeProof: "0x00",
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
  TxTxTypeFieldIdx: 51,
  TxBlockNumberFieldIdx: 52,
  TxTxIndexFieldIdx: 53,
  TxFunctionSelectorFieldIdx: 54,
  TxNoCalldataSelectorIdx: 55,
  TxContractDeploySelectorIdx: 56,
  TxCalldataHashFieldIdx: 57,

  ReceiptFieldIdxOffset: 0,
  ReceiptLogIdxOffset: 100,
  ReceiptTopicIdxOffset: 0,
  ReceiptDataIdxOffset: 100,
  ReceiptAddressIdx: 50,
  ReceiptTxTypeFieldIdx: 51,
  ReceiptBlockNumberFieldIdx: 52,
  ReceiptTxIndexFieldIdx: 53,
});

export function newEmptyDataQuery(): DataQueryRequestV2 {
  return {
    headerSubqueries: [],
    accountSubqueries: [],
    storageSubqueries: [],
    txSubqueries: [],
    receiptSubqueries: [],
    solidityNestedMappingSubqueries: [],
    beaconSubqueries: [],
  }
}