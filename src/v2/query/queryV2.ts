import { 
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  DataSubquery
} from "@axiom-crypto/codec";
import { InternalConfig } from "../../core/internalConfig";
import { Query } from "../../core/query";
import {
  QueryBuilderV2Options,
} from "../types";
import { QueryBuilderV2 } from './queryBuilderV2';

export class QueryV2 extends Query {
  /**
   * @param config Axiom internal configuration parameters
   */
  constructor(config: InternalConfig) {
    super(config);
  }

  /**
   * 
   * @param query A `QueryRequestV2` object to generate a new QueryBuilderV2 instance from
   * @returns 
   */
  new(
    dataQuery?: DataSubquery[],
    computeQuery?: AxiomV2ComputeQuery,
    callback?: AxiomV2Callback,
    options?: QueryBuilderV2Options
  ): QueryBuilderV2 {
    return new QueryBuilderV2(this.config, dataQuery, computeQuery, callback, options);
  }
}