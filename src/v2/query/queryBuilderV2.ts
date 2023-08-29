import {
  AccountSubquery,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  BeaconValidatorSubquery,
  DataSubqueryType,
  HeaderSubquery,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  SubqueryResponse,
  TxSubquery,
  encodeAccountSubquery,
  encodeSolidityNestedMappingSubquery,
  encodeBeaconValidatorSubquery,
  encodeHeaderSubquery,
  encodeQueryV2,
  encodeReceiptSubquery,
  encodeStorageSubquery,
  encodeTxSubquery,
  encodeComputeQuery,
} from "@axiom-crypto/codec";
import { InternalConfig } from "../../core/internalConfig";
import {
  BuiltQueryV2,
  DataQueryRequestV2,
  QueryBuilderV2Options,
} from "../types";
import { ethers } from "ethers";
import { getAxiomQueryAbiForVersion } from "../../core/lib/abi";
import { ConstantsV2 } from "../constants";
import { resizeArray } from "../../shared/utils";
import { PaymentCalc } from "./paymentCalc";

export class QueryBuilderV2 {
  protected readonly config: InternalConfig;
  private builtQuery?: BuiltQueryV2;
  private dataQuery?: DataQueryRequestV2;
  private computeQuery?: AxiomV2ComputeQuery;
  private callback?: AxiomV2Callback;
  private options: QueryBuilderV2Options;

  constructor(
    config: InternalConfig,
    dataQuery?: DataQueryRequestV2,
    computeQuery?: AxiomV2ComputeQuery,
    callback?: AxiomV2Callback,
    options?: QueryBuilderV2Options
  ) {
    this.config = config;
    
    this.options = {
      maxFeePerGas: options?.maxFeePerGas ?? ConstantsV2.DefaultMaxFeePerGas,
      callbackGasLimit: options?.callbackGasLimit ?? ConstantsV2.DefaultCallbackGasLimit,
    }

    if (dataQuery !== undefined) {
      this.dataQuery = this.handleDataQueryRequest(dataQuery);
    }

    if (computeQuery !== undefined) {
      this.computeQuery = this.handleComputeQueryRequest(computeQuery);
    }

    if (callback !== undefined) {
      this.callback = this.handleCallback(callback);
    }
  }

  getDataQuery(): DataQueryRequestV2 | undefined {
    return this.dataQuery;
  }

  getComputeQuery(): AxiomV2ComputeQuery | undefined {
    return this.computeQuery;
  }

  getCallback(): AxiomV2Callback | undefined {
    return this.callback;
  }

  getOptions(): QueryBuilderV2Options {
    return this.options;
  }

  getBuiltQuery(): BuiltQueryV2 | undefined {
    return this.builtQuery;
  }

  unsetBuiltQuery() {
    // Reset built query if any data is changed
    this.builtQuery = undefined;
  }

  setDataQuery(dataQuery: DataQueryRequestV2) {
    this.unsetBuiltQuery();
    this.dataQuery = this.handleDataQueryRequest(dataQuery);;
  }

  setComputeQuery(computeQuery: AxiomV2ComputeQuery) {
    this.unsetBuiltQuery();
    this.computeQuery = this.handleComputeQueryRequest(computeQuery);
  }

  setCallback(callback: AxiomV2Callback) {
    this.unsetBuiltQuery();
    this.callback = this.handleCallback(callback);
  }

  setOptions(options: QueryBuilderV2Options) {
    this.unsetBuiltQuery();
    this.options = options;
  }

