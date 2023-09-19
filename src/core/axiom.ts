import { InternalConfig } from './internalConfig';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { QueryV1 } from '../v1/query/queryV1';
import { QueryBuilderV1 } from '../v1/query/queryBuilderV1';
import { getAxiomQueryAbiForVersion } from './lib/abi';
import { Query } from './query';
import { QueryV2 } from '../v2/query/queryV2';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: InternalConfig;

  /**
   * Functions that relate to calculating various aspects of blocks
   */
  readonly block: Block;

  /**
   * Functions that handle querying the Axiom Query database
   */
  readonly query: Query;

  constructor(config: AxiomConfig, overrides?: any) {
    this.config = new InternalConfig(config, overrides);

    switch (this.config.version) {
      case "v0":
      case "v0_2":
      case "v1":
        this.block = new Block(this.config);
        this.query = new QueryV1(this.config);
        break;
      case "v2":
        this.block = new Block(this.config);
        this.query = new QueryV2(this.config);
        break;
      default:
        throw new Error(`Invalid version detected: ${this.config.version}`)
    }
  }

  newQueryBuilder(): QueryBuilderV1 {
    if (
      !(this.config.version === "v0" || 
      this.config.version === "v0_2" || 
      this.config.version === "v1"
    )) {
      throw new Error("QueryBuilder is deprecated after v1");
    }
    return new QueryBuilderV1(this.config);
  }

  getAxiomQueryAbi(): any {
    return getAxiomQueryAbiForVersion(this.config.version);
  }

  getAxiomQueryAddress(): string | undefined {
    return this.config.getConstants().Addresses.AxiomQuery;
  }
}

export { decodePackedQuery } from '../v1/query/decoder';
