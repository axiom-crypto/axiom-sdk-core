import { InternalConfig } from "../core/internalConfig";
import { TxReceiptsQueryBuilder } from "./txReceiptsQueryBuilder";
import { decodeTxReceiptsPackedQuery } from "./decoder";

export class Experimental {
  private readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  newTxReceiptsQueryBuilder(): TxReceiptsQueryBuilder {
    return new TxReceiptsQueryBuilder(this.config);
  }

  decodeTxReceiptsPackedQuery(packed: string): any {
    return decodeTxReceiptsPackedQuery(packed);
  }
}