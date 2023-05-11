import { Constants } from "../shared/constants";
import { AxiomConfig } from "../shared/types";

export class Prover {
  private readonly version: string; 

  constructor(readonly config: AxiomConfig) {
    this.version = config.version as string;
  }
}