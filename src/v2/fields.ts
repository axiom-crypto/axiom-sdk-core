import { ConstantsV2 } from "./constants";

export function txUseCalldataIdx(idx: number) {
  return ConstantsV2.TxCalldataIdxOffset + idx;
}

export function txUseContractDataIdx(idx: number) {
  return ConstantsV2.TxContractDataIdxOffset + idx;
}

export function receiptUseLogIdx(idx: number) {
  return ConstantsV2.ReceiptLogIdxOffset + idx;
}

export function receiptUseTopicIdx(idx: number) {
  return idx;
}

export function receiptUseAddress() {
  return ConstantsV2.ReceiptAddressOffset;
}

export function receiptUseDataIdx(idx: number) {
  return ConstantsV2.ReceiptDataIdxOffset + idx;
}