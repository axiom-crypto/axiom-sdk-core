import { InternalConfig } from '../shared/internalConfig';
import { AxiomConfig } from '../shared/types';
import { Block } from './block';
import { Query } from './query';
import { QueryBuilder } from '../query/queryBuilder';
import { getAxiomAbiForVersion, getAxiomQueryAbiForVersion } from './lib/abi';
import { Constants } from '../shared/constants';

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
    if (process.env.Env === "prod" && overrides !== undefined) {
      throw new Error("Cannot override config in production");
    }

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

  getAxiomContractAddress(): string | undefined {
    return Constants(this.config.version).Addresses.Axiom;
  }

  getAxiomQueryContractAddress(): string | undefined {
    return Constants(this.config.version).Addresses.AxiomQuery;
  }
}

export { decodePackedQuery } from '../query/decoder';
