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
  TxSubquery,
  encodeDataQuery,
  DataSubquery,
  Subquery,
  bytes32,
  encodeQueryV2,
  AxiomV2DataQuery,
  getQuerySchemaHash,
  getQueryHashV2,
  validateSize,
  validateAddress,
  validateBytes32,
  HeaderField,
  AccountField,
  getAccountFieldIdx,
  getHeaderFieldIdx,
  TxType,
  getTxFieldIdx,
  TxField,
  getReceiptFieldIdx,
  ReceiptField,
  getDataQueryHashFromSubqueries,
} from "@axiom-crypto/codec";
import { InternalConfig } from "../../core/internalConfig";
import {
  BuiltQueryV2,
  DataQueryRequestV2,
  QueryBuilderV2Options,
  ReceiptSubqueryLogType,
  ReceiptSubqueryType,
  TxSubqueryType,
} from "../types";
import { ethers } from "ethers";
import { getAxiomQueryAbiForVersion } from "../../core/lib/abi";
import { ConstantsV2, newEmptyDataQuery } from "../constants";
import { PaymentCalc } from "./paymentCalc";
import {
  getSubqueryTypeFromKey,
  validateAccountSubquery,
  validateHeaderSubquery,
  validateStorageSubquery,
  validateTxSubquery,
  validateReceiptSubquery,
  validateSolidityNestedMappingSubquery,
  validateBeaconSubquery,
} from "./dataSubquery/validate";
import { convertIpfsCidToBytes32, writeStringIpfs } from "../../shared/ipfs";
import { receiptUseAddress, receiptUseDataIdx, receiptUseLogIdx, receiptUseTopicIdx, txUseCalldataIdx, txUseContractDataIdx } from "../fields";

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
      this.append(dataQuery);
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

  getQuerySchema(): string {
    return getQuerySchemaHash(
      this.computeQuery?.k ?? 0,
      this.computeQuery?.vkey ?? []
    );
  }
  
  getDataQueryHash(): string {
    return getDataQueryHashFromSubqueries(
      this.config.chainId.toString(),
      this.concatenateDataSubqueriesWithType()
    );
  }

  getQueryHash(): string {
    const computeQuery = this.computeQuery ?? ConstantsV2.EmptyComputeQueryObject;
    return getQueryHashV2(
      this.config.chainId.toString(),
      this.getDataQueryHash(),
      computeQuery
    );
  }

  unsetBuiltQuery() {
    // Reset built query if any data is changed
    this.builtQuery = undefined;
  }

  setDataQuery(dataQuery: DataQueryRequestV2) {
    this.unsetBuiltQuery();
    this.dataQuery = undefined;
    this.append(dataQuery);
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
  append(dataQuery: DataQueryRequestV2): void {
    this.unsetBuiltQuery();

    Object.keys(dataQuery).forEach((key) => {
      const subqueries = dataQuery[key as keyof DataQueryRequestV2];
      if (subqueries) {
        for (const subquery of subqueries) {
          this.appendDataSubquery(getSubqueryTypeFromKey(key), subquery);
        }
      }
    });
  }

  /**
   * Appends a single subquery to the current dataQuery
   * @param type The type of subquery to append
   * @param dataSubquery The data of the subquery to append
   */
  appendDataSubquery(type: DataSubqueryType, dataSubquery: Subquery): void {
    this.unsetBuiltQuery();

    if (this.dataQuery === undefined) {
      this.dataQuery = newEmptyDataQuery();
    }

    // Cast subquery to new type in order to lowercase all string value fields
    const subqueryCast = dataSubquery as {[key: string]: any};
    for (const key of Object.keys(subqueryCast)) {
      if (typeof subqueryCast[key] === "string") {
        subqueryCast[key] = subqueryCast[key].toLowerCase();
      }
    }

    // Append based on type
    Object.keys(this.dataQuery).forEach((key) => {
      if (type === getSubqueryTypeFromKey(key)) {
        (this.dataQuery?.[key as keyof DataQueryRequestV2] as Subquery[])?.push(dataSubquery);
      }
    });
  }

  /**
   * Appends a HeaderSubquery to the DataQuery
   * @param headerSubquery HeaderSubquery to append
   */
  appendHeaderSubquery(
    headerSubquery: HeaderSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.Header, headerSubquery);
  }

  /**
   * Appends a AccountSubquery to the DataQuery
   * @param accountSubquery AccountSubquery to append
   */
  appendAccountSubquery(
    accountSubquery: AccountSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.Account, accountSubquery);
  }

  /**
   * Appends a StorageSubquery to the DataQuery
   * @param storageSubquery StorageSubquery to append
   */
  appendStorageSubquery(
    headerSubquery: StorageSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.Storage, headerSubquery);
  }

  /**
   * Appends a TxSubquery to the DataQuery
   * @param txSubquery TxSubquery to append
   */
  appendTxSubquery(
    txSubquery: TxSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.Transaction, txSubquery);
  }

  /**
   * Appends a ReceiptSubquery to the DataQuery
   * @param receiptSubquery ReceiptSubquery to append
   */
  appendReceiptSubquery(
    receiptSubquery: ReceiptSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.Receipt, receiptSubquery);
  }

  /**
   * Appends a SolidityNestedMappingSubquery to the DataQuery
   * @param solidityNestedMappingSubquery SolidityNestedMappingSubquery to append
   */
  appendSolidityNestedMappingSubquery(
    solidityNestedMappingSubquery: SolidityNestedMappingSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.SolidityNestedMapping, solidityNestedMappingSubquery);
  }

  /**
   * Appends a BeaconValidatorSubquery to the DataQuery
   * @param beaconValidatorSubquery BeaconValidatorSubquery to append
   */
  appendBeaconValidatorSubquery(
    beaconValidatorSubquery: BeaconValidatorSubquery
  ): void {
    this.appendDataSubquery(DataSubqueryType.BeaconValidator, beaconValidatorSubquery);
  }

  async sendOnchainQuery(
    paymentAmountWei: string,
    cb?: (receipt: ethers.TransactionReceipt) => void
  ) {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before sending. If Query is modified after building, you must run `.build()` again.");
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
      this.builtQuery.dataQueryEncoded,
      { value: paymentAmountWei }
    );
    const receipt = await tx.wait();

    if (cb !== undefined) {
      cb(receipt);
    }
  }

  async sendQueryWithIpfs(
    paymentAmountWei: string,
    cb?: (receipt: ethers.TransactionReceipt) => void
  ) {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before sending. If Query is modified after building, you must run `.build()` again.");
    }
    
    // Handle encoding data and uploading to IPFS
    const encodedQuery = encodeQueryV2(
      this.builtQuery.sourceChainId,
      this.builtQuery.dataQuery,
      this.builtQuery.computeQuery,
      this.builtQuery.callback,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
    );
    const ipfsHash = await writeStringIpfs(encodedQuery);
    if (!ipfsHash) {
      throw new Error("Failed to write Query to IPFS.");
    }
    const ipfsHashBytes32 = convertIpfsCidToBytes32(ipfsHash);

    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.signer
    );
    
    const tx = await axiomV2Query.sendQueryWithIpfsData(
      this.builtQuery.queryHash,
      this.builtQuery.querySchema,
      ipfsHashBytes32,
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
    // Check if data subqueries are valid
    const sq = await this.validateDataSubqueries();

    // Check if compute query is valid
    // WIP
    const cq = true;

    // Check if callback is valid
    // WIP
    const cb = true;

    return (sq && cq && cb);
  }

  async build(): Promise<BuiltQueryV2> {
    // Encode data query
    const allSubqueries = this.concatenateDataSubqueriesWithType();
    const dataQueryEncoded = this.encodeBuilderDataQuery(allSubqueries);
    const dataQueryHash = getDataQueryHashFromSubqueries(
      this.config.chainId.toString(),
      allSubqueries
    );
    const dataQuery = this.buildDataQuery(allSubqueries);

    // Handle compute query
    let computeQuery: AxiomV2ComputeQuery = ConstantsV2.EmptyComputeQueryObject;
    if (this.computeQuery !== undefined) {
      computeQuery.k = this.computeQuery.k;
      computeQuery.vkey = this.computeQuery.vkey;
      computeQuery.computeProof = this.computeQuery.computeProof;
    }
    const querySchema = getQuerySchemaHash(
      computeQuery.k,
      computeQuery.vkey
    );

    // Get the hash of the full Query
    const queryHash = getQueryHashV2(
      this.config.chainId.toString(),
      dataQueryHash,
      computeQuery
    );

    // Handle callback
    const callback = {
      callbackAddr: this.callback?.callbackAddr ?? ethers.ZeroAddress,
      callbackFunctionSelector:
        this.callback?.callbackFunctionSelector ?? ConstantsV2.EmptyBytes4,
      resultLen: this.callback?.resultLen ?? ConstantsV2.MaxOutputs,
      callbackExtraData: this.callback?.callbackExtraData ?? ethers.ZeroHash,
    };

    this.builtQuery = {
      sourceChainId: this.config.chainId.toString(),
      queryHash,
      dataQueryEncoded,
      dataQueryHash,
      dataQuery,
      computeQuery,
      querySchema,
      callback,
      maxFeePerGas: this.options.maxFeePerGas!,
      callbackGasLimit: this.options.callbackGasLimit!,
    };

    return this.builtQuery;
  }

  calculateFee(): string {
    return PaymentCalc.calculatePayment(this);
  }

  private concatenateDataSubqueriesWithType(): DataSubquery[] {
    return [
      ...this.dataQuery?.headerSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.Header,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.accountSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.Account,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.storageSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.Storage,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.txSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.Transaction,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.receiptSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.Receipt,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.solidityNestedMappingSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.SolidityNestedMapping,
          subqueryData: data,
        }
      }) ?? [],
      ...this.dataQuery?.beaconSubqueries?.map((data) => { 
        return {
          type: DataSubqueryType.BeaconValidator,
          subqueryData: data,
        }
      }) ?? [],
    ];
  }

  private encodeBuilderDataQuery(allSubqueries: DataSubquery[]): string {
    return encodeDataQuery(
      this.config.chainId, 
      allSubqueries
    );
  }

  private buildDataQuery(allSubqueries: DataSubquery[]): AxiomV2DataQuery {
    const sourceChainId = this.config.chainId.toString();
    return {
      sourceChainId,
      subqueries: allSubqueries,
    }
  }

  private handleComputeQueryRequest(computeQuery: AxiomV2ComputeQuery) {
    computeQuery.vkey = computeQuery.vkey.map((x) => bytes32(x));
    return computeQuery;
  }

  private handleCallback(callback: AxiomV2Callback) {
    callback.callbackAddr = callback.callbackAddr.toLowerCase();
    callback.callbackExtraData = callback.callbackExtraData.toLowerCase();
    callback.callbackFunctionSelector = callback.callbackFunctionSelector.toLowerCase();
    return callback;
  }

  private async validateDataSubqueries(): Promise<boolean> {
    if (!this.dataQuery) {
      return true;
    }
    const provider = this.config.provider;
    let validQuery = true;
    for (const subquery of this.dataQuery.headerSubqueries ?? [] as HeaderSubquery[]) {
      validQuery = validQuery && await validateHeaderSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.accountSubqueries ?? [] as AccountSubquery[]) {
      validQuery = validQuery && await validateAccountSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.storageSubqueries ?? [] as StorageSubquery[]) {
      validQuery = validQuery && await validateStorageSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.txSubqueries ?? [] as TxSubquery[]) {
      validQuery = validQuery && await validateTxSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.receiptSubqueries ?? [] as ReceiptSubquery[]) {
      validQuery = validQuery && await validateReceiptSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.solidityNestedMappingSubqueries ?? [] as SolidityNestedMappingSubquery[]) {
      validQuery = validQuery && await validateSolidityNestedMappingSubquery(provider, subquery);
    }
    for (const subquery of this.dataQuery.beaconSubqueries ?? [] as BeaconValidatorSubquery[]) {
      validQuery = validQuery && await validateBeaconSubquery(provider, subquery);
    }
    return validQuery;
  }
}
