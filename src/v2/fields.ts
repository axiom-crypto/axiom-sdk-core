import { ConstantsV2 } from "./constants";

export function txUseCalldataIdx(idx: number): number {
  return ConstantsV2.TxCalldataIdxOffset + idx;
}

export function txUseContractDataIdx(idx: number): number {
  return ConstantsV2.TxContractDataIdxOffset + idx;
}

export function txUseTxType(): number {
  return ConstantsV2.TxTxTypeFieldOffset;
}

export function txUseBlockNumber(): number {
  return ConstantsV2.TxBlockNumberFieldOffset;
}

export function txUseTxIndex(): number {
  return ConstantsV2.TxTxIndexFieldOffset;
}

export function txUseFunctionSelector(): number {
  return ConstantsV2.TxFunctionSelectorFieldOffset;
}

export function txUseNoCalldataSelector(): number {
  return ConstantsV2.TxNoCalldataSelectorOffset;
}

export function txUseContractDeploySelector(): number {
  return ConstantsV2.TxContractDeploySelectorOffset;
}

export function txUseCalldataHash(): number {
  return ConstantsV2.TxCalldataHashFieldOffset;
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
  return ConstantsV2.ReceiptAddressOffset;
}

export function receiptUseTxType(): number {
  return ConstantsV2.ReceiptTxTypeFieldOffset;
}

export function receiptUseBlockNumber(): number {
  return ConstantsV2.ReceiptBlockNumberFieldOffset;
}

export function receiptUseTxIndex(): number {
  return ConstantsV2.ReceiptTxIndexFieldOffset;
}
