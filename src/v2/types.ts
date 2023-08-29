import {
  AccountSubquery,
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

export interface CallbackRequestV2 {
  callbackAddr: string;
  callbackFunctionSelector: string;
  resultLen: number;
  callbackExtraData: string;
}

export interface QueryBuilderV2Options {}

export interface BuiltQueryV2 {
  dataQueryHash: string;
  dataQuery: string;
  computeQuery: string;
  callback: CallbackRequestV2;
}

export type { QueryBuilderV2 } from "./query/queryBuilderV2";
