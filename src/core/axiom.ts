import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: Config;

  readonly block: Block;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);
  }
}

