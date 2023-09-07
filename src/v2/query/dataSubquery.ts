import {
  AccountSubquery,
  BeaconValidatorSubquery,
  DataSubqueryType,
  HeaderSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxSubquery,
} from "@axiom-crypto/codec";
import { ethers } from "ethers";
import { getAccountFieldValue, getHeaderFieldValue, getReceiptFieldValue, getSolidityNestedMappingValue, getStorageFieldValue, getTxFieldValue } from "../../shared/chainData";

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