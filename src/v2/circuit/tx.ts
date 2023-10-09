import { TxField, TxSubquery } from "@axiom-crypto/tools";
import { lowercase } from "./utils";
import { PrepData } from "./utils";
import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-js/wasm/web";
import { CircuitValue256 } from "./CircuitValue256";
import { CircuitValue, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { getCircuitValueConstant, getCircuitValueWithOffset } from "./utils";
import { AxiomV2FieldConstant } from "@axiom-crypto/tools";

enum SpecialTxFields {
    Type = 51,
    BlockNumber = 52,
    TxIdx = 53,
    FunctionSelector = 54
}
type SpecialTxKeys = Uncapitalize<keyof typeof SpecialTxFields>;
type SpecialTxKeyFields = {
    [key in SpecialTxKeys]: () => CircuitValue256;
};

type TxEnumKeys = Uncapitalize<keyof typeof TxField>;
type TxEnumKeyFields = {
    [key in TxEnumKeys]: () => CircuitValue256;
};

interface BaseTx extends TxEnumKeyFields { };
interface SpecialTx extends SpecialTxKeyFields { };
export interface Tx extends BaseTx, SpecialTx {
    /**
     * Retrieves a 32 byte chunk of the transaction calldata.
     *
     * @param calldataIdx - The index of the 32 byte chunk
     * @returns A `CircuitValue256` in representing the 32 byte chunk of the tx calldata.
     */
    calldata: (calldataIdx: CircuitValue | RawCircuitInput) => CircuitValue256;

    /**
     * Retrieves a 32 byte chunk of a contract deployment's transaction data.
     *
     * @param contractDataIdx - The index of the 32 byte chunk
     * @returns A `CircuitValue256` in representing the 32 byte chunk of the contract deploy data.
     */
    contractData: (contractDataIdx: CircuitValue | RawCircuitInput) => CircuitValue256;
};

export const buildTx = (blockNumber: CircuitValue, txIdx: CircuitValue, halo2Lib: Halo2LibWasm, prepData: PrepData<TxSubquery>) => {

    const getSubquery = (fieldOrCalldataIdx: CircuitValue) => {
        let TxSubquery: TxSubquery = {
            blockNumber: blockNumber.number(),
            txIdx: txIdx.number(),
            fieldOrCalldataIdx: fieldOrCalldataIdx.number()
        };
        return prepData(TxSubquery, [blockNumber, txIdx, fieldOrCalldataIdx]);
    }

    const functions = Object.fromEntries(
        Object.keys(TxField).map((key) => {
            return [lowercase(key), () => {
                const txField = getCircuitValueConstant(halo2Lib, TxField[key as keyof typeof TxField]);
                return getSubquery(txField);
            }]
        })
    ) as BaseTx;

    const specialFunctions = Object.fromEntries(
        Object.keys(SpecialTxFields).map((key) => {
            return [lowercase(key), () => {
                const txField = getCircuitValueConstant(halo2Lib, SpecialTxFields[key as keyof typeof SpecialTxFields]);
                return getSubquery(txField);
            }]
        })
    ) as SpecialTx;

    const calldata = (calldataIdx: CircuitValue | RawCircuitInput): CircuitValue256 => {
        if (typeof calldataIdx === "string" || typeof calldataIdx === "number" || typeof calldataIdx == "bigint") {
            calldataIdx = getCircuitValueConstant(halo2Lib, calldataIdx);
        }
        const logIdxProcessed = getCircuitValueWithOffset(halo2Lib, calldataIdx, AxiomV2FieldConstant.Tx.CalldataIdxOffset);
        return getSubquery(logIdxProcessed);
    }

    const contractData = (contractDataIdx: CircuitValue | RawCircuitInput): CircuitValue256 => {
        if (typeof contractDataIdx === "string" || typeof contractDataIdx === "number" || typeof contractDataIdx == "bigint") {
            contractDataIdx = getCircuitValueConstant(halo2Lib, contractDataIdx);
        }
        const logIdxProcessed = getCircuitValueWithOffset(halo2Lib, contractDataIdx, AxiomV2FieldConstant.Tx.ContractDataIdxOffset);
        return getSubquery(logIdxProcessed);
    }

    const allFunctions: Tx = { ...functions, ...specialFunctions, calldata, contractData };

    return Object.freeze(allFunctions);
}