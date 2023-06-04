import { ethers } from "ethers";
import { Axiom } from "..";
import { Constants } from "../shared/constants";
import { getAbiForVersion } from "./lib/abi";
import { Config } from "../shared/config";

export function listen(config: Config, events: string[], callback: (...x: any) => void) {
  for (const event of events) {
    config.contract.on(event, callback);
  }
}
