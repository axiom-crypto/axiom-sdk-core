import { ZeroHash, ethers, keccak256, solidityPackedKeccak256 } from "ethers";
import { InternalConfig } from "../core/internalConfig";
import { TxFields } from "./constants";
import { getTransaction, makeEvenHex } from "../shared/utils";
import {
  ProcessedTxQueryRow,
  ReceiptResponseTree,
  SolidityTxResponse,
  TxQueryData,
  TxReceiptsValidationData,
  TxResponseTree,
} from "./types";
import MerkleTree from "merkletreejs";
import {
  OnlyReceiptsQueryBuilder,
  ReceiptField,
  ReceiptQueryRow,
} from "./onlyReceiptsQueryBuilder";
import { encodeReceiptQuery, encodeTxQuery } from "./encoder";
import { QueryBuilderResponse } from "../shared/types";
import { getTxResponse } from "./response";

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

export function mapTransactionTypeToFieldIndex(
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

/**
 * TxReceiptsQueryBuilder is used to build a query for at most 4 transactions and at most 4 tx receipts.
 */
export class TxReceiptsQueryBuilder {
  private tx: TxQueryBuilder;
  private receipt: OnlyReceiptsQueryBuilder;

  constructor(config: InternalConfig) {
    this.tx = new TxQueryBuilder(config);
    this.receipt = new OnlyReceiptsQueryBuilder(
      config,
      config.getConstants().Values.MaxTxReceiptsQuerySize
    );
  }

  async appendTxQuery(queryRow: TxQueryRow) {
    await this.tx.append(queryRow);
  }

  async appendReceiptQuery(queryRow: ReceiptQueryRow) {
    await this.receipt.appendReceiptQuery(queryRow);
  }

  async build(): Promise<QueryBuilderResponse> {
    const keccakQueryResponse = await this.getResponse();
    const query = this.packQuery();
    const queryHash = keccak256(query);
    return { queryHash, query, keccakQueryResponse };
  }

  /**
   * Generates the calldata to pass into the `areTxReceiptsValid` view function.
   * @returns keccakTxResponse: the keccak256 merkle root of the queried transaction data
   * @returns keccakReceiptResponse: the keccak256 merkle root of the queried receipt data
   * @returns txResponses: the Merkle proof of each transaction datum into the response tree
   * @returns receiptResponses: the Merkle proof of each receipt datum into the response tree
   */
  async getValidationWitness(): Promise<TxReceiptsValidationData> {
    // call this first so it creates response trees with correct resizing strategy
    await this.getResponseTrees();
    const { keccakTxResponse, txResponses } =
      await this.tx.getValidationWitness();
    const { keccakReceiptResponse, receiptResponses } =
      await this.receipt.getValidationWitness();
    return {
      keccakTxResponse,
      keccakReceiptResponse,
      txResponses,
      receiptResponses,
    };
  }

  async getResponseTrees(): Promise<{
    tx: TxResponseTree;
    receipt: ReceiptResponseTree;
  }> {
    if (this.tx.queries.length === 0 && this.receipt.getCurrentSize() === 0) {
      throw new Error("You haven't made any queries yet!");
    }
    // special resize strategy:
    // - if there are no receipts, we will duplicate the first tx query using status field
    // - if there are no tx queries, we will duplicate the first receipt query using to field
    if (this.receipt.getCurrentSize() === 0) {
      await this.receipt.appendReceiptQuery({
        txHash: this.tx.queries[0].txHash,
        field: ReceiptField.Status,
      });
    } else if (this.tx.queries.length === 0) {
      await this.tx.append({
        txHash: this.receipt.getCurrentQueries()[0].txHash,
        field: TransactionField.To,
      });
    }
    return {
      tx: this.tx.getResponseTree(),
      receipt: this.receipt.getResponseTree(),
    };
  }

  async getResponse(): Promise<string> {
    const { tx, receipt } = await this.getResponseTrees();
    const txResponse = tx.tree.getHexRoot();
    const receiptResponse = receipt.tree.getHexRoot();
    const response = ethers.solidityPackedKeccak256(
      ["bytes32", "bytes32"],
      [txResponse, receiptResponse]
    );
    return response;
  }

  private packQuery(): string {
    const version = 0xff;
    const queryType = 0x01;
    const numRows = this.tx.queries.length + this.receipt.getCurrentSize();
    const encodedQueries = this.tx.queries
      .map(encodeTxQuery)
      .concat(this.receipt.getCurrentQueries().map(encodeReceiptQuery));
    return ethers.solidityPacked(
      ["uint8", "uint8", "uint8", "bytes[]"],
      [version, queryType, numRows, encodedQueries]
    );
  }
}

// only builds transaction query rows
class TxQueryBuilder {
  queries: ProcessedTxQueryRow[] = [];
  queryData: TxQueryData[] = [];
  responseTree?: TxResponseTree = undefined;
  private readonly config: InternalConfig;
  private readonly maxSize: number;

  constructor(config: InternalConfig, maxSize?: number) {
    if (config.version !== "experimental")
      throw new Error(
        "TxQueryBuilder is only supported when version = experimental"
      );
    this.config = new InternalConfig(config);
    this.maxSize = maxSize ?? this.config.getConstants().Values.MaxTxsQuerySize;
    if ((this.maxSize & (this.maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
  }

  async append(queryRow: TxQueryRow) {
    const { processedRow, queryData } = await this.processQueryRow(queryRow);
    this.queries.push(processedRow);
    this.queryData.push(queryData);
  }

  private async processQueryRow(queryRow: TxQueryRow) {
    if (this.queries.length >= this.maxSize) {
      throw new Error(
        `TxReceiptsQueryBuilder has reached its maximum size of ${this.maxSize}. Please start a new TxReceiptQueryBuilder instance.`
      );
    }

    const tx = await getTransaction(this.config.provider, queryRow.txHash); // this.config.provider.getTransaction(queryRow.txHash);
    if (!tx) {
      throw new Error(
        `Unable to get transaction with hash: ${queryRow.txHash}`
      );
    }

    const blockNumber = parseInt(tx.blockNumber);
    if (isNaN(blockNumber)) {
      throw new Error(
        `Unable to get blockNumber for txHash ${queryRow.txHash}`
      );
    }

    // Map transaction type to field index based on block number
    const txType = parseInt(tx.type);
    if (isNaN(txType)) {
      throw new Error(`Unable to get txType for txHash ${queryRow.txHash}`);
    }
    let fieldIdx;
    switch (txType) {
      case 0:
        fieldIdx = mapTransactionTypeToFieldIndex(
          TransactionType.Legacy,
          queryRow.field
        );
        break;
      case 1:
        fieldIdx = mapTransactionTypeToFieldIndex(
          TransactionType.Eip2930,
          queryRow.field
        );
        break;
      case 2:
        fieldIdx = mapTransactionTypeToFieldIndex(
          TransactionType.Eip1559,
          queryRow.field
        );
        break;
      default:
        throw new Error(`Invalid tx type: ${txType}`);
    }

    // Get data from transaction
    let queryData: TxQueryData;
    try {
      const txIdx = parseInt(tx.transactionIndex);
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

    const processedRow: ProcessedTxQueryRow = {
      txHash: queryRow.txHash,
      fieldIdx,
    };

    return {
      processedRow,
      queryData,
    };
  }

  getResponseTree(): TxResponseTree {
    if (this.responseTree === undefined) {
      this.buildResponse();
    }
    return this.responseTree as TxResponseTree;
  }

  getResponse(): string {
    if (this.responseTree === undefined) {
      return this.buildResponse();
    }
    return this.responseTree.tree.getHexRoot();
  }

  private buildResponse(): string {
    if (this.queryData.length === 0) {
      throw new Error("Empty tx query rows not supported");
    }
    const leaves = [];
    try {
      for (const queryData of this.queryData) {
        leaves.push(getTxResponse(queryData));
      }
    } catch (err) {
      throw new Error(`Unable to build tree: ${err}`);
    }
    // resize strategy: duplicate using first query until full
    while (leaves.length != this.maxSize) {
      leaves.push(leaves[0]);
    }
    const tree = new MerkleTree(leaves, keccak256);
    const dataToIndex = new Map(this.queryData.map((d, i) => [d, i]));
    this.responseTree = {
      tree,
      data: this.queryData,
      dataToIndex,
    };
    return this.responseTree.tree.getHexRoot();
  }

  async getValidationWitness(): Promise<{
    keccakTxResponse: string;
    txResponses: SolidityTxResponse[];
  }> {
    const keccakTxResponse = await this.getResponse();
    const txResponses = [];
    const _tree = this.getResponseTree();
    const tree = _tree.tree;
    const dataToIndex = _tree.dataToIndex;
    for (const queryData of this.queryData) {
      const leafIdx = dataToIndex.get(queryData);
      if (leafIdx === undefined) {
        throw new Error(
          `Could not find query ${queryData} in the responseTree`
        );
      }
      const proof = tree.getHexProof(tree.getLeaf(leafIdx), leafIdx);
      txResponses.push({
        leafIdx,
        proof,
        ...queryData,
      });
    }
    return {
      keccakTxResponse,
      txResponses,
    };
  }
}
