export enum ReceiptField {
  Status, // status for post EIP-658
  PostState, // postState for pre EIP-658
  CumulativeGas,
  LogsBloom,
  Logs,
}

export enum LogField {
  Address,
  Topics,
  Data,
}

export function getReceiptFieldIdx(type: ReceiptField): number {
  switch (type) {
    case ReceiptField.Status:
      return 0;
    case ReceiptField.PostState:
      return 0;
    case ReceiptField.CumulativeGas:
      return 1;
    case ReceiptField.LogsBloom:
      return 2;
    case ReceiptField.Logs:
      return 3;
    default:
      throw new Error(`Invalid receipt field: ${type}`);
  }
}