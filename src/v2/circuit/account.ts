import { AccountField, AccountSubquery } from "@axiom-crypto/tools";
import { lowercase } from "./utils";
import { PrepData } from "./utils";
import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-lib-js/wasm/web";
import { CircuitValue, CircuitValue256 } from "@axiom-crypto/halo2-lib-js";
import { getCircuitValueConstant } from "./utils";

type AccountEnumKeys = Uncapitalize<keyof typeof AccountField>;
type AccountEnumKeyFields = { [key in AccountEnumKeys]: () => CircuitValue256 };
export interface Account extends AccountEnumKeyFields { };

export const buildAccount = (blockNumber: CircuitValue, address: CircuitValue, halo2Lib: Halo2LibWasm, prepData: PrepData<AccountSubquery>) => {

  const getSubquery = (fieldIdx: CircuitValue) => {
    let accountSubquery: AccountSubquery = {
      blockNumber: blockNumber.number(),
      addr: address.address(),
      fieldIdx: fieldIdx.number()
    };
    return prepData(accountSubquery, [blockNumber, address, fieldIdx]);
  }

  const functions = Object.fromEntries(
    Object.keys(AccountField).map((key) => {
      return [lowercase(key), () => {
        const accountField = getCircuitValueConstant(halo2Lib, AccountField[key as keyof typeof AccountField])
        return getSubquery(accountField);
      }]
    })
  ) as Account;

  return Object.freeze(functions);
}
