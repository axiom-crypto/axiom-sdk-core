import {
  AccountSubquery,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
  BeaconValidatorSubquery,
  HeaderSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxSubquery,
} from "@axiom-crypto/tools";

export type { QueryV2 } from "./query/queryV2";
export type { QueryBuilderV2 } from "./query/queryBuilderV2";
export { 
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  DataSubquery,
  HeaderSubquery,
  AccountSubquery,
  StorageSubquery,
  TxSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  BeaconValidatorSubquery,
  DataSubqueryType,
  HeaderField,
  AccountField,
  TxField,
  ReceiptField,
  AxiomV2FieldConstant,
} from '@axiom-crypto/tools';

export interface DataQueryRequestV2 {
  headerSubqueries?: HeaderSubquery[];
  accountSubqueries?: AccountSubquery[];
  storageSubqueries?: StorageSubquery[];
  txSubqueries?: TxSubquery[];
  receiptSubqueries?: ReceiptSubquery[];
  solidityNestedMappingSubqueries?: SolidityNestedMappingSubquery[];
  beaconSubqueries?: BeaconValidatorSubquery[];
}

export interface AxiomV2QueryOptions {
  maxFeePerGas?: string;
  callbackGasLimit?: number;
}

export interface BuiltQueryV2 {
  sourceChainId: string;
  queryHash: string;
  dataQuery: string;
  dataQueryHash: string;
  dataQueryStruct: AxiomV2DataQuery;
  computeQuery: AxiomV2ComputeQuery;
  querySchema: string;
  callback: AxiomV2Callback;
  maxFeePerGas: string;
  callbackGasLimit: number,
}

export interface UnbuiltSubquery {}

export interface UnbuiltHeaderSubquery extends UnbuiltSubquery {
  blockNumber: number;
  fieldIdx: number;
}

export interface UnbuiltAccountSubquery extends UnbuiltSubquery {
  blockNumber: number;
  addr: string;
  fieldIdx: number;
}

export interface UnbuiltStorageSubquery extends UnbuiltSubquery {
  blockNumber: number;
  addr: string;
  slot: string;
}

export interface UnbuiltTxSubquery extends UnbuiltSubquery {
  txHash: string;
  fieldOrCalldataIdx: number;
}

export interface UnbuiltReceiptSubquery extends UnbuiltSubquery {
  txHash: string;
  fieldOrLogIdx: number;
  topicOrDataOrAddressIdx: number;
  eventSchema: string;
}

export interface UnbuiltSolidityNestedMappingSubquery extends UnbuiltSubquery {
  blockNumber: number;
  addr: string;
  mappingSlot: string;
  mappingDepth: number;
  keys: string[];
}

export interface UnbuiltBeaconValidatorSubquery extends UnbuiltSubquery {
  // WIP
}