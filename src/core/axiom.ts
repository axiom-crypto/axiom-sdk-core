import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { QueryBuilder } from '../query/queryBuilder';
import { decodePackedQuery } from '../query/decoder';
import { updateConstants } from '../shared/constants';

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
  readonly updateConstants: (updateObject: any) => void;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);

    this.decodePackedQuery = decodePackedQuery;
    this.updateConstants = updateConstants;
  }

  newQueryBuilder(): QueryBuilder {
    return new QueryBuilder(this.config);
  }
}
