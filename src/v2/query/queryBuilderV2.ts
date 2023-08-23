import { 
  AccountSubquery,
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
  encodeComputeQuery
} from '@axiom-crypto/codec';
import { InternalConfig } from "../../core/internalConfig";
import { BuiltQueryV2, DataQueryRequestV2, QueryBuilderV2Options, CallbackRequestV2 } from "../types";
import { ethers } from 'ethers';
import { getAxiomQueryAbiForVersion } from '../../core/lib/abi';
import { ConstantsV2 } from '../constants';

export class QueryBuilderV2 {
  protected readonly config: InternalConfig;
  private dataQuery?: DataQueryRequestV2;
  private computeQuery?: AxiomV2ComputeQuery;
  private callback?: CallbackRequestV2;
  private builtQuery?: BuiltQueryV2;

  constructor(
    config: InternalConfig,
    dataQuery?: DataQueryRequestV2,
    computeQuery?: AxiomV2ComputeQuery,
    callback?: CallbackRequestV2,
    options?: QueryBuilderV2Options
  ) {
    this.config = config;
    if (options) {
      // WIP: Handle options
    }
    
    if (dataQuery !== undefined) {
      this.dataQuery = dataQuery;
      this.handleDataQueryRequest(dataQuery);
    }

    if (computeQuery !== undefined) {
      this.handleComputeQueryRequest(computeQuery);
    }

    if (callback !== undefined) {
      this.handleCallback(callback);
    }
  }

  setDataQuery(dataQuery: DataQueryRequestV2) {
    this.dataQuery = dataQuery;
  }

  setComputeQuery(computeQuery: AxiomV2ComputeQuery) {
    this.computeQuery = computeQuery;
  }

  setCallback(callback: CallbackRequestV2) {
    this.callback = callback;
  }

  appendDataSubquery(type: DataSubqueryType, dataSubquery: SubqueryResponse) {
    if (this.dataQuery === undefined) {
      this.dataQuery = {} as DataQueryRequestV2;
    }
    switch(type) {
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
        this.dataQuery?.accountSubqueries?.push(dataSubquery as AccountSubquery);
        break;
      case DataSubqueryType.Storage:
        if (this.dataQuery.storageSubqueries === undefined) {
          this.dataQuery.storageSubqueries = [] as StorageSubquery[];
        }
        this.dataQuery?.storageSubqueries?.push(dataSubquery as StorageSubquery);
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
        this.dataQuery?.receiptSubqueries?.push(dataSubquery as ReceiptSubquery);
        break;
      case DataSubqueryType.SolidityNestedMapping:
        if (this.dataQuery.solidityNestedMappingSubqueries === undefined) {
          this.dataQuery.solidityNestedMappingSubqueries = [] as SolidityNestedMappingSubquery[];
        }
        this.dataQuery?.solidityNestedMappingSubqueries?.push(dataSubquery as SolidityNestedMappingSubquery);
        break;
      case DataSubqueryType.BeaconValidator:
        if (this.dataQuery.beaconSubqueries === undefined) {
          this.dataQuery.beaconSubqueries = [] as BeaconValidatorSubquery[];
        }
        this.dataQuery?.beaconSubqueries?.push(dataSubquery as BeaconValidatorSubquery);
        break;
      default:
        throw new Error(`Invalid data subquery type: ${type}`);
    }
  }

