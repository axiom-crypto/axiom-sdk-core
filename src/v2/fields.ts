import { ConstantsV2 } from "./constants";

export function txUseCalldataIdx(idx: number): number {
  return ConstantsV2.TxCalldataIdxOffset + idx;
}

export function txUseContractDataIdx(idx: number): number {
  return ConstantsV2.TxContractDataIdxOffset + idx;
}

export function txUseTxType(): number {
  return ConstantsV2.TxTxTypeFieldIdx;
}

export function txUseBlockNumber(): number {
  return ConstantsV2.TxBlockNumberFieldIdx;
}

export function txUseTxIndex(): number {
  return ConstantsV2.TxTxIndexFieldIdx;
}

export function txUseFunctionSelector(): number {
  return ConstantsV2.TxFunctionSelectorFieldIdx;
}

export function txUseCalldataHash(): number {
  return ConstantsV2.TxCalldataHashFieldIdx;
}

export function receiptUseLogIdx(idx: number): number {
  return ConstantsV2.ReceiptLogIdxOffset + idx;
}

export function receiptUseTopicIdx(idx: number): number {
  return idx;
}

export function receiptUseDataIdx(idx: number): number {
  return ConstantsV2.ReceiptDataIdxOffset + idx;
}

export function receiptUseAddress(): number {
  return ConstantsV2.ReceiptAddressIdx;
}

export function receiptUseTxType(): number {
  return ConstantsV2.ReceiptTxTypeFieldIdx;
}

export function receiptUseBlockNumber(): number {
  return ConstantsV2.ReceiptBlockNumberFieldIdx;
}

export function receiptUseTxIndex(): number {
  return ConstantsV2.ReceiptTxIndexFieldIdx;
}
