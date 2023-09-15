import {
  AccountField,
  AccountSubquery,
  BeaconValidatorSubquery,
  DataSubqueryType,
  HeaderField,
  HeaderSubquery,
  ReceiptField,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxField,
  TxSubquery,
  getNumBytes,
} from "@axiom-crypto/codec";
import { ethers } from "ethers";
import { getAccountFieldValue, getHeaderFieldValue, getReceiptFieldValue, getSolidityNestedMappingValue, getStorageFieldValue, getTxFieldValue } from "../../../shared/chainData";
import { ConstantsV2 } from "../../constants";

export function getSubqueryTypeFromKey(key: string): DataSubqueryType {
  switch (key) {
    case "headerSubqueries":
      return DataSubqueryType.Header;
    case "accountSubqueries":
      return DataSubqueryType.Account
    case "storageSubqueries":
      return DataSubqueryType.Storage;
    case "txSubqueries":
      return DataSubqueryType.Transaction;
    case "receiptSubqueries":
      return DataSubqueryType.Receipt;
    case "solidityNestedMappingSubqueries":
      return DataSubqueryType.SolidityNestedMapping;
    case "beaconSubqueries":
      return DataSubqueryType.BeaconValidator;
    default: 
      throw new Error(`Invalid subquery type: ${key}`);
  }
}

export async function validateHeaderSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: HeaderSubquery
): Promise<boolean> {
  if (subquery.fieldIdx > HeaderField.ParentBeaconBlockRoot) {
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
  subquery: AccountSubquery
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
  subquery: StorageSubquery
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
  subquery: TxSubquery
): Promise<boolean> {
  if (
    subquery.fieldOrCalldataIdx > TxField.s && 
    subquery.fieldOrCalldataIdx < ConstantsV2.TxCalldataIdxOffset
  ) {
    console.error(`Invalid tx field/calldata index: ${subquery.fieldOrCalldataIdx}`);
    return false;
  }

  const value = await getTxFieldValue(provider, subquery);
  if (value === null) {
    console.error(`Tx subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateReceiptSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: ReceiptSubquery
): Promise<boolean> {
  if (
    subquery.fieldOrLogIdx > ReceiptField.CumulativeGas && 
    subquery.fieldOrLogIdx < ConstantsV2.ReceiptLogIdxOffset
  ) {
    console.error(`Invalid receipt field/log index: ${subquery.fieldOrLogIdx}`);
    return false;
  }
  if (subquery.fieldOrLogIdx >= ConstantsV2.ReceiptLogIdxOffset) {
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
    subquery.topicOrDataOrAddressIdx < ConstantsV2.ReceiptLogIdxOffset &&
    subquery.topicOrDataOrAddressIdx !== ConstantsV2.ReceiptAddressOffset
  ) {
    console.error(`Invalid receipt topic/data/address index index: ${subquery.topicOrDataOrAddressIdx}`);
    return false;
  }

  const value = await getReceiptFieldValue(provider, subquery);
  if (value === null) {
    console.error(`Receipt subquery ${JSON.stringify(subquery)} returned null`);
    return false;
  }
  return true;
}

export async function validateSolidityNestedMappingSubquery(
  provider: ethers.JsonRpcProvider,
  subquery: SolidityNestedMappingSubquery
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