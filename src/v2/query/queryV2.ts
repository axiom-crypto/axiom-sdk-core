import {
  AxiomV2Callback,
  AxiomV2ComputeQuery,
} from "@axiom-crypto/tools";
import { InternalConfig } from "../../core/internalConfig";
import { Query } from "../../core/query";
import {
  AxiomV2QueryOptions,
  UnbuiltSubquery,
} from "../types";
import { QueryBuilderV2 } from './queryBuilderV2';
import { getAxiomQueryAbiForVersion } from "../../core/lib/abi";
import { PaymentCalc } from "./paymentCalc";

export class QueryV2 extends Query {
  /**
   * @param config Axiom internal configuration parameters
   */
  constructor(config: InternalConfig) {
    super(config);
  }

  /**
   * Creates a new `QueryBuilderV2`` instance
   * @param dataQuery (optional) An array of data subqueries to be included
   * @param computeQuery (optional) A compute query
   * @param callback (optional) The function on a contract to the called with the Query results
   * @param options (optional) Additional options for the Query
   * @returns
   */
  new(
    dataQuery?: UnbuiltSubquery[],
    computeQuery?: AxiomV2ComputeQuery,
    callback?: AxiomV2Callback,
    options?: AxiomV2QueryOptions,
  ): QueryBuilderV2 {
    return new QueryBuilderV2(this.config, dataQuery, computeQuery, callback, options);
  }

  /**
   *
   */
  async getBalance(): Promise<string> {
    const axiomQueryAddr = this.config.getConstants().Addresses.AxiomQuery;
    const axiomQueryAbi = getAxiomQueryAbiForVersion(this.config.version);
    const userAddress = this.config.signer?.address;
    if (userAddress === undefined) {
      throw new Error("Unable to get current balance: need to have a signer defined (private key must be input into `AxiomCoreConfig`)");
    }
    return await PaymentCalc.getBalance(
      this.config.providerUri,
      userAddress,
      axiomQueryAddr,
      axiomQueryAbi,
    );
  }
}
