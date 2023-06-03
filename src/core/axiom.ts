import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { QueryBuilder } from '../query/queryBuilder';
import { listen } from './listener';
import { sendQuery } from './transaction';

export class Axiom {
  /**
   * Axiom configuration parameters 
   */
  readonly config: Config;

  readonly block: Block;
  readonly listen: (events: string[], callback: (data: any) => void) => void;
  readonly sendQuery: (queryResponse: string, refundee: string, query: string, callback: () => void) => void;

  constructor(config: Config) {
    this.config = new Config(config);

    this.block = new Block(this.config);

    this.listen = (events: string[], callback: (data: any) => void) => {
      listen(config, events, callback);
    }

    this.sendQuery = (queryResponse: string, refundee: string, query: string, callback: () => void) => {
      sendQuery(config, queryResponse, refundee, query, callback);
    }
  }

  newQueryBuilder(maxSize: number): QueryBuilder {
    return new QueryBuilder(maxSize, this.config);
  }
}
