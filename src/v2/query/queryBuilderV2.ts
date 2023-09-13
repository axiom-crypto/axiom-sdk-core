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
} from "./dataSubquery";
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
   * @param blockNumber Block number to query
   * @param fieldIdx Header field index
   */
  appendHeaderSubquery(
    blockNumber: number | string | BigInt,
    field: HeaderField,
  ): void {
    validateSize(blockNumber, "uint32");

    const subquery: HeaderSubquery = {
      blockNumber: Number(blockNumber),
      fieldIdx: getHeaderFieldIdx(field),
    };
    this.appendDataSubquery(DataSubqueryType.Header, subquery);
  }

  /**
   * Appends a AccountSubquery to the DataQuery
   * @param blockNumber Block number to query
   * @param addr Address to query
   * @param fieldIdx Account field index
   */
  appendAccountSubquery(
    blockNumber: number | string | BigInt,
    addr: string,
    field: AccountField,
  ): void {
    validateSize(blockNumber, "uint32");
    validateAddress(addr);

    const subquery: AccountSubquery = {
      blockNumber: Number(blockNumber),
      addr,
      fieldIdx: getAccountFieldIdx(field),
    };
    this.appendDataSubquery(DataSubqueryType.Account, subquery);
  }

  /**
   * Appends a StorageSubquery to the DataQuery
   * @param blockNumber Block number to query
   * @param addr Contract address
   * @param slot Slot number
   */
  appendStorageSubquery(
    blockNumber: number | string | BigInt,
    addr: string,
    slot: number | string | BigInt,
  ): void {
    validateSize(blockNumber, "uint32");
    validateAddress(addr);
    validateSize(slot, "uint256");

    const subquery: StorageSubquery = {
      blockNumber: Number(blockNumber),
      addr,
      slot: slot.toString(),
    };
    this.appendDataSubquery(DataSubqueryType.Storage, subquery);
  }

  /**
   * Appends a TxSubquery to the DataQuery
   * @param txHash Transaction hash
   * @param type The type of TxSubquery
   * @param idxOrFieldForType Index or TxField enum for the above TxType
   * @param txFieldType (optional) The type of transaction (default: EIP-1559)
   */
  appendTxSubquery(
    txHash: string,
    type: TxSubqueryType,
    idxOrFieldForType: number | string | BigInt | TxField,
    txFieldType?: TxType,
  ): void {
    validateBytes32(txHash);

    // Use default EIP-1559 Tx field type
    if (txFieldType === undefined) {
      txFieldType = TxType.Eip1559;
    }
    
    // Handle the field index based on the TxSubquery type
    let typedIdx: number;
    if (type === TxSubqueryType.Field) {
      typedIdx = getTxFieldIdx(txFieldType, Number(idxOrFieldForType));
    } else if (type === TxSubqueryType.Calldata) {
      typedIdx = txUseCalldataIdx(Number(idxOrFieldForType));
    } else if (type === TxSubqueryType.ContractData) {
      typedIdx = txUseContractDataIdx(Number(idxOrFieldForType));
    } else {
      throw new Error(`Invalid TxSubqueryType: ${type}`);
    }
    validateSize(typedIdx, "uint32");

    const subquery: TxSubquery = {
      txHash,
      fieldOrCalldataIdx: typedIdx,
    };
    this.appendDataSubquery(DataSubqueryType.Transaction, subquery);
  }

  /**
   * Appends a ReceiptSubquery to the DataQuery
   * @param txHash Transaction hash
   * @param type The type of ReceiptSubquery
   * @param idxOrFieldForType Index or ReceiptField enum for the above type
   * @param logType (optional) The type of data for the log for this subquery
   * @param idxForLogType (optional) Index of the above log data type
   * @param eventSchema (optional) The event schema for this log
   */
  appendReceiptSubquery(
    txHash: string,
    type: ReceiptSubqueryType,
    idxOrFieldForType: number | string | BigInt | ReceiptField,
    logType?: ReceiptSubqueryLogType,
    idxForLogType?: number | string | BigInt,
    eventSchema?: string,
  ): void {
    validateBytes32(txHash);
    validateSize(idxOrFieldForType, "uint32");

    let subquery: ReceiptSubquery = {
      txHash,
      fieldOrLogIdx: getReceiptFieldIdx(Number(idxOrFieldForType)),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    };

    if (type === ReceiptSubqueryType.Field) {
      // Do nothing
    } else if (type === ReceiptSubqueryType.Log) {
      if (
        logType === undefined || 
        idxForLogType === undefined || 
        eventSchema === undefined
      ) {
        throw new Error(
          "`logType`, `idxForLogType`, and `eventSchema` must be defined when type is ReceiptSubqueryType.Log"
        );
      }
      validateSize(idxForLogType, "uint32");
      
      // Write the index based on field/log
      subquery.fieldOrLogIdx = receiptUseLogIdx(Number(idxOrFieldForType));

      // Write index based on the log type
      if (logType === ReceiptSubqueryLogType.Topic) {
        subquery.topicOrDataOrAddressIdx = receiptUseTopicIdx(Number(idxForLogType));
      } else if (logType === ReceiptSubqueryLogType.Data) {
        subquery.topicOrDataOrAddressIdx = receiptUseDataIdx(Number(idxForLogType));
      } else if (logType === ReceiptSubqueryLogType.Address) {
        subquery.topicOrDataOrAddressIdx = receiptUseAddress();
      } else {
        throw new Error(`Invalid ReceiptSubqueryLogType: ${logType}`);
      }
      validateSize(subquery.topicOrDataOrAddressIdx, "uint32");

      // Write the event schema
      validateBytes32(eventSchema);
      subquery.eventSchema = eventSchema;
    } else {
      throw new Error(`Invalid ReceiptSubqueryType: ${type}`);
    }

    this.appendDataSubquery(DataSubqueryType.Receipt, subquery);
  }

  /**
   * Appends a SolidityNestedMappingSubquery to the DataQuery
   * @param blockNumber Block number to query
   * @param addr Contract address containing the mapping
   * @param mappingSlot Storage slot of the mapping
   * @param mappingDepth How many mappings deep the value is located (max: 4)
   * @param keys Array of bytes32 keys of the nested mapping(s) to the value (length of array should match `mappingDepth`)
   */
  appendSolidityNestedMappingSubquery(
    blockNumber: number | string | BigInt,
    addr: string,
    mappingSlot: number | string | BigInt,
    mappingDepth: number | string | BigInt,
    keys: string[],
  ): void {
    validateSize(blockNumber, "uint32");
    validateAddress(addr);
    validateSize(mappingSlot, "uint256");
    validateSize(mappingDepth, "uint8");

    keys = keys.map((key) => bytes32(key));
    keys.forEach((key) => validateBytes32(key));

    const subquery: SolidityNestedMappingSubquery = {
      blockNumber: Number(blockNumber),
      addr,
      mappingSlot: mappingSlot.toString(),
      mappingDepth: Number(mappingDepth),
      keys,
    };
    this.appendDataSubquery(DataSubqueryType.SolidityNestedMapping, subquery);
  }

  /**
   * Appends a BeaconValidatorSubquery to the DataQuery
   */
  appendBeaconValidatorSubquery(): void {
    // WIP
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
