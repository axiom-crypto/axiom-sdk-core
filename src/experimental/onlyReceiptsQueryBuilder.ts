import { ethers, keccak256 } from "ethers";
import { InternalConfig } from "../core/internalConfig";
import { getReceipt, makeEvenHex } from "../shared/utils";
import {
  ProcessedReceiptQueryRow,
  ReceiptQueryData,
  ReceiptResponseTree,
} from "./types";
import MerkleTree from "merkletreejs";
import { QueryBuilderResponse } from "../shared/types";
import { encodeReceiptQuery } from "./encoder";

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

export interface ReceiptQueryRow {
  txHash: string;
  field: ReceiptField;
  logIndex?: number; // this will only be parsed when field == Logs
}

function mapReceiptTypeToFieldIndex(type: ReceiptField): number {
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

/**
 * OnlyReceiptsQueryBuilder should be used directly if you only need to query receipts/logs _without_ querying transactions.
 * This builder supports a maximum of 8 receipt queries.
 *
 * This you need receipts and transactions, use TxReceiptsQueryBuilder.
 */
export class OnlyReceiptsQueryBuilder {
  private queries: ProcessedReceiptQueryRow[] = [];
  private queryData: ReceiptQueryData[] = [];
  private responseTree?: ReceiptResponseTree = undefined;
  private readonly config: InternalConfig;
  private readonly maxSize: number;

  constructor(config: InternalConfig, maxSize?: number) {
    if (config.version !== "experimental")
      throw new Error(
        "TxQueryBuilder is only supported when version = experimental"
      );
    this.config = new InternalConfig(config);
    this.maxSize =
      maxSize ?? this.config.getConstants().Values.OnlyReceiptsQueryBuilder;
    if ((this.maxSize & (this.maxSize - 1)) !== 0) {
      throw new Error("QueryBuilder maxSize must be a power of 2");
    }
  }

  async appendReceiptQuery(queryRow: ReceiptQueryRow) {
    const { processedRow, queryData } = await this.processQueryRow(queryRow);
    this.queries.push(processedRow);
    this.queryData.push(queryData);
  }

  async build(): Promise<QueryBuilderResponse> {
    if (this.queries.length === 0) {
      throw new Error("You haven't made a query yet!");
    }
    const keccakQueryResponse = this.getResponse();
    const query = this.packQuery();
    const queryHash = keccak256(query);
    return {
      queryHash,
      query,
      keccakQueryResponse,
    };
  }

  getResponseTree(): ReceiptResponseTree {
    if (this.responseTree === undefined) {
      this.buildResponse();
    }
    return this.responseTree as ReceiptResponseTree;
  }

  getResponse(): string {
    if (this.responseTree === undefined) {
      return this.buildResponse();
    }
    return this.responseTree.tree.getHexRoot();
  }

  // convenience functions
  getCurrentSize(): number {
    return this.queries.length;
  }

  getRemainingSize(): number {
    return this.maxSize - this.queries.length;
  }

  getMaxSize(): number {
    return this.maxSize;
  }

  getCurrentQueries(): ProcessedReceiptQueryRow[] {
    return this.queries;
  }

  // private implementations
  private async processQueryRow(queryRow: ReceiptQueryRow) {
    if (this.queries.length >= this.maxSize) {
      throw new Error(
        `OnlyReceiptsQueryBuilder has reached its maximum size of ${this.maxSize}. Please start a new OnlyReceiptsQueryBuilder instance.`
      );
    }

    const receipt = await getReceipt(this.config.provider, queryRow.txHash);
    if (!receipt) {
      throw new Error(
        `Unable to get transaction receipt with hash: ${queryRow.txHash}`
      );
    }

    // Map transaction type to field index based on block number
    let fieldIdx = mapReceiptTypeToFieldIndex(queryRow.field);
    let logIdx = queryRow.logIndex ?? 0;
    if (queryRow.field != ReceiptField.Logs) {
      logIdx = 0;
    }

    // Get data from transaction
    let queryData: ReceiptQueryData;
    try {
      const blockNumber = parseInt(receipt.blockNumber);
      if (isNaN(blockNumber)) {
        throw new Error(
          `Unable to get blockNumber for txHash ${queryRow.txHash}`
        );
      }
      let value = undefined;
      switch (fieldIdx) {
        case 0:
          if ("status" in receipt) {
            value = ethers.toBeHex(receipt["status"]);
          } else if ("root" in receipt) {
            value = receipt["root"];
          } else {
            throw new Error("receipt doesn't have status or postState");
          }
          break;
        case 1:
          value = ethers.toBeHex(receipt["cumulativeGasUsed"]);
          break;
        case 2:
          value = makeEvenHex(receipt["logsBloom"]);
          break;
        case 3:
          const logs = receipt.logs;
          if (queryRow.logIndex === undefined || logIdx >= logs.length) {
            throw new Error("Invalid log index");
          }
          const log = logs[logIdx];
          value = ethers.encodeRlp(log);
          break;
        default:
          throw new Error("Invalid receipt field index: " + fieldIdx);
      }
      queryData = {
        blockNumber,
        txIdx: parseInt(receipt.transactionIndex),
        fieldIdx,
        logIdx,
        value,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Invalid receipt field index");
    }

    const processedRow: ProcessedReceiptQueryRow = {
      txHash: queryRow.txHash,
      fieldIdx,
      logIdx,
    };

    return {
      processedRow,
      queryData,
    };
  }

  private buildResponse(): string {
    if (this.queryData.length === 0) {
      throw new Error("Empty receipt query rows not supported");
    }
    const leaves = [];
    try {
      for (const queryData of this.queryData) {
        const leaf = ethers.solidityPackedKeccak256(
          ["uint32", "uint32", "uint8", "uint8", "bytes"],
          [
            queryData.blockNumber,
            queryData.txIdx,
            queryData.fieldIdx,
            queryData.logIdx,
            queryData.value,
          ]
        );
        leaves.push(leaf);
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

  private packQuery(): string {
    const version = 0xff;
    const queryType = 0x02;
    const numRows = this.queries.length;
    const encodedQueries = this.queries.map(encodeReceiptQuery);
    return ethers.solidityPacked(
      ["uint8", "uint8", "uint8", "bytes[]"],
      [version, queryType, numRows, encodedQueries]
    );
  }
}
