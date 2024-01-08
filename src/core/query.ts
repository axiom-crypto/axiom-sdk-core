import { InternalConfig } from "./internalConfig";

export abstract class Query {
  protected readonly config: InternalConfig;

  constructor(config: InternalConfig) {
    this.config = config;
  }

  new(...a: any): any {
    throw new Error(
      "Typecast Query object to the appropriate version to use this method. Example:\n\n" +
      "const axiom = new AxiomCore(config)\n" +
      "const aq = axiom.query as QueryV2;\n" +
      "const query = aq.new();"
    );
  }
}
