import { ethers } from "ethers";
import { Axiom } from "..";
import { Constants } from "../shared/constants";
import { getAbiForVersion } from "./lib/abi";
import { Config } from "../shared/config";

// export class Listener {
//   private readonly providerUri: string;
  
//   constructor(readonly config: AxiomConfig) {
//     this.providerUri = config.providerUri;
//   }

//   async listen()
// }

/**
 * ax.listen(["e1", "e2"], callback)
 * ax.sendQuery(queryResponse, refundAddr, packedQueryBlob);
 */

export function listen(config: Config, events: string[], callback: (...x: any) => void) {
  for (const event of events) {
    config.contract.on(event, callback);
  }
}
