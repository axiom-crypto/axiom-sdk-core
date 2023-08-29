export enum TransactionType {
  Legacy,
  Eip2930,
  Eip1559,
}

export enum TransactionField { // EIP-1559 default
  ChainId,
  Nonce,
  MaxPriorityFeePerGas,
  MaxFeePerGas,
  GasLimit,
  To,
  Value,
  Data,
  AccessList,
  SignatureYParity,
  SignatureR,
  SignatureS,
  GasPrice, // Legacy & EIP-2930
  v, // Legacy
  r, // Legacy
  s, // Legacy
}

export interface TxQueryRow {
  txHash: string;
  field: TransactionField;
}

export function getTxFieldIdx(
  type: TransactionType,
  field: TransactionField
): number {
  if (type === TransactionType.Legacy) {
    switch (field) {
      case TransactionField.Nonce:
        return 0;
      case TransactionField.GasPrice:
        return 1;
      case TransactionField.GasLimit:
        return 2;
      case TransactionField.To:
        return 3;
      case TransactionField.Value:
        return 4;
      case TransactionField.Data:
        return 5;
      case TransactionField.v:
        return 6;
      case TransactionField.r:
        return 7;
      case TransactionField.s:
        return 8;
      default:
        throw new Error(`Invalid field for legacy transaction: ${field}`);
    }
  } else if (type === TransactionType.Eip2930) {
    switch (field) {
      case TransactionField.ChainId:
        return 0;
      case TransactionField.Nonce:
        return 1;
      case TransactionField.GasPrice:
        return 2;
      case TransactionField.GasLimit:
        return 3;
      case TransactionField.To:
        return 4;
      case TransactionField.Value:
        return 5;
      case TransactionField.Data:
        return 6;
      case TransactionField.AccessList:
        return 7;
      case TransactionField.SignatureYParity:
        return 8;
      case TransactionField.SignatureR:
        return 9;
      case TransactionField.SignatureS:
        return 10;
      default:
        throw new Error(`Invalid field for EIP-2930 transaction: ${field}`);
    }
  } else if (type === TransactionType.Eip1559) {
    switch (field) {
      case TransactionField.ChainId:
        return 0;
      case TransactionField.Nonce:
        return 1;
      case TransactionField.MaxPriorityFeePerGas:
        return 2;
      case TransactionField.MaxFeePerGas:
        return 3;
      case TransactionField.GasLimit:
        return 4;
      case TransactionField.To:
        return 5;
      case TransactionField.Value:
        return 6;
      case TransactionField.Data:
        return 7;
      case TransactionField.AccessList:
        return 8;
      case TransactionField.SignatureYParity:
        return 9;
      case TransactionField.SignatureR:
        return 10;
      case TransactionField.SignatureS:
        return 11;
      default:
        throw new Error(`Invalid field for EIP-1559 transaction: ${field}`);
    }
  } else {
    throw new Error(`Invalid transaction type: ${type}`);
  }
}