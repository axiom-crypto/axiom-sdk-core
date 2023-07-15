import { ZeroHash, ethers, keccak256, solidityPackedKeccak256 } from "ethers";
import { InternalConfig } from "../core/internalConfig";
import { Constants, TxFields } from "./constants";
import { HexString } from "ethers/lib.commonjs/utils/data";
import { getTransaction, makeEvenHex } from "../shared/utils";

export enum TransactionType {
  Legacy,
  Eip2930,
  Eip1559,
}

export enum TransactionField {  // EIP-1559 default
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

export enum ReceiptField {
  PostStateAndStatus,
  CumulativeGas,
  LogsBloom,
  Logs,
}

export enum LogField {
  Address,
  Topics,
  Data,
}

export interface TxReceiptQueryRow {
  txHash: string;
  field: TransactionField;
}

export interface ProcessedTxReceiptQueryRow {
  txHash: string;
  fieldIdx: number;
}

export interface TxReceiptQueryData {
  blockNumber: number;
  txIdx: number;
  txType: number;
  fieldIdx: number;
  value: HexString;
}

export function buildMerkleTree(leaves: string[], _depth?: number): string[][] {
  if (_depth === undefined && leaves.length === 0) return [];
  const depth = _depth ?? Math.ceil(Math.log2(leaves.length));
  const tree: string[][] = [];
  tree.push(leaves);
  for (let i = 0; i < depth; i += 1) {
    const level: string[] = [];
    for (let j = 0; j < 2 ** (depth - 1 - i); j += 1) {
      const hash = solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [tree[i]![2 * j] || ZeroHash, tree[i]![2 * j + 1] || ZeroHash]
      );
      level.push(hash);
    }
    tree.push(level);
  }
  return tree;
}

export function mapTransactionTypeToFieldIndex(type: TransactionType, field: TransactionField): number {
  if (type === TransactionType.Legacy) {
    switch (field) {
      case TransactionField.Nonce: return 0;
      case TransactionField.GasPrice: return 1;
      case TransactionField.GasLimit: return 2;
      case TransactionField.To: return 3;
      case TransactionField.Value: return 4;
      case TransactionField.Data: return 5;
      case TransactionField.v: return 6;
      case TransactionField.r: return 7;
      case TransactionField.s: return 8;
      default:
        throw new Error(`Invalid field for legacy transaction: ${field}`);
    }
  } else if (type === TransactionType.Eip2930) {
    switch (field) {
      case TransactionField.ChainId: return 0;
      case TransactionField.Nonce: return 1;
      case TransactionField.GasPrice: return 2;
      case TransactionField.GasLimit: return 3;
      case TransactionField.To: return 4;
      case TransactionField.Value: return 5;
      case TransactionField.Data: return 6;
      case TransactionField.AccessList: return 7;
      case TransactionField.SignatureYParity: return 8;
      case TransactionField.SignatureR: return 9;
      case TransactionField.SignatureS: return 10;
      default:
        throw new Error(`Invalid field for EIP-2930 transaction: ${field}`);
    }
  } else if (type === TransactionType.Eip1559) {
    switch (field) {
      case TransactionField.v:
      case TransactionField.r:
      case TransactionField.s:
      case TransactionField.GasPrice:
        throw new Error(`Invalid field for EIP-1559 transaction: ${field}`);
      default:
        return field;
    }
  } else {
    throw new Error(`Invalid field ${field} for transaction type: ${type}`);
  }
}

export class TxReceiptsQueryBuilder {
  private queries: ProcessedTxReceiptQueryRow[] = [];
  private queryData: TxReceiptQueryData[] = [];
  // private responseTree?: TxReceiptsResponseTree = undefined;
  private readonly config: InternalConfig;
  private readonly maxSize: number;

  constructor(config: InternalConfig) {
    this.config = new InternalConfig(config);
    this.maxSize = this.config.getConstants().Values.MaxQuerySize;
    if ((this.maxSize & (this.maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
  }

  async append(queryRow: TxReceiptQueryRow) {
    const { processedRow, queryData } = await this.processQueryRow(queryRow);
    this.queries.push(processedRow);
    this.queryData.push(queryData);
  }

  async build() {
    const keccakTxResponse = this.getTxResponse();

    // TODO: encode
  }

  private async processQueryRow(queryRow: TxReceiptQueryRow) {
    if (this.queries.length >= this.maxSize) {
      throw new Error(
        `TxReceiptsQueryBuilder has reached its maximum size of ${this.maxSize}. Please start a new TxReceiptQueryBuilder instance.`
      );
    }

    const tx = await getTransaction(this.config.provider, queryRow.txHash); // this.config.provider.getTransaction(queryRow.txHash);
    if (!tx) {
      throw new Error(`Unable to get transaction with hash: ${queryRow.txHash}`);
    }

    const blockNumber = parseInt(tx.blockNumber);
    if (isNaN(blockNumber)) {
      throw new Error(`Unable to get blockNumber for txHash ${queryRow.txHash}`);
    }

    // Map transaction type to field index based on block number
    let fieldIdx;
    if (blockNumber < Constants.EIP_2930_BLOCK_NUM) {
      fieldIdx = mapTransactionTypeToFieldIndex(TransactionType.Legacy, queryRow.field);
    } else if (blockNumber < Constants.EIP_1559_BLOCK_NUM) {
      fieldIdx = mapTransactionTypeToFieldIndex(TransactionType.Eip2930, queryRow.field);
    } else {
      fieldIdx = mapTransactionTypeToFieldIndex(TransactionType.Eip1559, queryRow.field);
    }

    // Get data from transaction
    let queryData: TxReceiptQueryData;
    try {
      const txIdx = parseInt(tx.transactionIndex);
      const txType = parseInt(tx.type);
      const txFieldStr = TxFields[txType][fieldIdx];
      let value = txFieldStr in tx ? tx[txFieldStr] : "0x";
      if (!(txFieldStr in ["input", "accessList", "to"])) {
        value = ethers.toBeHex(value);
      }
      value = makeEvenHex(value);
      queryData = {
        blockNumber,
        txIdx,
        txType,
        fieldIdx,
        value,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Invalid tx field index");
    }

    const processedRow: ProcessedTxReceiptQueryRow = {
      txHash: queryRow.txHash,
      fieldIdx,
    }

    return {
      processedRow,
      queryData,
    }
  }

  private getTxResponse(): string {
    const leaves = [];
    try {
      // console.log(ethers.toBeHex(blockNumber, 4));
      // console.log(ethers.toBeHex(txIdx, 4));
      // console.log(ethers.toBeHex(txType, 1));
      // console.log(ethers.toBeHex(fieldIdx, 1));
      // console.log(value);
      for (const queryData of this.queryData) {
        const bytes = ethers.concat([
          ethers.toBeHex(queryData.blockNumber, 4),
          ethers.toBeHex(queryData.txIdx, 4),
          ethers.toBeHex(queryData.txType, 1),
          ethers.toBeHex(queryData.fieldIdx, 1),
          queryData.value,
        ]);
        console.log(keccak256(bytes));
        const leaf = ethers.solidityPackedKeccak256(
          ["uint32", "uint32", "uint8", "uint8", "bytes"],
          [queryData.blockNumber, queryData.txIdx, queryData.txType, queryData.fieldIdx, queryData.value]
        );
        console.log(keccak256(ethers.concat([leaf, leaf])));
        leaves.push(leaf);
      }
    } catch (err) {
      throw new Error(`Unable to build tree: ${err}`);
    }

    const tree = buildMerkleTree(leaves);
    return tree[tree.length - 1][0];
  }
}