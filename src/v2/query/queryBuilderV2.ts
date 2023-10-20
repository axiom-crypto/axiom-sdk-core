import { ethers } from "ethers";
import {
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  DataSubqueryType,
  bytes32,
  encodeQueryV2,
  getQuerySchemaHash,
  getQueryHashV2,
  getDataQueryHashFromSubqueries,
  AxiomV2CircuitConstant,
  getQueryId,
  getCallbackHash,
} from "@axiom-crypto/tools";
import { InternalConfig } from "../../core/internalConfig";
import {
  BuiltQueryV2,
  AxiomV2QueryOptions,
  UnbuiltSubquery,
  UnbuiltHeaderSubquery,
  UnbuiltAccountSubquery,
  UnbuiltStorageSubquery,
  UnbuiltTxSubquery,
  UnbuiltReceiptSubquery,
  UnbuiltSolidityNestedMappingSubquery,
  UnbuiltBeaconValidatorSubquery,
} from "../types";
import { getAxiomQueryAbiForVersion } from "../../core/lib/abi";
import { ConstantsV2 } from "../constants";
import { PaymentCalc } from "./paymentCalc";
import {
  validateAccountSubquery,
  validateHeaderSubquery,
  validateStorageSubquery,
  validateTxSubquery,
  validateReceiptSubquery,
  validateSolidityNestedMappingSubquery,
  validateBeaconSubquery,
} from "./dataSubquery/validate";
import {
  convertIpfsCidToBytes32,
  writeStringIpfs,
} from "../../shared/ipfs";
import { getUnbuiltSubqueryTypeFromKeys } from "./dataSubquery/utils";
import {
  buildDataQuery,
  buildDataSubqueries,
  encodeBuilderDataQuery,
} from "./dataSubquery/build";
import { calculateCalldataGas } from "./gasCalc";

export class QueryBuilderV2 {
  protected readonly config: InternalConfig;
  private builtQuery?: BuiltQueryV2;
  private dataQuery?: UnbuiltSubquery[];
  private computeQuery?: AxiomV2ComputeQuery;
  private callback?: AxiomV2Callback;
  private options: AxiomV2QueryOptions;

