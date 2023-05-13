import { Constants } from "../shared/constants";
import { AxiomConfig } from "../shared/types";

export class Prover {
  private readonly version: string; 

  constructor(readonly config: AxiomConfig) {
    this.version = config.version as string;

    // WIP: This section will include items that will be used for API calls 
    // that will eventually get routed to the prover.
  }
}