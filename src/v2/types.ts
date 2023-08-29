import {
  AccountSubquery,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  BeaconValidatorSubquery,
  HeaderSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxSubquery,
} from "@axiom-crypto/codec";

export interface DataQueryRequestV2 {
  headerSubqueries?: HeaderSubquery[];
  accountSubqueries?: AccountSubquery[];
  storageSubqueries?: StorageSubquery[];
  txSubqueries?: TxSubquery[];
  receiptSubqueries?: ReceiptSubquery[];
  solidityNestedMappingSubqueries?: SolidityNestedMappingSubquery[];
  beaconSubqueries?: BeaconValidatorSubquery[];
}

// export interface CallbackRequestV2 {
//   callbackAddr: string;
//   callbackFunctionSelector: string;
//   resultLen: number;
//   callbackExtraData: string;
// }

export interface QueryBuilderV2Options {
  maxFeePerGas?: string;
  callbackGasLimit?: number;
}

export interface BuiltQueryV2 {
  sourceChainId: number;
  dataQueryHash: string;
  dataQuery: string;
  computeQuery: AxiomV2ComputeQuery;
  callback: AxiomV2Callback;
  maxFeePerGas: string;
  callbackGasLimit: number,
}

export type { QueryBuilderV2 } from "./query/queryBuilderV2";