  constructor(
    config: InternalConfig,
    dataQuery?: UnbuiltSubquery[],
    computeQuery?: AxiomV2ComputeQuery,
    callback?: AxiomV2Callback,
    options?: AxiomV2QueryOptions,
  ) {
    this.config = config;

    this.options = this.setOptions(options ?? {});

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

  /**
   * Gets the current set of unbuilt data subqueries
   * @returns Array of unbuilt data subqueries
   */
  getDataQuery(): UnbuiltSubquery[] | undefined {
    return this.dataQuery;
  }

  /**
   * Gets the current compute query
   * @returns The current compute query
   */
  getComputeQuery(): AxiomV2ComputeQuery | undefined {
    return this.computeQuery;
  }

  /**
   * Gets the callback information
   * @returns The current callback information
   */
  getCallback(): AxiomV2Callback | undefined {
    return this.callback;
  }

  /**
   * Gets the current Query options
   * @returns The current Query options
   */
  getOptions(): AxiomV2QueryOptions {
    return this.options;
  }

  /**
   * Gets the built Query. Built Query resets if any data is changed.
   * @returns The built Query; undefined if Query has not been built yet
   */
  getBuiltQuery(): BuiltQueryV2 | undefined {
    return this.builtQuery;
  }

  /**
   * Gets the hash of the querySchema of the computeQuery
   * @returns Query schema hash
   */
  getQuerySchema(): string {
    return getQuerySchemaHash(
      this.computeQuery?.k ?? 0,
      this.computeQuery?.resultLen ?? this.getDefaultResultLen(),
      this.computeQuery?.vkey ?? []
    );
  }

  /**
   * Gets the hash of the data query
   * @returns Data query hash
   */
  getDataQueryHash(): string {
    if (this.builtQuery === undefined) {
      throw new Error(
        "Query must first be built with `.build()` before getting data query hash. If Query is modified after building, you will need to run `.build()` again."
      );
    }
    return getDataQueryHashFromSubqueries(
      this.config.chainId.toString(),
      this.builtQuery.dataQueryStruct.subqueries
    );
  }

  getQueryHash(): string {
    if (this.builtQuery === undefined) {
      throw new Error(
        "Query must first be built with `.build()` before getting query hash. If Query is modified after building, you will need to run `.build()` again."
      );
    }
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

  setDataQuery(dataQuery: UnbuiltSubquery[]) {
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

  setOptions(options: AxiomV2QueryOptions): AxiomV2QueryOptions {
    this.unsetBuiltQuery();
    this.options = {
      maxFeePerGas: options?.maxFeePerGas ?? ConstantsV2.DefaultMaxFeePerGas,
      callbackGasLimit: options?.callbackGasLimit ?? ConstantsV2.DefaultCallbackGasLimit,
      dataQueryCalldataGasLimit: options?.dataQueryCalldataGasLimit ?? ConstantsV2.DefaultDataQueryCalldataGasLimit,
      refundee: options?.refundee,
    }
    return this.options;
  }

  /**
   * Append a `UnbuiltSubquery[]` object to the current dataQuery
   * @param dataQuery A `UnbuiltSubquery[]` object to append
   */
  append(dataSubqueries: UnbuiltSubquery[]): void {
    this.unsetBuiltQuery();

    if (this.dataQuery === undefined) {
      this.dataQuery = [] as UnbuiltSubquery[];
    }

    if (this.dataQuery?.length + dataSubqueries.length > AxiomV2CircuitConstant.UserMaxSubqueries) {
      throw new Error(`Cannot add more than ${AxiomV2CircuitConstant.UserMaxSubqueries} subqueries`);
    }

    // Append new dataSubqueries to existing dataQuery
    this.dataQuery = [...this.dataQuery ?? [], ...dataSubqueries];
  }

  /**
   * Appends a single subquery to the current dataQuery
   * @param dataSubquery The data of the subquery to append
   * @param type (optional) The type of subquery to append. If not provided, the type will be
   *             inferred from the keys of the subquery.
   */
  appendDataSubquery(dataSubquery: UnbuiltSubquery): void {
    this.append([dataSubquery]);
  }

  async sendOnchainQuery(
    paymentAmountWei: string,
    cb?: (receipt: ethers.ContractTransactionReceipt) => void
  ): Promise<string> {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error(
        "Query must be built with `.build()` before sending. If Query is modified after building, you must run `.build()` again."
      );
    }

    // Check dataQuery gas cost
    const dataQueryGasCost = calculateCalldataGas(this.builtQuery.dataQuery);
    const dataQueryGasLimit = this?.options?.dataQueryCalldataGasLimit ?? ConstantsV2.DefaultDataQueryCalldataGasLimit;
    if (dataQueryGasCost > dataQueryGasLimit) {
      throw new Error(
        `Data query calldata gas cost ${dataQueryGasCost} exceeds limit ${dataQueryGasLimit}. Either increase this limit in options or use 'sendQueryWithIpfs()' instead.`
      );
    }

    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery,
      getAxiomQueryAbiForVersion(this.config.version),
      this.config.signer
    );

    const queryId = await this.getQueryId();

    console.log(this.builtQuery);

    const tx = await axiomV2Query.sendQuery(
      this.builtQuery.sourceChainId,
      this.builtQuery.dataQueryHash,
      this.builtQuery.computeQuery,
      this.builtQuery.callback,
      this.builtQuery.userSalt,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
      this.builtQuery.refundee,
      this.builtQuery.dataQuery,
      { value: paymentAmountWei }
    );
    const receipt: ethers.ContractTransactionReceipt = await tx.wait();

    if (cb !== undefined) {
      cb(receipt);
    }

    return queryId;
  }

  async sendQueryWithIpfs(
    paymentAmountWei: string,
    cb?: (receipt: ethers.ContractTransactionReceipt) => void
  ): Promise<string> {
    if (this.config.signer === undefined) {
      throw new Error("`privateKey` in AxiomConfig required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before sending. If Query is modified after building, you must run `.build()` again.");
    }

    const caller = await this.config.signer?.getAddress();

    // Handle encoding data and uploading to IPFS
    const encodedQuery = encodeQueryV2(
      this.builtQuery.sourceChainId,
      caller,
      this.builtQuery.dataQueryHash,
      this.builtQuery.computeQuery,
      this.builtQuery.callback,
      this.builtQuery.userSalt,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
      this.builtQuery.refundee,
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

    const queryId = await this.getQueryId();

    const tx = await axiomV2Query.sendQueryWithIpfsData(
      this.builtQuery.queryHash,
      ipfsHashBytes32,
      this.builtQuery.callback,
      this.builtQuery.userSalt,
      this.builtQuery.maxFeePerGas,
      this.builtQuery.callbackGasLimit,
      { value: paymentAmountWei }
    );
    const receipt = await tx.wait();

    if (cb !== undefined) {
      cb(receipt);
    }

    return queryId;
  }

  /**
   * @returns {boolean} Whether the query is valid or not
   */
  async validate(): Promise<boolean> {
    // Check if data subqueries are valid
    const data = await this.validateDataSubqueries();

    // Check if compute query is valid
    const compute = await this.validateComputeQuery();

    // Check if callback is valid
    const callback = await this.validateCallback();

    return (data && compute && callback);
  }

  /**
   * Queries the required subquery data and builds the entire Query object into the format
   * that is required by the backend/ZK circuit
   * @returns A built Query object
   */
  async build(): Promise<BuiltQueryV2> {
    // Check if Query can be built: needs at least a dataQuery or computeQuery
    let validDataQuery = true;
    if (this.dataQuery === undefined || this.dataQuery.length === 0) {
      validDataQuery = false;
    }
    let validComputeQuery = true;
    if (this.computeQuery === undefined || this.computeQuery.k === 0) {
      validComputeQuery = false;
    }
    if (!validDataQuery && !validComputeQuery) {
      throw new Error("Cannot build Query without data or compute query");
    }

    // Parse and get fetch appropriate data for all data subqueries
    const builtDataSubqueries = await buildDataSubqueries(
      this.config.provider,
      this.dataQuery ?? []
    );

    // Encode & build data query
    const dataQuery = encodeBuilderDataQuery(
      this.config.chainId,
      builtDataSubqueries
    );
    const dataQueryHash = getDataQueryHashFromSubqueries(
      this.config.chainId.toString(),
      builtDataSubqueries
    );
    const dataQueryStruct = buildDataQuery(
      this.config.chainId,
      builtDataSubqueries
    );

    // Handle compute query
    let defaultResultLen = this.getDefaultResultLen();
    let computeQuery: AxiomV2ComputeQuery = {
      k: 0,
      resultLen: defaultResultLen,
      vkey: [] as string[],
      computeProof: "0x00",
    }
    if (this.computeQuery !== undefined) {
      computeQuery.k = this.computeQuery.k;
      computeQuery.resultLen = this.computeQuery?.resultLen ?? defaultResultLen;
      computeQuery.vkey = this.computeQuery.vkey;
      computeQuery.computeProof = this.computeQuery.computeProof;
    }

    const querySchema = getQuerySchemaHash(
      computeQuery.k,
      computeQuery.resultLen ?? defaultResultLen,
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
      target: this.callback?.target ?? ethers.ZeroAddress,
      extraData: this.callback?.extraData ?? ethers.ZeroHash,
    };

    // Get the refundee address
    const caller = await this.config.signer?.getAddress();
    const refundee = this.options?.refundee ?? caller ?? "";
    if (caller === undefined) {
      console.warn("No caller address found because privateKey not specified in AxiomConfig. Refundee will be set to empty string.");
    }

    // Calculate a salt
    const userSalt = this.calculateUserSalt();

    this.builtQuery = {
      sourceChainId: this.config.chainId.toString(),
      queryHash,
      dataQuery,
      dataQueryHash,
      dataQueryStruct,
      computeQuery,
      querySchema,
      callback,
      userSalt,
      maxFeePerGas: this.options.maxFeePerGas!,
      callbackGasLimit: this.options.callbackGasLimit!,
      refundee,
    };

    return this.builtQuery;
  }

  /**
   * Gets a queryId for a built Query (requires `privateKey` to be set in AxiomConfig)
   * @returns uint256 queryId
   */
  async getQueryId(): Promise<string> {
    if (!this.builtQuery) {
      throw new Error("Must build query first before getting queryId");
    }

    // Get required queryId params
    const caller = await this.config.signer?.getAddress();
    if (!caller) {
      throw new Error("Unable to get signer address; ensure you have set `privateKey` in AxiomConfig");
    }
    const refundee = this.options?.refundee ?? caller;
    const salt = this.builtQuery.userSalt;
    const queryHash = this.builtQuery.queryHash;
    const callbackHash = getCallbackHash(
      this.builtQuery.callback.target,
      this.builtQuery.callback.extraData,
    );

    // Calculate the queryId
    const queryId = getQueryId(
      caller,
      salt,
      queryHash,
      callbackHash,
      refundee,
    );
    return BigInt(queryId).toString();
  }

  /**
   * Calculates the fee (in wei) required to send the Query
   * @returns The amount of wei required to send this query
   */
  calculateFee(): string {
    return PaymentCalc.calculatePayment(this);
  }

  async calculateRequiredPayment(): Promise<string> {
    const axiomQueryAddr = this.config.getConstants().Addresses.AxiomQuery;
    const axiomQueryAbi = getAxiomQueryAbiForVersion(this.config.version);
    const userAddress = this.config.signer?.address;
    if (userAddress === undefined) {
      throw new Error("Unable to get current balance: need to have a signer defined (private key must be input into AxiomConfig)");
    }
    const currentBalance = BigInt(await PaymentCalc.getBalance(
      this.config.providerUri,
      userAddress,
      axiomQueryAddr,
      axiomQueryAbi,
    ));
    const totalFee = BigInt(this.calculateFee());
    const requiredPayment = totalFee - currentBalance;
    return requiredPayment.toString();
  }

  private calculateUserSalt(): string {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  private getDefaultResultLen(): number {
    return Math.min(this.dataQuery?.length ?? 0, AxiomV2CircuitConstant.UserMaxOutputs);
  }

  private handleComputeQueryRequest(computeQuery: AxiomV2ComputeQuery) {
    computeQuery.resultLen = computeQuery.resultLen ?? this.getDefaultResultLen();
    computeQuery.vkey = computeQuery.vkey.map((x: string) => bytes32(x));
    return computeQuery;
  }

  private handleCallback(callback: AxiomV2Callback): AxiomV2Callback {
    callback.target = callback.target.toLowerCase();
    callback.extraData = callback.extraData.toLowerCase();
    return callback;
  }

  private async validateDataSubqueries(): Promise<boolean> {
    if (!this.dataQuery) {
      return true;
    }
    const provider = this.config.provider;
    let validQuery = true;
    for (const subquery of this.dataQuery) {
      const type = getUnbuiltSubqueryTypeFromKeys(Object.keys(subquery));
      switch (type) {
        case DataSubqueryType.Header:
          validQuery = validQuery && await validateHeaderSubquery(
            provider,
            subquery as UnbuiltHeaderSubquery
          );
          break;
        case DataSubqueryType.Account:
          validQuery = validQuery && await validateAccountSubquery(
            provider,
            subquery as UnbuiltAccountSubquery
          );
          break;
        case DataSubqueryType.Storage:
          validQuery = validQuery && await validateStorageSubquery(
            provider,
            subquery as UnbuiltStorageSubquery
          );
          break;
        case DataSubqueryType.Transaction:
          validQuery = validQuery && await validateTxSubquery(
            provider,
            subquery as UnbuiltTxSubquery
          );
          break;
        case DataSubqueryType.Receipt:
          validQuery = validQuery && await validateReceiptSubquery(
            provider,
            subquery as UnbuiltReceiptSubquery
          );
          break;
        case DataSubqueryType.SolidityNestedMapping:
          validQuery = validQuery && await validateSolidityNestedMappingSubquery(
            provider,
            subquery as UnbuiltSolidityNestedMappingSubquery
          );
          break;
        case DataSubqueryType.BeaconValidator:
          validQuery = validQuery && await validateBeaconSubquery(
            provider,
            subquery as UnbuiltBeaconValidatorSubquery
          );
          break;
        default:
          throw new Error(`Invalid subquery type: ${type}`);
      }
    }
    return validQuery;
  }

  private async validateComputeQuery(): Promise<boolean> {
    if (this.computeQuery === undefined) {
      return true;
    }
    let valid = true;

    // Check resultLen
    if (
      this.computeQuery.resultLen !== undefined &&
      this.computeQuery.resultLen > AxiomV2CircuitConstant.UserMaxOutputs
    ) {
      console.warn(`Callback resultLen is greater than maxOutputs (${AxiomV2CircuitConstant.UserMaxOutputs})`);
      valid = false;
    }

    // Check that vkey and computeProof are not zero if k is nonzero
    if (this.computeQuery.k !== 0) {
      if (this.computeQuery.vkey.length === 0) {
        console.warn("Compute query vkey is empty");
        valid = false;
      }
      if (this.computeQuery.computeProof.length === 0) {
        console.warn("Compute query computeProof is empty");
        valid = false;
      }
    }

    return valid;
  }

  private async validateCallback(): Promise<boolean> {
    if (this.callback === undefined) {
      return true;
    }
    let valid = true;

    // Check if callback address is a valid contract address
    const bytecode = await this.config.provider.getCode(this.callback.target);
    if (bytecode.length <= 2) {
      console.warn("Callback address is not a valid contract address");
      valid = false;
    }

    // Check if extra data is bytes32-aligned
    let extraData = this.callback.extraData;
    if (extraData.startsWith("0x")) {
      extraData = extraData.slice(2);
    }
    if (extraData.length % 64 !== 0) {
      console.warn("Callback extraData is not bytes32-aligned; EVM will automatically right-append zeros to data that is not a multiple of 32 bytes, which is probably not what you want.");
      valid = false;
    }

    return valid;
  }
}
