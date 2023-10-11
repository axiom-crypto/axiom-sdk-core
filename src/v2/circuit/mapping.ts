import { SolidityNestedMappingSubquery } from "@axiom-crypto/tools";
import { CircuitValue256 } from "./CircuitValue256";
import { CircuitValue, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { Halo2LibWasm } from "@axiom-crypto/halo2-js/wasm/web";
import { getCircuitValue256Constant, getCircuitValueConstant, PrepData, getCircuitValue256FromCircuitValue } from "./utils";

export interface SolidityMapping {
  /**
   * Retrieves the value of a specific key in the mapping.
   *
   * @param key - The key of the mapping.
   * @returns A `CircuitValue` representing the value of the key in the mapping.
   */
  key: (key: RawCircuitInput | CircuitValue256 | CircuitValue) => CircuitValue256;

  /**
   * Retrieves the value of a nested mapping at a specific depth and with specific keys.
   *
   * @param keys - The keys to access the nested mapping.
   * @returns A `CircuitValue` representing the value of the nested mapping.
   */
  nested: (keys: (RawCircuitInput | CircuitValue256 | CircuitValue)[]) => CircuitValue256;
}

export const buildMapping = (blockNumber: CircuitValue, addr: CircuitValue, mappingSlot: CircuitValue256 | CircuitValue, halo2Lib: Halo2LibWasm, prepData: PrepData<SolidityNestedMappingSubquery>) => {

  const nested = (keys: (RawCircuitInput | CircuitValue256 | CircuitValue)[]) => {
    const mappingDepth = keys.length;

    if (mappingSlot instanceof CircuitValue) {
      mappingSlot = getCircuitValue256FromCircuitValue(halo2Lib, mappingSlot);
    }

    if (keys.length === 0) {
      throw new Error("Keys must not be empty");
    }
    if (keys.length !== mappingDepth) {
      throw new Error("Keys length must match mapping depth");
    }
    if (mappingDepth < 1 || mappingDepth > 4) {
      throw new Error("mappingDepth range is [1,4]");
    }

    let mappingDepthCV = getCircuitValueConstant(halo2Lib, mappingDepth);

    let halo2LibValue256Keys: CircuitValue256[] = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof key === "string" || typeof key === "number" || typeof key == "bigint") {
        halo2LibValue256Keys.push(getCircuitValue256Constant(halo2Lib, key));
      }
      else if (key instanceof CircuitValue) {
        const convertedKey = getCircuitValue256FromCircuitValue(halo2Lib, key);
        halo2LibValue256Keys.push(convertedKey);
      }
      else {
        halo2LibValue256Keys.push(key);
      }
    }

    if (mappingDepthCV.value() === BigInt(0)) {
      throw new Error("Depth must be greater than 0");
    }
    let mappingSubquery: SolidityNestedMappingSubquery = {
      blockNumber: blockNumber.number(),
      addr: addr.address(),
      mappingSlot: mappingSlot.hex(),
      mappingDepth: mappingDepthCV.number(),
      keys: halo2LibValue256Keys.map((key) => key.hex())
    };
    const hiLoKeys = halo2LibValue256Keys.map((key) => [key.hi(), key.lo()]);
    const flattened = hiLoKeys.reduce((acc, val) => acc.concat(val), []);
    return prepData(mappingSubquery, [blockNumber, addr, mappingSlot.hi(), mappingSlot.lo(), mappingDepthCV, ...flattened]);
  }

  const key = (key: RawCircuitInput | CircuitValue256 | CircuitValue) => {
    if (typeof key === "string" || typeof key === "number" || typeof key == "bigint") {
      key = getCircuitValue256Constant(halo2Lib, key);
    }
    else if (key instanceof CircuitValue) {
      key = getCircuitValue256FromCircuitValue(halo2Lib, key);
    }
    return nested([key]);
  }

  const mapping: SolidityMapping = { nested, key };

  return Object.freeze(mapping);
}
