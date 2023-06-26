import { InternalConfig } from './internalConfig';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { Query } from './query';
import { QueryBuilder } from '../query/queryBuilder';
import { getAxiomAbiForVersion, getAxiomQueryAbiForVersion } from './lib/abi';

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

  getAxiomAddress(): string | undefined {
    return this.config.getConstants().Addresses.Axiom;
  }

  getAxiomQueryAddress(): string | undefined {
    return this.config.getConstants().Addresses.AxiomQuery;
  }
}

export { decodePackedQuery } from '../query/decoder';