  /**
   * Append a `DataQueryRequestV2` object to the current dataQuery
   * @param dataQuery A `DataQueryRequestV2` object to append 
   */
  append(dataQuery: DataQueryRequestV2) {
    this.unsetBuiltQuery();

    for (const sq of dataQuery.headerSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.Header, sq);
    }
    for (const sq of dataQuery.accountSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.Account, sq);
    }
    for (const sq of dataQuery.storageSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.Storage, sq);
    }
    for (const sq of dataQuery.txSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.Transaction, sq);
    }
    for (const sq of dataQuery.receiptSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.Receipt, sq);
    }
    for (const sq of dataQuery.solidityNestedMappingSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.SolidityNestedMapping, sq);
    }
    for (const sq of dataQuery.beaconSubqueries ?? []) {
      this.appendDataSubquery(DataSubqueryType.BeaconValidator, sq);
    }
  }

  /**
   * Appends a single subquery to the current dataQuery
   * @param type The type of subquery to append
   * @param dataSubquery The data of the subquery to append
   */
  appendDataSubquery(type: DataSubqueryType, dataSubquery: SubqueryResponse) {
    this.unsetBuiltQuery();

    if (this.dataQuery === undefined) {
      this.dataQuery = {} as DataQueryRequestV2;
    }
    switch (type) {
      case DataSubqueryType.Header:
        if (this.dataQuery.headerSubqueries === undefined) {
          this.dataQuery.headerSubqueries = [] as HeaderSubquery[];
        }
        this.dataQuery?.headerSubqueries?.push(dataSubquery as HeaderSubquery);
        break;
      case DataSubqueryType.Account:
        if (this.dataQuery.accountSubqueries === undefined) {
          this.dataQuery.accountSubqueries = [] as AccountSubquery[];
        }
        this.dataQuery?.accountSubqueries?.push(
          dataSubquery as AccountSubquery
        );
        break;
      case DataSubqueryType.Storage:
        if (this.dataQuery.storageSubqueries === undefined) {
          this.dataQuery.storageSubqueries = [] as StorageSubquery[];
        }
        this.dataQuery?.storageSubqueries?.push(
          dataSubquery as StorageSubquery
        );
        break;
      case DataSubqueryType.Transaction:
        if (this.dataQuery.txSubqueries === undefined) {
          this.dataQuery.txSubqueries = [] as TxSubquery[];
        }
        this.dataQuery?.txSubqueries?.push(dataSubquery as TxSubquery);
        break;
      case DataSubqueryType.Receipt:
        if (this.dataQuery.receiptSubqueries === undefined) {
          this.dataQuery.receiptSubqueries = [] as ReceiptSubquery[];
        }
        this.dataQuery?.receiptSubqueries?.push(
          dataSubquery as ReceiptSubquery
        );
        break;
      case DataSubqueryType.SolidityNestedMapping:
        if (this.dataQuery.solidityNestedMappingSubqueries === undefined) {
          this.dataQuery.solidityNestedMappingSubqueries =
            [] as SolidityNestedMappingSubquery[];
        }
        this.dataQuery?.solidityNestedMappingSubqueries?.push(
          dataSubquery as SolidityNestedMappingSubquery
        );
        break;
      case DataSubqueryType.BeaconValidator:
        if (this.dataQuery.beaconSubqueries === undefined) {
          this.dataQuery.beaconSubqueries = [] as BeaconValidatorSubquery[];
        }
        this.dataQuery?.beaconSubqueries?.push(
          dataSubquery as BeaconValidatorSubquery
        );
        break;
      default:
        throw new Error(`Invalid data subquery type: ${type}`);
    }
  }

  async sendOnchainQuery(
    paymentAmountWei: string,
    cb?: (receipt: ethers.TransactionReceipt) => void
  ) {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before sending.");
    }

    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.signer
    );

    const tx = await axiomV2Query.sendQuery(
      this.builtQuery.sourceChainId,
      this.builtQuery.dataQueryHash,
      this.builtQuery.computeQuery,
      this.builtQuery.callback,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
      this.builtQuery.dataQuery,
      { value: paymentAmountWei }
    );
    const receipt = await tx.wait();

    if (cb !== undefined) {
      cb(receipt);
    }
  }

  async sendOffchainQuery(
    paymentAmountWei: string,
    cb?: (receipt: ethers.TransactionReceipt) => void
  ) {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before sending.");
    }
    // WIP: Get IPFS hash for encoded QueryV2
    const ipfsHash = ethers.ZeroHash;

    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.signer
    );
    
    const tx = await axiomV2Query.sendOffchainQuery(
      this.builtQuery.dataQueryHash,
      ipfsHash,
      this.builtQuery.callback,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
      { value: paymentAmountWei }
    );
    const receipt = await tx.wait();

    if (cb !== undefined) {
      cb(receipt);
    }
  }

  /**
   * @returns {boolean} Whether the query is valid or not
   */
  async validate(): Promise<boolean> {
    // WIP
    return true;
  }

  async build(): Promise<BuiltQueryV2> {
    // Encode data query
    let encodedSubqueries = this.encodeDataSubqueries();
    if (encodedSubqueries.length === 0) {
      encodedSubqueries = ethers.ZeroHash;
    }

    // Handle data query
    const dataQuery = ethers.solidityPacked(
      ["uint32", "bytes"],
      [this.config.chainId, encodedSubqueries]
    );
    const dataQueryHash = ethers.keccak256(dataQuery);

    // Handle compute query
    let computeQuery: AxiomV2ComputeQuery = ConstantsV2.EmptyComputeQueryObject;
    if (this.computeQuery !== undefined) {
      computeQuery.k = this.computeQuery.k;
      computeQuery.omega = this.computeQuery.omega;
      computeQuery.vkey = this.computeQuery.vkey;
      computeQuery.computeProof = this.computeQuery.computeProof;
    }

    // Handle callback
    const callback = {
      callbackAddr: this.callback?.callbackAddr ?? ethers.ZeroAddress,
      callbackFunctionSelector:
        this.callback?.callbackFunctionSelector ?? ConstantsV2.EmptyBytes4,
      resultLen: this.callback?.resultLen ?? ConstantsV2.MaxOutputs,
      callbackExtraData: this.callback?.callbackExtraData ?? ethers.ZeroHash,
    };

    this.builtQuery = {
      sourceChainId: this.config.chainId,
      dataQueryHash,
      dataQuery,
      computeQuery,
      callback,
      maxFeePerGas: this.options.maxFeePerGas!,
      callbackGasLimit: this.options.callbackGasLimit!,
    };

    return this.builtQuery;
  }

  calculateFee(): string {
    return PaymentCalc.calculatePayment(this);
  }

  private encodeDataSubqueries() {
    let encodedSubqueries = "0x";
    for (const sq of this.dataQuery?.headerSubqueries ?? []) {
      const encoded = encodeHeaderSubquery(sq.blockNumber, sq.fieldIdx);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.accountSubqueries ?? []) {
      const encoded = encodeAccountSubquery(
        sq.blockNumber,
        sq.addr,
        sq.fieldIdx
      );
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.storageSubqueries ?? []) {
      const encoded = encodeStorageSubquery(sq.blockNumber, sq.addr, sq.slot);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.txSubqueries ?? []) {
      const encoded = encodeTxSubquery(sq.txHash, sq.fieldOrCalldataIdx);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.receiptSubqueries ?? []) {
      const encoded = encodeReceiptSubquery(
        sq.txHash,
        sq.fieldOrLogIdx,
        sq.topicOrDataIdx,
        sq.eventSchema
      );
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.solidityNestedMappingSubqueries ?? []) {
      const encoded = encodeSolidityNestedMappingSubquery(
        sq.blockNumber,
        sq.addr,
        sq.mappingSlot,
        sq.mappingDepth,
        sq.keys
      );
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.beaconSubqueries ?? []) {
      const encoded = encodeBeaconValidatorSubquery();
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    return encodedSubqueries;
  }

  private handleDataQueryRequest(dataQuery: DataQueryRequestV2) {
    let parsedDataQuery = {} as DataQueryRequestV2;
    // Handle all of the queryReuquest subquery types
    if (dataQuery.headerSubqueries) {
      parsedDataQuery.headerSubqueries = this.handleHeaderSubqueries(dataQuery.headerSubqueries);
    }
    if (dataQuery.accountSubqueries) {
      parsedDataQuery.accountSubqueries = this.handleAccountSubqueries(dataQuery.accountSubqueries);
    }
    if (dataQuery.storageSubqueries) {
      parsedDataQuery.storageSubqueries = this.handleStorageSubqueries(dataQuery.storageSubqueries);
    }
    if (dataQuery.txSubqueries) {
      parsedDataQuery.txSubqueries = this.handleTxSubqueries(dataQuery.txSubqueries);
    }
    if (dataQuery.receiptSubqueries) {
      parsedDataQuery.receiptSubqueries = this.handleReceiptSubqueries(dataQuery.receiptSubqueries);
    }
    if (dataQuery.solidityNestedMappingSubqueries) {
      parsedDataQuery.solidityNestedMappingSubqueries = this.handleSolidityNestedMappingSubqueries(
        dataQuery.solidityNestedMappingSubqueries
      );
    }
    if (dataQuery.beaconSubqueries) {
      parsedDataQuery.beaconSubqueries = this.handleBeaconSubqueries(dataQuery.beaconSubqueries);
    }
    return parsedDataQuery;
  }

  private handleHeaderSubqueries(headerSubqueries: HeaderSubquery[]) {
    return headerSubqueries;
  }

  private handleAccountSubqueries(accountSubqueries: AccountSubquery[]) {
    return accountSubqueries;
  }

  private handleStorageSubqueries(storageSubqueries: StorageSubquery[]) {
    return storageSubqueries;
  }

  private handleTxSubqueries(txSubqueries: TxSubquery[]) {
    return txSubqueries;
  }

  private handleReceiptSubqueries(receiptSubqueries: ReceiptSubquery[]) {
    return receiptSubqueries;
  }

  private handleSolidityNestedMappingSubqueries(
    solidityNestedMappingSubqueries: SolidityNestedMappingSubquery[]
  ) {
    return solidityNestedMappingSubqueries;
  }

  private handleBeaconSubqueries(beaconSubqueries: BeaconValidatorSubquery[]) {
    return beaconSubqueries;
  }

  private handleComputeQueryRequest(computeQuery: AxiomV2ComputeQuery) {
    computeQuery.vkey = computeQuery.vkey.map((x) => ethers.toBeHex(x, 32));
    if (computeQuery.vkey.length < ConstantsV2.VkeyLen) {
      computeQuery.vkey = resizeArray(computeQuery.vkey, ConstantsV2.VkeyLen, ethers.ZeroHash);
    }
    computeQuery.computeProof = computeQuery.computeProof.map((x) => ethers.toBeHex(x, 32));
    if (computeQuery.computeProof.length < ConstantsV2.ProofLen) {
      computeQuery.computeProof = resizeArray(computeQuery.computeProof, ConstantsV2.ProofLen, ethers.ZeroHash);
    }
    return computeQuery;
  }

  private handleCallback(callback: AxiomV2Callback) {
    return callback;
  }
}
