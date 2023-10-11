import { CircuitValue, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { Halo2Wasm, Halo2LibWasm } from "@axiom-crypto/halo2-js/wasm/web";
import { buildAccount } from "./account";
import { buildReceipt } from "./receipt";
import { buildStorage } from "./storage";
import { buildTx } from "./tx";
import { buildHeader } from "./header";
import { buildMapping } from "./mapping";
import { DataQuery, PrepData, getCircuitValue256FromCircuitValue, getCircuitValue256Witness, getCircuitValueConstant } from "./utils";
import { CircuitValue256 } from "./CircuitValue256";
import { DataSubqueryType } from "@axiom-crypto/tools";

export class AxiomData {

  private _halo2Wasm: Halo2Wasm;
  private _halo2Lib: Halo2LibWasm;
  private _dataQuery: DataQuery;
  private _MAX_BITS: string;
  private _results?: { [key: string]: string };

  constructor(halo2Wasm: Halo2Wasm, halo2Lib: Halo2LibWasm, dataQuery: DataQuery, results?: { [key: string]: string }) {
    this._halo2Lib = halo2Lib;
    this._halo2Wasm = halo2Wasm;
    this._dataQuery = dataQuery;
    this._results = results;
    this._MAX_BITS = this.getPaddedNumBits("253");
  }

  private prepData<T extends object>(subqueryArr: T[], type: DataSubqueryType): PrepData<T> {

    return (subquery, queryArr) => {
      let val = "0";
      const lookup = this._results ? this._results[JSON.stringify(subquery)] : undefined;
      if (lookup) {
        val = BigInt(lookup).toString();
      }
      subqueryArr.push(subquery);
      let witness = getCircuitValue256Witness(this._halo2Lib, val);
      let circuitType = getCircuitValueConstant(this._halo2Lib, type);
      this._halo2Lib.make_public(this._halo2Wasm, circuitType.cell(), 1);
      for (let query of queryArr) {
        this._halo2Lib.make_public(this._halo2Wasm, query.cell(), 1);
      }
      for (let i = queryArr.length; i < 13; i++) {
        this._halo2Lib.make_public(this._halo2Wasm, this._halo2Lib.witness("0"), 1);
      }
      this._halo2Lib.make_public(this._halo2Wasm, witness.hi().cell(), 1);
      this._halo2Lib.make_public(this._halo2Wasm, witness.lo().cell(), 1);
      return witness;
    };
  }

  private getPaddedNumBits(numBits: string) {
    let numBitsNum = Number(numBits);
    const lookupBits = this._halo2Lib.lookup_bits();
    let paddedC = Math.floor(numBitsNum / lookupBits) * lookupBits - 1;
    return paddedC.toString();
  }

  /**
   * Retrieves the account information for a specific block and address.
   *
   * @param blockNumber - The block number.
   * @param address - The address of the account.
   * @returns An `Account` object to fetch individual account fields.
   */
  getAccount = (blockNumber: number | CircuitValue, address: string | CircuitValue) => {
    if (typeof address === "string") {
      address = new CircuitValue(this._halo2Lib, { value: BigInt(address) });
    }
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    return buildAccount(blockNumber, address, this._halo2Lib, this.prepData(this._dataQuery.accountSubqueries, DataSubqueryType.Account));
  };

  /**
   * Retrieves the receipt information for a specific transaction hash.
   *
   * @param blockNumber The block number
   * @param txIdx The transaction index in the block
   * @returns A `Receipt` object to fetch individual receipt fields.
   */
  getReceipt = (blockNumber: number | CircuitValue, txIdx: number | CircuitValue) => {
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    if (typeof txIdx === "number") {
      txIdx = new CircuitValue(this._halo2Lib, { value: BigInt(txIdx) });
    }
    return buildReceipt(blockNumber, txIdx, this._halo2Lib, this.prepData(this._dataQuery.receiptSubqueries, DataSubqueryType.Receipt));
  };

  /**
   * Retrieves the storage information for a specific block and address.
   *
   * @param blockNumber The block number.
   * @param address The address of the contract.
   * @returns A `Storage` object to fetch individual storage slots.
   */
  getStorage = (blockNumber: number | CircuitValue, address: string | CircuitValue) => {
    if (typeof address === "string") {
      address = new CircuitValue(this._halo2Lib, { value: BigInt(address) });
    }
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    return buildStorage(blockNumber, address, this._halo2Lib, this.prepData(this._dataQuery.storageSubqueries, DataSubqueryType.Storage));
  };

  /**
   * Retrieves the transaction information for a specific transaction hash.
   *
   * @param blockNumber The block number
   * @param txIdx The transaction index in the block
   * @returns A `Tx` object to fetch individual transaction fields.
   */
  getTx = (blockNumber: number | CircuitValue, txIdx: number | CircuitValue) => {
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    if (typeof txIdx === "number") {
      txIdx = new CircuitValue(this._halo2Lib, { value: BigInt(txIdx) });
    }
    return buildTx(blockNumber, txIdx, this._halo2Lib, this.prepData(this._dataQuery.txSubqueries, DataSubqueryType.Transaction));
  };

  /**
   * Retrieves the header information for a specific block number.
   *
   * @param blockNumber - The block number.
   * @returns A `Header` object to fetch individual header fields.
   */
  getHeader = (blockNumber: number | CircuitValue) => {
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    return buildHeader(blockNumber, this._halo2Lib, this.prepData(this._dataQuery.headerSubqueries, DataSubqueryType.Header))
  }

  /**
   * Retrieves the solidity mapping information for a specific block, address, and slot.
   *
   * @param blockNumber - The block number.
   * @param address - The address of the contract.
   * @param slot - The slot of the mapping.
   * @returns A `SolidityMapping` object to fetch individual mapping slots.
   */
  getSolidityMapping = (blockNumber: number | CircuitValue, address: string | CircuitValue, slot: number | bigint | string | CircuitValue256 | CircuitValue) => {
    if (typeof address === "string") {
      address = new CircuitValue(this._halo2Lib, { value: BigInt(address) });
    }
    if (typeof blockNumber === "number") {
      blockNumber = new CircuitValue(this._halo2Lib, { value: BigInt(blockNumber) });
    }
    if (typeof slot === "number" || typeof slot === "bigint" || typeof slot === "string") {
      slot = new CircuitValue256(this._halo2Lib, { value: BigInt(slot) });
    }
    return buildMapping(blockNumber, address, slot, this._halo2Lib, this.prepData(this._dataQuery.solidityNestedMappingSubqueries, DataSubqueryType.SolidityNestedMapping));
  }

  /**
   * Adds a circuit value to the callback.
   *
   * @param a - The circuit value to add to the callback.
   */
  addToCallback = (a: CircuitValue | CircuitValue256) => {
    if (a instanceof CircuitValue) {
      const b = BigInt(2) ** BigInt(128);
      const bCell = this._halo2Lib.constant(b.toString());
      const [hi, lo] = this._halo2Lib.div_mod_var(a.cell(), bCell, this._MAX_BITS, "129")
      this._halo2Lib.make_public(this._halo2Wasm, hi, 0);
      this._halo2Lib.make_public(this._halo2Wasm, lo, 0);
    }
    else {
      this._halo2Lib.make_public(this._halo2Wasm, a.hi().cell(), 0);
      this._halo2Lib.make_public(this._halo2Wasm, a.lo().cell(), 0);
    }
  }

  /**
   * Creates a `CircuitValue256` from a hi-lo `CircuitValue` pair.
   *
   * @param hi The hi `CircuitValue`.
   * @param lo The lo `CircuitValue`.
   * @returns A `CircuitValue256` object
   */
  getCircuitValue256FromHiLo = (hi: CircuitValue, lo: CircuitValue) => {
    const circuitValue256 = new CircuitValue256(this._halo2Lib, { hi, lo });
    return circuitValue256;
  }

  /**
   * Creates a `CircuitValue256` from a `RawCircuitInput`.
   *
   * @param a The raw circuit input.
   * @returns A `CircuitValue256` witness object
   */
  getCircuitValue256 = (a: RawCircuitInput) => {
    return getCircuitValue256Witness(this._halo2Lib, a);
  }

  /**
   * Creates a `CircuitValue256` from a `CircuitValue`.
   *
   * @param a The `CircuitValue`.
   * @returns A `CircuitValue256` witness object
   */
  getCircuitValue256FromCircuitValue = (a: CircuitValue) => {
    return getCircuitValue256FromCircuitValue(this._halo2Lib, a);
  }

}
