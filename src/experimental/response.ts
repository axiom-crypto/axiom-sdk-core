import { ethers } from "ethers";
import { ReceiptQueryData, TxQueryData } from "./types";

export function getTxResponse(queryData: TxQueryData): string {
  return ethers.solidityPackedKeccak256(
    ["uint32", "uint32", "uint8", "uint8", "bytes"],
    [
      queryData.blockNumber,
      queryData.txIdx,
      queryData.txType,
      queryData.fieldIdx,
      queryData.value,
    ]
  );
}

export function getReceiptResponse(queryData: ReceiptQueryData): string {
  return ethers.solidityPackedKeccak256(
    ["uint32", "uint32", "uint8", "uint8", "bytes"],
    [
      queryData.blockNumber,
      queryData.txIdx,
      queryData.fieldIdx,
      queryData.logIdx,
      queryData.value,
    ]
  );
}
