import { StorageSubquery } from "@axiom-crypto/tools"
import { PrepData, getCircuitValue256FromCircuitValue } from "./utils";
import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-js/wasm/web";
import { CircuitValue, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { CircuitValue256 } from "./CircuitValue256";
import { getCircuitValue256Constant } from "./utils";


/**
 * Represents the storage of a contract.
 */
export interface Storage {
    /**
     * Retrieves the value stored at a specific slot in the contract's storage.
     *
     * @param slot - The slot to retrieve the value from.
     * @returns A `CircuitValue` representing the value stored at the slot.
     */
    slot: (slot: RawCircuitInput | CircuitValue256 | CircuitValue) => CircuitValue256;
}

export const buildStorage = (blockNumber: CircuitValue, addr: CircuitValue, halo2Lib: Halo2LibWasm, prepData: PrepData<StorageSubquery>) => {

    const slot = (slot: RawCircuitInput | CircuitValue256 | CircuitValue) => {
        if(slot instanceof CircuitValue){
            slot = getCircuitValue256FromCircuitValue(halo2Lib, slot);
        }
        if(typeof slot === "string" || typeof slot === "number" || typeof slot == "bigint") {
            slot = getCircuitValue256Constant(halo2Lib, slot);
        }

        let storageSubquery: StorageSubquery = {
            blockNumber: blockNumber.number(),
            addr: addr.address(),
            slot: slot.hex()
        }
        return prepData(storageSubquery, [blockNumber, addr, slot.hi(), slot.lo()]);
    }

    const storage: Storage = { slot };

    return Object.freeze(storage)
}