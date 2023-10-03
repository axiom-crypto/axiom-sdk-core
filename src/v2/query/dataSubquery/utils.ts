import { DataSubqueryType } from "@axiom-crypto/tools";

export function getUnbuiltSubqueryTypeFromKeys(keys: string[]): DataSubqueryType {
  switch (keys.join(",")) {
    case ["blockNumber", "fieldIdx"].join(","):
      return DataSubqueryType.Header;
    case ["blockNumber", "addr", "fieldIdx"].join(","):
      return DataSubqueryType.Account;
    case ["blockNumber", "addr", "slot"].join(","):
      return DataSubqueryType.Storage;
    case ["txHash", "fieldOrCalldataIdx"].join(","):
      return DataSubqueryType.Transaction;
    case ["txHash", "fieldOrLogIdx", "topicOrDataOrAddressIdx", "eventSchema"].join(","):
      return DataSubqueryType.Receipt;
    case ["blockNumber", "addr", "mappingSlot", "mappingDepth", "keys"].join(","):
      return DataSubqueryType.SolidityNestedMapping;
    default:
      throw new Error(`Could not infer subquery type from keys ${keys}`);
  }
}