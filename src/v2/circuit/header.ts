import { AxiomV2FieldConstant, HeaderField, HeaderSubquery } from "@axiom-crypto/tools";
import { CircuitValue256 } from "./CircuitValue256";
import { Halo2LibWasm, Halo2Wasm, CircuitValue, RawCircuitInput } from "@axiom-crypto/halo2-js";
import { getCircuitValueConstant, getCircuitValueWithOffset, lowercase, PrepData } from "./utils";

type HeaderEnumKeys = Uncapitalize<keyof typeof HeaderField>;
type HeaderEnumKeyFieldsUnfiltered = { [key in HeaderEnumKeys]: () => CircuitValue256 };
type HeaderEnumKeyFields = Omit<HeaderEnumKeyFieldsUnfiltered, "logsBloom">;
export interface Header extends HeaderEnumKeyFields {
  /**
   * Retrieves a 32 byte chunk of the logs bloom.
   *
   * @param logsBloomIdx - The index of the 32 byte chunk in [0,8)
   * @returns A `CircuitValue256` in representing the 32 byte chunk of the logs bloom.
   */
  logsBloom: (logsBloomIdx: RawCircuitInput) => CircuitValue256;
};

export const buildHeader = (blockNumber: CircuitValue, halo2Lib: Halo2LibWasm, prepData: PrepData<HeaderSubquery>) => {

  const getSubquery = (fieldIdx: CircuitValue) => {
    let headerSubquery: HeaderSubquery = {
      blockNumber: blockNumber.number(),
      fieldIdx: fieldIdx.number()
    };
    return prepData(headerSubquery, [blockNumber, fieldIdx]);
  }

  const functions = Object.fromEntries(
    Object.keys(HeaderField).map((key) => {
      return [lowercase(key), () => {
        const headerField = getCircuitValueConstant(halo2Lib, HeaderField[key as keyof typeof HeaderField])
        return getSubquery(headerField);
      }]
    })
  ) as HeaderEnumKeyFields;

  const logsBloom = (logsBloomIdxRaw: RawCircuitInput): CircuitValue256 => {

    if (logsBloomIdxRaw as any instanceof CircuitValue) {
      throw new Error("logsBloomIdxRaw must be a constant (not a CircuitValue)");
    }

    const logsBloomIdx = getCircuitValueConstant(halo2Lib, logsBloomIdxRaw);

    if (logsBloomIdx.number() < 0 || logsBloomIdx.number() >= 8) {
      throw new Error("logsBloomIdx range is [0,8)");
    }
    const logIdxProcessed = getCircuitValueWithOffset(halo2Lib, logsBloomIdx, AxiomV2FieldConstant.Header.LogsBloomFieldIdxOffset);
    return getSubquery(logIdxProcessed);
  }

  const functionsWithLogsBloom: Header = { ...functions, logsBloom };

  return Object.freeze(functionsWithLogsBloom);
}
