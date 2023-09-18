import { SpecialValuesV2 } from "@axiom-crypto/codec";

export function headerUseLogsBloomIdx(idx: number): number {
  return SpecialValuesV2.HeaderLogsBloomIdxOffset + idx;
}

export function txUseCalldataIdx(idx: number): number {
  return SpecialValuesV2.TxCalldataIdxOffset + idx;
}

export function txUseContractDataIdx(idx: number): number {
  return SpecialValuesV2.TxContractDataIdxOffset + idx;
}

export function txUseTxType(): number {
  return SpecialValuesV2.TxTxTypeFieldIdx;
}

export function txUseBlockNumber(): number {
  return SpecialValuesV2.TxBlockNumberFieldIdx;
}

export function txUseTxIndex(): number {
  return SpecialValuesV2.TxTxIndexFieldIdx;
}

export function txUseFunctionSelector(): number {
  return SpecialValuesV2.TxFunctionSelectorFieldIdx;
}

export function txUseCalldataHash(): number {
  return SpecialValuesV2.TxCalldataHashFieldIdx;
}

export function receiptUseLogIdx(idx: number): number {
  return SpecialValuesV2.ReceiptLogIdxOffset + idx;
}

export function receiptUseTopicIdx(idx: number): number {
  return idx;
}

export function receiptUseDataIdx(idx: number): number {
  return SpecialValuesV2.ReceiptDataIdxOffset + idx;
}

export function receiptUseLogsBloomIdx(idx: number): number {
  return SpecialValuesV2.ReceiptLogsBloomIdxOffset + idx;
}

export function receiptUseAddress(): number {
  return SpecialValuesV2.ReceiptAddressIdx;
}

export function receiptUseTxType(): number {
  return SpecialValuesV2.ReceiptTxTypeFieldIdx;
}

export function receiptUseBlockNumber(): number {
  return SpecialValuesV2.ReceiptBlockNumberFieldIdx;
}

export function receiptUseTxIndex(): number {
  return SpecialValuesV2.ReceiptTxIndexFieldIdx;
}
