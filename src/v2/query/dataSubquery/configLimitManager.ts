import {
  getNumBytes,
  objectToRlp,
  rlpEncodeTransaction
} from "@axiom-crypto/tools";
import { 
  ReceiptSizeCategory,
  SubqueryConfig,
  TxSizeCategory,
  ConstantsV2
} from "../../constants";

// ConfigLimitManager handles the logic for determining the maximum number of subqueries
// of transaction and receipt types by getting the size of various parameters of the 
// Transaction and Receipt. Global parameters for all subqueries are still enforced by 
// QueryBuliderV2.
export class ConfigLimitManager {
  globalConfig: SubqueryConfig = SubqueryConfig.Default;
  txSizeCategory: TxSizeCategory = TxSizeCategory.Default
  receiptSizeCategory: ReceiptSizeCategory = ReceiptSizeCategory.Default;
  numTxSubqueries: number = 0;
  numReceiptSubqueries: number = 0;

  constructor() {}

  processTx(tx: any) {
    // Check total data length
    const rlpTx = rlpEncodeTransaction(tx);
    if (rlpTx === null) {
      throw new Error("Failed to RLP-encode transaction");
    }
    const txDataLen = getNumBytes(rlpTx);

    // Check access list length
    let aclNumBytesRlp = 0;
    if (tx.type === "0x2") {
      const accessListRlp = objectToRlp(tx.accessList ?? {});
      aclNumBytesRlp = getNumBytes(accessListRlp);
    }

    // Validate max bounds
    if (txDataLen > ConstantsV2.TxSizeCategory.Max.MaxDataLen) {
      throw new Error(`Transaction data length (${txDataLen} bytes) exceeds supported maximum (${ConstantsV2.TxSizeCategory.Max.MaxDataLen} bytes)`);
    }
    if (aclNumBytesRlp > ConstantsV2.TxSizeCategory.Max.MaxAccessListRlpLen) {
      throw new Error(`Transaction access list length (${aclNumBytesRlp} bytes) exceeds supported maximum (${ConstantsV2.TxSizeCategory.Max.MaxAccessListRlpLen} bytes)`);
    }

    // Check the size category for this tx
    let thisTxSize = TxSizeCategory.Default;
    if (
      txDataLen > ConstantsV2.TxSizeCategory.Large.MaxDataLen ||
      aclNumBytesRlp > ConstantsV2.TxSizeCategory.Large.MaxAccessListRlpLen
    ) {
      thisTxSize = TxSizeCategory.Max;
    } else if (
      txDataLen > ConstantsV2.TxSizeCategory.Default.MaxDataLen ||
      aclNumBytesRlp > ConstantsV2.TxSizeCategory.Default.MaxAccessListRlpLen
    ) {
      thisTxSize = TxSizeCategory.Large;
    }

    // Set size category if it's greater than the current size category
    if (thisTxSize > this.txSizeCategory) {
      this.txSizeCategory = thisTxSize;
    }

    // Increment txSubqueries
    this.numTxSubqueries++;

    // Update Global config size based on txSizeCategory if size is smaller
    let thisTxGlobalSize = SubqueryConfig.Default;
    switch (this.txSizeCategory) {
      case TxSizeCategory.Large:
        thisTxGlobalSize = SubqueryConfig.AllLarge;
        break;
      case TxSizeCategory.Max:
        this.globalConfig = SubqueryConfig.AllMax;
        break;
      default:
        break;
    }
    if (thisTxGlobalSize > this.globalConfig) {
      this.globalConfig = thisTxGlobalSize;
    }

    // Check the subquery count
    const config = ConstantsV2.SubqueryConfigs[this.globalConfig as keyof typeof ConstantsV2.SubqueryConfigs];
    if (this.numTxSubqueries > config.MaxTxSubqueries) {
      throw new Error(`Exceeded maximum number of tx subqueries (${this.numTxSubqueries}) for config: ${this.globalConfig}`);
    }
  }

  processReceipt(rc: any) {
    // Get num logs
    const numLogs = rc.logs.length;

    // Get max log data length
    let maxLogDataLen = 0;
    for (const log of rc.logs) {
      const logDataLen = getNumBytes(log.data);
      if (logDataLen > maxLogDataLen) {
        maxLogDataLen = logDataLen;
      }
    }

    // Validate max bounds
    if (
      !(
        (maxLogDataLen <= ConstantsV2.ReceiptSizeCategory.Large.MaxLogDataLen 
        && numLogs <= ConstantsV2.ReceiptSizeCategory.Large.MaxNumLogs) ||
        (maxLogDataLen <= ConstantsV2.ReceiptSizeCategory.Max.MaxLogDataLen
        && numLogs <= ConstantsV2.ReceiptSizeCategory.Max.MaxNumLogs)
      )
    ) {
      throw new Error(`Receipt size (${maxLogDataLen} bytes, ${numLogs} logs) exceeds either Large or Max config categories`);
    }

    // Check the size category for this receipt
    let thisLogDataLenSize = ReceiptSizeCategory.Default;
    if (maxLogDataLen > ConstantsV2.ReceiptSizeCategory.Medium.MaxLogDataLen) {
      thisLogDataLenSize = ReceiptSizeCategory.Large;
    } else if (maxLogDataLen > ConstantsV2.ReceiptSizeCategory.Default.MaxLogDataLen) {
      thisLogDataLenSize = ReceiptSizeCategory.Medium;
    }
    let thisNumLogsSize = ReceiptSizeCategory.Default;
    if (numLogs > ConstantsV2.ReceiptSizeCategory.Large.MaxNumLogs) {
      thisNumLogsSize = ReceiptSizeCategory.Max;
    } else if (numLogs > ConstantsV2.ReceiptSizeCategory.Default.MaxNumLogs) {
      thisNumLogsSize = ReceiptSizeCategory.Medium;
    }
    const thisReceiptSize = Math.max(thisLogDataLenSize, thisNumLogsSize);

    // Set size category if it's greater than the current size category
    if (thisReceiptSize > this.receiptSizeCategory) {
      this.receiptSizeCategory = thisReceiptSize;
    }

    // Increment receiptSubqueries
    this.numReceiptSubqueries++;

    // Update Global config size based on receiptSizeCategory if size is smaller
    let thisReceiptGlobalSize = SubqueryConfig.Default;
    switch (this.receiptSizeCategory) {
      case ReceiptSizeCategory.Large:
        thisReceiptGlobalSize = SubqueryConfig.AllLarge;
        break;
      case ReceiptSizeCategory.Max:
        this.globalConfig = SubqueryConfig.AllMax;
        break;
      default:
        break;
    }
    if (thisReceiptGlobalSize > this.globalConfig) {
      this.globalConfig = thisReceiptGlobalSize;
    }

    // Check the subquery count
    const config = ConstantsV2.SubqueryConfigs[this.globalConfig as keyof typeof ConstantsV2.SubqueryConfigs];
    if (this.numReceiptSubqueries > config.MaxReceiptSubqueries) {
      throw new Error(`Exceeded maximum number of receipt subqueries (${this.numReceiptSubqueries}) for config: ${this.globalConfig}`);
    }
  }

  getGlobalConfig(): SubqueryConfig {
    return this.globalConfig;
  }

  getTxSizeCategory(): TxSizeCategory {
    return this.txSizeCategory;
  }

  getReceiptSizeCategory(): ReceiptSizeCategory {
    return this.receiptSizeCategory;
  }
}