import {
  getHeaderFieldValue,
  getAccountFieldValue,
  getStorageFieldValue,
  getTxFieldValue,
  getReceiptFieldValue,
  getSolidityNestedMappingValue,
  HeaderSubquery,
  AccountSubquery,
  StorageSubquery,
  TxSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  BeaconValidatorSubquery,
} from "@axiom-crypto/tools";
import { JsonRpcProvider } from "ethers";
import { CircuitValue256 } from "./CircuitValue256";
import { Halo2LibWasm, CircuitValue, convertInput, RawCircuitInput } from "@axiom-crypto/halo2-js";

export type DataQuery = {
  headerSubqueries: HeaderSubquery[],
  accountSubqueries: AccountSubquery[],
  storageSubqueries: StorageSubquery[],
  txSubqueries: TxSubquery[],
  receiptSubqueries: ReceiptSubquery[],
  solidityNestedMappingSubqueries: SolidityNestedMappingSubquery[],
  beaconSubqueries: BeaconValidatorSubquery[]
}

export const getNewDataQuery = (): DataQuery => {
  return {
    headerSubqueries: [],
    accountSubqueries: [],
    storageSubqueries: [],
    txSubqueries: [],
    receiptSubqueries: [],
    solidityNestedMappingSubqueries: [],
    beaconSubqueries: []
  }
}

export const isDataQueryEmpty = (dataQuery: DataQuery): boolean => {
  return dataQuery.headerSubqueries.length === 0 &&
    dataQuery.accountSubqueries.length === 0 &&
    dataQuery.storageSubqueries.length === 0 &&
    dataQuery.txSubqueries.length === 0 &&
    dataQuery.receiptSubqueries.length === 0 &&
    dataQuery.solidityNestedMappingSubqueries.length === 0 &&
    dataQuery.beaconSubqueries.length === 0;
}

export type PrepData<T> = (subquery: T, subqueryCells: CircuitValue[]) => CircuitValue256;

export const fetchDataQueries = async (provider: JsonRpcProvider, dataQuery: DataQuery, cachedResults?: { [key: string]: string }) => {

  let results: { [key: string]: string } = {};

  for (let headerSubquery of dataQuery.headerSubqueries) {
    let key = JSON.stringify(headerSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getHeaderFieldValue(provider, headerSubquery);
    if (!result) throw new Error(`Failed to fetch header subquery: ${JSON.stringify(headerSubquery)}`);
    results[key] = result.toString();
  }

  for (let accountSubquery of dataQuery.accountSubqueries) {
    let key = JSON.stringify(accountSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getAccountFieldValue(provider, accountSubquery);
    if (!result) throw new Error(`Failed to fetch account subquery: ${JSON.stringify(accountSubquery)}`);
    results[key] = result;
  }

  for (let storageSubquery of dataQuery.storageSubqueries) {
    let key = JSON.stringify(storageSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getStorageFieldValue(provider, storageSubquery);
    if (!result) throw new Error(`Failed to fetch storage subquery: ${JSON.stringify(storageSubquery)}`);
    results[key] = result;
  }

  for (let txSubquery of dataQuery.txSubqueries) {
    let key = JSON.stringify(txSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getTxFieldValue(provider, txSubquery);
    if (!result) throw new Error(`Failed to fetch tx subquery: ${JSON.stringify(txSubquery)}`);
    results[key] = BigInt(result).toString();
  }

  for (let receiptSubquery of dataQuery.receiptSubqueries) {
    let key = JSON.stringify(receiptSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getReceiptFieldValue(provider, receiptSubquery);
    if (!result) throw new Error(`Failed to fetch receipt subquery: ${JSON.stringify(receiptSubquery)}`);
    results[key] = BigInt(result).toString();
  }

  for (let solidityNestedMappingSubquery of dataQuery.solidityNestedMappingSubqueries) {
    let key = JSON.stringify(solidityNestedMappingSubquery);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    let result = await getSolidityNestedMappingValue(provider, solidityNestedMappingSubquery);
    if (!result) throw new Error(`Failed to fetch solidity nested mapping subquery: ${JSON.stringify(solidityNestedMappingSubquery)}`);
    results[key] = result;
  }

  return results;
}

export const getCircuitValue256Witness = (halo2Lib: Halo2LibWasm, value: RawCircuitInput) => {
  let convertedVal = BigInt(value).toString(16).padStart(64, '0');
  let hi128 = convertedVal.slice(0, 32);
  let lo128 = convertedVal.slice(32);

  const hi128CircuitValue = new CircuitValue(halo2Lib, { cell: halo2Lib.witness(convertInput("0x" + hi128)) });
  const lo128CircuitValue = new CircuitValue(halo2Lib, { cell: halo2Lib.witness(convertInput("0x" + lo128)) });
  const halo2LibValue256 = new CircuitValue256(halo2Lib, { hi: hi128CircuitValue, lo: lo128CircuitValue });
  return halo2LibValue256;
}

export const getCircuitValueWitness = (halo2Lib: Halo2LibWasm, value: RawCircuitInput) => {
  const halo2LibValue = new CircuitValue(halo2Lib, { cell: halo2Lib.witness(convertInput(value)) });
  return halo2LibValue;
}

export const getCircuitValue256Constant = (halo2Lib: Halo2LibWasm, value: RawCircuitInput) => {
  let convertedVal = BigInt(value).toString(16).padStart(64, '0');
  let hi128 = convertedVal.slice(0, 32);
  let lo128 = convertedVal.slice(32);

  const hi128CircuitValue = new CircuitValue(halo2Lib, { cell: halo2Lib.constant(convertInput("0x" + hi128)) });
  const lo128CircuitValue = new CircuitValue(halo2Lib, { cell: halo2Lib.constant(convertInput("0x" + lo128)) });
  const halo2LibValue256 = new CircuitValue256(halo2Lib, { hi: hi128CircuitValue, lo: lo128CircuitValue });
  return halo2LibValue256;
}

export const getCircuitValueConstant = (halo2Lib: Halo2LibWasm, value: RawCircuitInput) => {
  const halo2LibValue = new CircuitValue(halo2Lib, { cell: halo2Lib.constant(convertInput(value)) });
  return halo2LibValue;
}

export const getCircuitValueWithOffset = (halo2Lib: Halo2LibWasm, value: CircuitValue, offset: RawCircuitInput) => {
  const cell = halo2Lib.add(value.cell(), halo2Lib.constant(Number(offset).toString()))
  const halo2LibValue = new CircuitValue(halo2Lib, { cell });
  return halo2LibValue;
}

export const isRawCircuitInput = (input: RawCircuitInput | CircuitValue | CircuitValue256) => {
  return typeof input === "string" || typeof input === "number" || typeof input === "bigint";
}

export const getCircuitValue256FromCircuitValue = (halo2Lib: Halo2LibWasm, value: CircuitValue) => {
  const b = BigInt(2) ** BigInt(128);
  const bCell = halo2Lib.constant(b.toString());
  const lookupBits = halo2Lib.lookup_bits();
  let paddedNumBits = Math.floor(253 / lookupBits) * lookupBits - 1;
  const cell = value.cell();
  const [hi, lo] = halo2Lib.div_mod_var(cell, bCell, paddedNumBits.toString(), "129")
  const hi128CircuitValue = new CircuitValue(halo2Lib, { cell: hi });
  const lo128CircuitValue = new CircuitValue(halo2Lib, { cell: lo });
  const halo2LibValue256 = new CircuitValue256(halo2Lib, { hi: hi128CircuitValue, lo: lo128CircuitValue });
  return halo2LibValue256;
}

export const lowercase = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1)
}
