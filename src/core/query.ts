import { InternalConfig } from "./internalConfig";

export abstract class Query {
  protected readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  // abstract new(): QueryBuilder;
}
