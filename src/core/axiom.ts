import { Config } from '../shared/config';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { QueryBuilder } from '../query/queryBuilder';
import { listen } from './listener';
import { sendQuery } from './transaction';
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
  readonly listen: (events: string[], callback: (data: any) => void) => void;
  readonly sendQuery: (queryResponse: string, refundee: string, query: string, callback: () => void) => void;
  readonly decodePackedQuery: (packedQuery: string) => string;

  constructor(config: AxiomConfig) {
    this.config = new Config(config);

    this.block = new Block(this.config);

    this.listen = (events: string[], callback: (data: any) => void) => {
      listen(this.config, events, callback);
    }

    this.sendQuery = (queryResponse: string, refundee: string, query: string, callback: () => void) => {
      sendQuery(this.config, queryResponse, refundee, query, callback);
    }

    this.decodePackedQuery = decodePackedQuery;
  }

  newQueryBuilder(maxSize: number): QueryBuilder {
    return new QueryBuilder(maxSize, this.config);
  }
}
