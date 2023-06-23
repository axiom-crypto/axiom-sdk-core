import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { Query } from './query';
import { QueryBuilder } from '../query/queryBuilder';
import { getAxiomAbiForVersion, getAxiomQueryAbiForVersion } from './lib/abi';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: Config;

  /**
   * Functions that relate to calculating various aspects of blocks
   */
  readonly block: Block;

  /**
   * Functions that handle querying the Axiom Query database
   */
  readonly query: Query;

  constructor(config: AxiomConfig, overrides?: any) {
    if (process.env.Env === "prod" && overrides !== undefined) {
      throw new Error("Cannot override config in production");
    }

    this.config = new Config(config, overrides);

    this.block = new Block(this.config);
    this.query = new Query(this.config);
  }

  newQueryBuilder(): QueryBuilder {
    return new QueryBuilder(this.config);
  }

  getAxiomAbi(): any {
    return getAxiomAbiForVersion(this.config.version);
  }

  getAxiomQueryAbi(): any {
    return getAxiomQueryAbiForVersion(this.config.version);
  }
}

export { decodePackedQuery } from '../query/decoder';
