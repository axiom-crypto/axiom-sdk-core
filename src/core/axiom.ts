import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { QueryBuilder } from '../query/queryBuilder';
import { decodePackedQuery } from '../query/decoder';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: Config;

  readonly block: Block;

  /**
   * Exported functions
   */
  readonly decodePackedQuery: (packedQuery: string) => string;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);

    this.decodePackedQuery = decodePackedQuery;
  }

  newQueryBuilder(): QueryBuilder {
    return new QueryBuilder(this.config);
  }
}
