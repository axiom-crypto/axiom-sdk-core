import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { Prover } from './prover';
import { QueryBuilder } from '../query/queryBuilder';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: Config;

  readonly block: Block;
  readonly prover: Prover;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);
    this.prover = new Prover(this.config);
  }

  newQueryBuilder(maxSize: number): QueryBuilder {
    return new QueryBuilder(maxSize, this.config);
  }
}
