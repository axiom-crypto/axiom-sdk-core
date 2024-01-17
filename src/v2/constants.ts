import { ethers } from "ethers";
import { AxiomV2Callback, AxiomV2ComputeQuery, DataSubqueryCount } from "./types";

export enum SubqueryConfig {
  Default,  // Catch-all for anything below `Large` size
  AllLarge,
  AllMax,
}

export enum TxSizeCategory {
  Default,
  Large,
  Max,
}

export enum ReceiptSizeCategory {
  Default,
  Medium,
  Large,
  Max,
}

export const ConstantsV2 = Object.freeze({
  // Default values for options
  DefaultMaxFeePerGasWei: "25000000000",
  DefaultCallbackGasLimit: 200000,
  DefaultOverrideAxiomQueryFee: "0",
  DefaultDataQueryCalldataGasWarningThreshold: 100000,

  // Fallback values if contract value cannot be read
  FallbackProofVerificationGas: 420000n,
  FallbackAxiomQueryFeeWei: 3000000000000000n,

  // Schema hashes
  QueryInitiatedOnchainSchema: "0xb72b05c090ac4ae9ec18b7e708d597093716f98567026726f6f5d9f172316178",
  QueryInitiatedWithIpfsDataSchema: "0xf3a2958f23705cbc6bbc0922c0af3c82b76d93e8acc5c17ef86736cf4563fb85",

  // Subquery limits
  UserMaxTotalSubqueries: 128,
  MaxSameSubqueryType: 128,
  SubqueryConfigs: {
    [SubqueryConfig.Default]: {
      MaxTxSubqueries: 128,
      MaxReceiptSubqueries: 128,
    },
    [SubqueryConfig.AllLarge]: {
      MaxTxSubqueries: 16,
      MaxReceiptSubqueries: 16,
    },
    [SubqueryConfig.AllMax]: {
      MaxTxSubqueries: 4,
      MaxReceiptSubqueries: 1,
    },
  },

  // Tx categorization
  TxSizeCategory: {
    Default: {
      MaxDataLen: 8192,
      MaxAccessListRlpLen: 4096,
    },
    Large: {
      MaxDataLen: 32768,
      MaxAccessListRlpLen: 16384,
    },
    Max: {
      MaxDataLen: 330000,
      MaxAccessListRlpLen: 131072,
    },
  },

  // Receipt categorization
  ReceiptSizeCategory: {
    Default: {
      MaxLogDataLen: 800,
      MaxNumLogs: 20,
    },
    Medium: {
      MaxLogDataLen: 1024,
      MaxNumLogs: 80,
    },
    Large: {
      MaxLogDataLen: 2048,
      MaxNumLogs: 80,
    },
    Max: {
      MaxLogDataLen: 1024,
      MaxNumLogs: 400,
    },
  },

  // Default empty objects
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

  // Various constants
  Bytes32Max: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
});
