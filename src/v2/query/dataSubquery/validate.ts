import { ethers } from "ethers";
import {
  AccountField,
  AccountSubquery,
  BeaconValidatorSubquery,
  HeaderField,
  HeaderSubquery,
  ReceiptField,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxField,
  TxSubquery,
  getBlockNumberAndTxIdx,
  getNumBytes,
  AxiomV2FieldConstant,
  getAccountFieldValue,
  getHeaderFieldValue,
  getReceiptFieldValue,
  getSolidityNestedMappingValue,
  getStorageFieldValue,
  getTxFieldValue,
} from "@axiom-crypto/tools";
import {
  UnbuiltAccountSubquery,
  UnbuiltHeaderSubquery,
  UnbuiltReceiptSubquery,
  UnbuiltSolidityNestedMappingSubquery,
  UnbuiltStorageSubquery,
  UnbuiltTxSubquery,
} from "../../types";

export async function validateHeaderSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltHeaderSubquery
): Promise<boolean> {
  if (subquery.fieldIdx > HeaderField.WithdrawalsRoot) {
    console.error(`Invalid header field index: ${subquery.fieldIdx}`);
    return false;
  }
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock) {
    throw new Error("Failed to get latest block; check your internet connection or provider RPC");
  }
  if (subquery.blockNumber > latestBlock.number) {
    console.warn(`Block number ${subquery.blockNumber} is in the future`);
  }

  const value = await getHeaderFieldValue(provider, subquery);
  if (value === null) {
    console.error(`Header subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateAccountSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltAccountSubquery
): Promise<boolean> {
  if (subquery.fieldIdx > AccountField.CodeHash) {
    console.error(`Invalid account field index: ${subquery.fieldIdx}`);
    return false;
  }
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock) {
    throw new Error("Failed to get latest block; check your internet connection or provider RPC");
  }
  if (subquery.blockNumber > latestBlock.number) {
    console.warn(`Block number ${subquery.blockNumber} is in the future`);
  }

  const value = await getAccountFieldValue(provider, subquery);
  if (value === null) {
    console.error(`Account subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateStorageSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltStorageSubquery
): Promise<boolean> {
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock) {
    throw new Error("Failed to get latest block; check your internet connection or provider RPC");
  }
  if (subquery.blockNumber > latestBlock.number) {
    console.warn(`Block number ${subquery.blockNumber} is in the future`);
  }

  const value = await getStorageFieldValue(provider, subquery);
  if (value === null) {
    console.error(`Storage subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateTxSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltTxSubquery
): Promise<boolean> {
  if (
    (subquery.fieldOrCalldataIdx > TxField.s && 
    subquery.fieldOrCalldataIdx < AxiomV2FieldConstant.Tx.TxTypeFieldIdx) ||
    (subquery.fieldOrCalldataIdx > AxiomV2FieldConstant.Tx.CalldataHashFieldIdx &&
    subquery.fieldOrCalldataIdx < AxiomV2FieldConstant.Tx.CalldataIdxOffset)
  ) {
    console.error(`Invalid tx field/calldata index: ${subquery.fieldOrCalldataIdx}`);
    return false;
  }

  const { blockNumber, txIdx } = await getBlockNumberAndTxIdx(provider, subquery.txHash);
  if (!blockNumber || !txIdx) {
    console.error("Unable to get blockNumber or txIdx from supplied txHash");
    return false;
  }
  const value = await getTxFieldValue(provider, {
    blockNumber,
    txIdx,
    fieldOrCalldataIdx: subquery.fieldOrCalldataIdx,
  });
  if (value === null) {
    console.error(`Tx subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateReceiptSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltReceiptSubquery
): Promise<boolean> {
  if (
    (subquery.fieldOrLogIdx > ReceiptField.CumulativeGas && 
    subquery.fieldOrLogIdx < AxiomV2FieldConstant.Receipt.AddressIdx) ||
    (subquery.fieldOrLogIdx > AxiomV2FieldConstant.Receipt.TxIndexFieldIdx &&
    subquery.fieldOrLogIdx < AxiomV2FieldConstant.Receipt.LogIdxOffset)
  ) {
    console.error(`Invalid receipt field/log index: ${subquery.fieldOrLogIdx}`);
    return false;
  }
  if (subquery.fieldOrLogIdx >= AxiomV2FieldConstant.Receipt.LogIdxOffset) {
    if (
      !ethers.isBytesLike(subquery.eventSchema) ||
      getNumBytes(subquery.eventSchema) !== 32
    ) {
      console.error(`Must define event schema when using log index: ${subquery.eventSchema}`);
      return false;
    }
  }
  if (
    subquery.topicOrDataOrAddressIdx > 4 && 
    subquery.topicOrDataOrAddressIdx < AxiomV2FieldConstant.Receipt.LogIdxOffset &&
    subquery.topicOrDataOrAddressIdx !== AxiomV2FieldConstant.Receipt.AddressIdx
  ) {
    console.error(`Invalid receipt topic/data/address index index: ${subquery.topicOrDataOrAddressIdx}`);
    return false;
  }

  const { blockNumber, txIdx } = await getBlockNumberAndTxIdx(provider, subquery.txHash);
  if (!blockNumber || !txIdx) {
    console.error("Unable to get blockNumber or txIdx from supplied txHash");
    return false;
  }
  const value = await getReceiptFieldValue(provider, {
    blockNumber,
    txIdx,
    fieldOrLogIdx: subquery.fieldOrLogIdx,
    topicOrDataOrAddressIdx: subquery.topicOrDataOrAddressIdx,
    eventSchema: subquery.eventSchema,
  });
  if (value === null) {
    console.error(`Receipt subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateSolidityNestedMappingSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: UnbuiltSolidityNestedMappingSubquery
): Promise<boolean> {
  if (subquery.keys.length !== subquery.mappingDepth) {
    console.error(`Nested mapping keys length ${subquery.keys.length} does not match mapping depth ${subquery.mappingDepth}`);
    return false;
  }
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock) {
    throw new Error("Failed to get latest block; check your internet connection or provider RPC");
  }
  if (subquery.blockNumber > latestBlock.number) {
    console.warn(`Block number ${subquery.blockNumber} is in the future`);
  }
  for (const key of subquery.keys) {
    if (!ethers.isBytesLike(key)) {
      console.error(`Invalid nested mapping key: ${key} (must be bytes-like)`);
      return false;
    }
  }

  const value = await getSolidityNestedMappingValue(provider, subquery);
  if (value === null) {
    console.error(`Solidity nested mapping subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateBeaconSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: BeaconValidatorSubquery
): Promise<boolean> {
  // WIP
  return true;
}