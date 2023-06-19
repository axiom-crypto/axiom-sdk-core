import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { Query } from './query';
import { QueryBuilder } from '../query/queryBuilder';
import { updateConstants } from '../shared/constants';

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

  /**
   * Exported functions
   */
  readonly updateConstants: (updateObject: any) => void;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);
    this.query = new Query(this.config);

    this.updateConstants = updateConstants;
  }

  newQueryBuilder(): QueryBuilder {
    return new QueryBuilder(this.config);
  }
}

export { decodePackedQuery } from '../query/decoder';