  async submitOnchainQuery(refundee: string, paymentAmountEth: string, cb?: (receipt: ethers.TransactionReceipt) => void) {
    if (this.config.privateKey === undefined) {
      throw new Error("Private key required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before submitting.");
    }
    const wallet = new ethers.Wallet(this.config.privateKey, this.config.provider);
    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery, 
      getAxiomQueryAbiForVersion(this.config.version), 
      wallet
    );
    const tx = await axiomV2Query.submitQuery(
      this.builtQuery.dataQueryHash,
      this.builtQuery.computeQuery,
      this.builtQuery.callback.callbackAddr,
      this.builtQuery.callback.callbackFunctionSelector,
      this.builtQuery.callback.callbackExtraData,
      refundee,
      this.builtQuery?.dataQuery ?? ethers.ZeroHash,
      { value: paymentAmountEth }
    );
    const receipt = tx.wait();
    if (cb !== undefined) {
      cb(receipt);
    }
  }

  async submitOffchainQuery(refundee: string, paymentAmountEth: string, cb?: (receipt: ethers.TransactionReceipt) => void) {
    if (this.config.privateKey === undefined) {
      throw new Error("Private key required for sending transactions.");
    }
    if (this.builtQuery === undefined) {
      throw new Error("Query must be built with `.build()` before submitting.");
    }
    // WIP: Get IPFS hash for encoded QueryV2
    const ipfsHash = ethers.ZeroHash;

    const wallet = new ethers.Wallet(this.config.privateKey, this.config.provider);
    const axiomV2Query = new ethers.Contract(
      this.config.getConstants().Addresses.AxiomQuery, 
      getAxiomQueryAbiForVersion(this.config.version), 
      wallet
    );
    const tx = await axiomV2Query.submitOffchainQuery(
      this.builtQuery?.dataQueryHash,
      this.computeQuery ?? ConstantsV2.EmptyComputeQuery,
      this.callback?.callbackAddr ?? ethers.ZeroAddress,
      this.callback?.callbackFunctionSelector ?? ConstantsV2.EmptyBytes4,
      this.callback?.callbackExtraData ?? ethers.ZeroHash,
      refundee,
      ipfsHash,
      { value: paymentAmountEth }
    );
    const receipt = tx.wait();
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
    // Encode data
    let encodedSubqueries = this.encodeDataSubqueries();
    console.log(encodedSubqueries);
    if (encodedSubqueries.length === 0) {
      encodedSubqueries = ethers.ZeroHash;
    }
    const dataQuery = ethers.solidityPacked(
      ["uint32", "bytes"],
      [this.config.chainId, encodedSubqueries]
    );
    const dataQueryHash = ethers.keccak256(dataQuery);
    let encodedComputeQuery: string = ConstantsV2.EmptyComputeQuery;
    if (this.computeQuery !== undefined) {
      encodedComputeQuery = encodeComputeQuery(
        this.computeQuery.k,
        this.computeQuery.omega,
        this.computeQuery.vkey,
        this.computeQuery.resultLen,
        this.computeQuery.computeProof
      );
    }
    const callback = {
      callbackAddr: this.callback?.callbackAddr ?? ethers.ZeroAddress,
      callbackFunctionSelector: this.callback?.callbackFunctionSelector ?? ConstantsV2.EmptyBytes4,
      callbackExtraData: this.callback?.callbackExtraData ?? ethers.ZeroHash,
    }
    // const encodedQuery = encodeQueryV2(
    //   this.config.chainId,
    //   dataQueryHash,
    //   encodedComputeQuery,
    //   callback.callbackAddr,
    //   callback.callbackFunctionSelector,
    //   callback.callbackExtraData,
    // );

    this.builtQuery = {
      dataQueryHash,
      dataQuery,
      computeQuery: encodedComputeQuery,
      callback,
    };

    return this.builtQuery;
  }

  private encodeDataSubqueries() {
    let encodedSubqueries = "0x";
    for (const sq of this.dataQuery?.headerSubqueries ?? []) {
      const encoded = encodeHeaderSubquery(sq.blockNumber, sq.fieldIdx);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.accountSubqueries ?? []) {
      const encoded = encodeAccountSubquery(sq.blockNumber, sq.addr, sq.fieldIdx);
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
      const encoded = encodeReceiptSubquery(sq.txHash, sq.fieldOrLogIdx, sq.topicOrDataIdx, sq.eventSchema);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.solidityNestedMappingSubqueries ?? []) {
      const encoded = encodeSolidityNestedMappingSubquery(sq.blockNumber, sq.addr, sq.mappingSlot, sq.mappingDepth, sq.keys);
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    for (const sq of this.dataQuery?.beaconSubqueries ?? []) {
      const encoded = encodeBeaconValidatorSubquery();
      encodedSubqueries = ethers.concat([encodedSubqueries, encoded]);
    }
    return encodedSubqueries;
  }

  private handleDataQueryRequest(dataQuery: DataQueryRequestV2) {
    // Handle all of the queryReuquest subquery types
    if (dataQuery.headerSubqueries) {
      this.handleHeaderSubqueries(dataQuery.headerSubqueries);
    }
    if (dataQuery.accountSubqueries) {
      this.handleAccountSubqueries(dataQuery.accountSubqueries);
    }
    if (dataQuery.storageSubqueries) {
      this.handleStorageSubqueries(dataQuery.storageSubqueries);
    }
    if (dataQuery.txSubqueries) {
      this.handleTxSubqueries(dataQuery.txSubqueries);
    }
    if (dataQuery.receiptSubqueries) {
      this.handleReceiptSubqueries(dataQuery.receiptSubqueries);
    }
    if (dataQuery.solidityNestedMappingSubqueries) {
      this.handleSolidityNestedMappingSubqueries(dataQuery.solidityNestedMappingSubqueries);
    }
    if (dataQuery.beaconSubqueries) {
      this.handleBeaconSubqueries(dataQuery.beaconSubqueries);
    }
  }

  private handleHeaderSubqueries(headerSubqueries: HeaderSubquery[]) {
    
  }

  private handleAccountSubqueries(accountSubqueries: AccountSubquery[]) {

  }

  private handleStorageSubqueries(storageSubqueries: StorageSubquery[]) {

  }

  private handleTxSubqueries(txSubqueries: TxSubquery[]) {

  }

  private handleReceiptSubqueries(receiptSubqueries: ReceiptSubquery[]) {

  }

  private handleSolidityNestedMappingSubqueries(solidityNestedMappingSubqueries: SolidityNestedMappingSubquery[]) {

  }

  private handleBeaconSubqueries(beaconSubqueries: BeaconValidatorSubquery[]) {

  }

  private handleComputeQueryRequest(computeQuery: AxiomV2ComputeQuery) {
    this.computeQuery = computeQuery;
  }

  private handleCallback(callback: CallbackRequestV2) {
    this.callback = callback;
  }
}