import MerkleTree from "merkletreejs";

export interface ProcessedTxQueryRow {
  txHash: string;
  fieldIdx: number;
}

export interface TxQueryData {
  blockNumber: number;
  txIdx: number;
  txType: number;
  fieldIdx: number;
  value: string;
}

export interface ProcessedReceiptQueryRow {
  txHash: string;
  fieldIdx: number;
  logIdx: number; // this will be default set to 0 if fieldIdx != 3 (logs)
}

export interface ReceiptQueryData {
  blockNumber: number;
  txIdx: number;
  fieldIdx: number;
  logIdx: number;
  value: string;
}

export interface TxResponseTree {
  tree: MerkleTree;
  data: TxQueryData[];
  dataToIndex: Map<TxQueryData, number>;
}

export interface ReceiptResponseTree {
  tree: MerkleTree;
  data: ReceiptQueryData[];
  dataToIndex: Map<ReceiptQueryData, number>;
}
