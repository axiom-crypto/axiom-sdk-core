import { InternalConfig } from "../core/internalConfig";
import { TxReceiptsQueryBuilder } from "./txReceiptsQueryBuilder";
import { OnlyReceiptsQueryBuilder } from "./onlyReceiptsQueryBuilder";

export class Experimental {
  private readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  newTxReceiptsQueryBuilder(): TxReceiptsQueryBuilder {
    return new TxReceiptsQueryBuilder(this.config);
  }

  newOnlyReceiptsQueryBuilder(): OnlyReceiptsQueryBuilder {
    return new OnlyReceiptsQueryBuilder(this.config);
  }
}
