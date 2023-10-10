import {
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
} from "@axiom-crypto/tools";

export {
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
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

export interface AxiomV2QueryOptions {
  maxFeePerGas?: string;
  callbackGasLimit?: number;
  dataQueryCalldataGasLimit?: number;
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

export interface UnbuiltSubquery { }

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
