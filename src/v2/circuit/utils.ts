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
  DataSubquery,
  DataSubqueryType,
} from "@axiom-crypto/tools";
import { JsonRpcProvider } from "ethers";
import { CircuitValue256 } from "./CircuitValue256";
import { CircuitValue, convertInput, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { Halo2LibWasm } from "@axiom-crypto/halo2-js/wasm/web";

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

export const fetchDataQueries = async (provider: JsonRpcProvider, dataQuery: DataSubquery[], cachedResults?: { [key: string]: string }) => {

  let results: { [key: string]: string } = {};

  for (let subquery of dataQuery) {
    let key = JSON.stringify(subquery.subqueryData);
    if (cachedResults && key in cachedResults) {
      results[key] = cachedResults[key];
      continue;
    }
    switch (subquery.type) {
      case DataSubqueryType.Header:
        let result = await getHeaderFieldValue(provider, subquery.subqueryData as HeaderSubquery);
        if (result === null) throw new Error(`Failed to fetch header subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = result.toString();
        break;
      case DataSubqueryType.Account:
        let result2 = await getAccountFieldValue(provider, subquery.subqueryData as AccountSubquery);
        if (result2 === null) throw new Error(`Failed to fetch account subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = result2;
        break;
      case DataSubqueryType.Storage:
        let result3 = await getStorageFieldValue(provider, subquery.subqueryData as StorageSubquery);
        if (result3 === null) throw new Error(`Failed to fetch storage subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = result3;
        break;
      case DataSubqueryType.Transaction:
        let result4 = await getTxFieldValue(provider, subquery.subqueryData as TxSubquery);
        if (result4 === null) throw new Error(`Failed to fetch tx subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = BigInt(result4).toString();
        break;
      case DataSubqueryType.Receipt:
        let result5 = await getReceiptFieldValue(provider, subquery.subqueryData as ReceiptSubquery);
        if (result5 === null) throw new Error(`Failed to fetch receipt subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = BigInt(result5).toString();
        break;
      case DataSubqueryType.SolidityNestedMapping:
        let result6 = await getSolidityNestedMappingValue(provider, subquery.subqueryData as SolidityNestedMappingSubquery);
        if (result6 === null) throw new Error(`Failed to fetch solidity nested mapping subquery: ${JSON.stringify(subquery.subqueryData)}`);
        results[key] = result6;
        break;
      default:
        throw new Error(`Invalid data subquery type: ${subquery.type}`);
    }
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

export const convertToBytes32 = (inputArray: Uint8Array) => {
  let result: string[] = [];
  for (let i = 0; i < inputArray.length; i += 32) {
    let slice = inputArray.slice(i, i + 32);
    let hex = Buffer.from(slice).toString('hex').padStart(64, '0');
    result.push(hex);
  }
  return result;
}

export const convertToBytes = (inputArray: Uint8Array): string => {
  let hex = Buffer.from(inputArray).toString('hex');
  return hex;
}
