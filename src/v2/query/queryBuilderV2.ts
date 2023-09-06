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
  encodeDataQuery,
  DataSubquery,
  Subquery,
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
  append(dataQuery: DataQueryRequestV2) {
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
  appendDataSubquery(type: DataSubqueryType, dataSubquery: Subquery) {
    this.unsetBuiltQuery();

    if (this.dataQuery === undefined) {
      this.dataQuery = this.newEmptyDataQuery();
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
    // Check if data subqueries are valid
    const sq = await this.validateDataSubqueries();

    // Check if compute query is valid
    // WIP
    const cq = true;

    // Check if callback is valid
    // WIP
    const cb = true;

    return (sq || cq || cb);
  }

  async build(): Promise<BuiltQueryV2> {
    // Encode data query
    const dataQuery = this.encodeBuilderDataQuery();
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

  private encodeBuilderDataQuery(): string {
    return encodeDataQuery(
      this.config.chainId, 
      this.concatenateDataSubqueriesWithType()
    );
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
    callback.callbackAddr = callback.callbackAddr.toLowerCase();
    callback.callbackExtraData = callback.callbackExtraData.toLowerCase();
    callback.callbackFunctionSelector = callback.callbackFunctionSelector.toLowerCase();
    return callback;
  }

  private newEmptyDataQuery(): DataQueryRequestV2 {
    return {
      headerSubqueries: [],
      accountSubqueries: [],
      storageSubqueries: [],
      txSubqueries: [],
      receiptSubqueries: [],
      solidityNestedMappingSubqueries: [],
      beaconSubqueries: [],
    }
  }

  private async validateDataSubqueries(): Promise<boolean> {
    if (!this.dataQuery) {
      return true;
    }
    const provider = this.config.provider;
    for (const subquery of this.dataQuery.headerSubqueries ?? [] as HeaderSubquery[]) {
      const valid = await validateHeaderSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.accountSubqueries ?? [] as AccountSubquery[]) {
      const valid = await validateAccountSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.storageSubqueries ?? [] as StorageSubquery[]) {
      const valid = await validateStorageSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.txSubqueries ?? [] as TxSubquery[]) {
      const valid = await validateTxSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.receiptSubqueries ?? [] as ReceiptSubquery[]) {
      const valid = await validateReceiptSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.solidityNestedMappingSubqueries ?? [] as SolidityNestedMappingSubquery[]) {
      const valid = await validateSolidityNestedMappingSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    for (const subquery of this.dataQuery.beaconSubqueries ?? [] as BeaconValidatorSubquery[]) {
      const valid = await validateBeaconSubquery(provider, subquery);
      if (!valid) {
        return false;
      }
    }
    return true;
  }
}
