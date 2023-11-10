import { AxiomV2Callback, AxiomV2ComputeQuery, AxiomV2DataQuery } from "@axiom-crypto/tools";

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
  Subquery,
  SolidityNestedMappingSubquery,
  BeaconValidatorSubquery,
  DataSubqueryType,
  HeaderField,
  AccountField,
  TxField,
  ReceiptField,
  AxiomV2FieldConstant,
} from "@axiom-crypto/tools";

export interface AxiomV2QueryOptions {
  targetChainId?: string;
  maxFeePerGas?: string;
  callbackGasLimit?: number;
  dataQueryCalldataGasWarningThreshold?: number;
  refundee?: string;
}

export interface BuiltQueryV2 {
  sourceChainId: string;
  targetChainId: string;
  queryHash: string;
  dataQuery: string;
  dataQueryHash: string;
  dataQueryStruct: AxiomV2DataQuery;
  computeQuery: AxiomV2ComputeQuery;
  querySchema: string;
  callback: AxiomV2Callback;
  userSalt: string;
  maxFeePerGas: string;
  callbackGasLimit: number;
  refundee: string;
}

export interface DataSubqueryCount {
  total: number;
  header: number;
  account: number;
  storage: number;
  transaction: number;
  receipt: number;
  solidityNestedMapping: number;
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
