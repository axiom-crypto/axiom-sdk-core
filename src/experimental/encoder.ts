import { ethers } from "ethers";
import { ProcessedReceiptQueryRow, ProcessedTxQueryRow } from "./types";

export function encodeTxQuery(query: ProcessedTxQueryRow) {
  return ethers.solidityPacked(
    ["uint8", "bytes32", "uint8"],
    [2, query.txHash, query.fieldIdx]
  );
}

export function encodeReceiptQuery(query: ProcessedReceiptQueryRow) {
  return ethers.solidityPacked(
    ["uint8", "bytes32", "uint8", "uint8"],
    [3, query.txHash, query.fieldIdx, query.logIdx]
  );
}
