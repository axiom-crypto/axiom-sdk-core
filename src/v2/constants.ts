import { ethers } from "ethers";
import { AxiomV2Callback, AxiomV2ComputeQuery, DataSubqueryCount } from "./types";

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGasWei: "25000000000",
  DefaultCallbackGasLimit: 200000,
  DefaultOverrideAxiomQueryFee: "0",
  DefaultDataQueryCalldataGasWarningThreshold: 100000,

  FallbackProofVerificationGas: 550000n,
  FallbackAxiomQueryFeeWei: 3000000000000000n,

  QueryInitiatedOnchainSchema: "0xb72b05c090ac4ae9ec18b7e708d597093716f98567026726f6f5d9f172316178",
  QueryInitiatedWithIpfsDataSchema: "0xf3a2958f23705cbc6bbc0922c0af3c82b76d93e8acc5c17ef86736cf4563fb85",

  MaxDataQuerySize: 128,
  MaxSameSubqueryType: 128,

  EmptyComputeQueryObject: {
    k: 0,
    resultLen: 0,
    vkey: [] as string[],
    computeProof: "0x00",
  } as AxiomV2ComputeQuery,
  EmptyCallbackObject: {
    target: ethers.ZeroAddress,
    extraData: ethers.ZeroHash,
  } as AxiomV2Callback,
  EmptyDataSubqueryCount: {
    total: 0,
    header: 0,
    account: 0,
    storage: 0,
    transaction: 0,
    receipt: 0,
    solidityNestedMapping: 0,
  } as DataSubqueryCount,

  Bytes32Max: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
});
