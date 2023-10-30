import { ethers } from "ethers";
import { AxiomV2Callback, AxiomV2ComputeQuery, DataSubqueryCount } from "./types";

export const ConstantsV2 = Object.freeze({
  DefaultMaxFeePerGas: "0x05d21dba00",
  DefaultCallbackGasLimit: 200000,
  DefaultDataQueryCalldataGasLimit: 100000,

  ProofGas: 400000,
  AxiomQueryBaseFeeGwei: 3000000,

  QueryInitiatedOnchainSchema: "0xb72b05c090ac4ae9ec18b7e708d597093716f98567026726f6f5d9f172316178",
  QueryInitiatedWithIpfsDataSchema: "0xf3a2958f23705cbc6bbc0922c0af3c82b76d93e8acc5c17ef86736cf4563fb85",

  MaxDataQuerySize: 32,
  MaxSameSubqueryType: 8, // enforced on all subquery types EXCEPT header

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
});
