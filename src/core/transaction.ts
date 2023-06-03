import { ethers } from "ethers";
import { Config } from "../shared/config";
import { ContractEvents } from "../shared/constants";

let sentQueryResponses: any[] = [];

function queryFulfilledHandler(
  queryResponse: string,
  payment: number, 
  prover: string,
  event: any,
) {
  const findIdx = sentQueryResponses.findIndex((obj) => obj.queryResponse === queryResponse);
  if (findIdx !== -1) {
    const cb = sentQueryResponses[findIdx].callback;
    sentQueryResponses.splice(findIdx, 1);
    
    // Call callback
    cb();
  }
}

export async function sendQuery(
  config: Config,
  queryResponse: string,
  refundee: string,
  query: string,
  callback: () => void
) {
  if (config.version === "v0" || config.version === "v0_2") {
    throw new Error("sendQuery not supported in v0 or v0.2");
  }
  if (config.signer === null) {
    throw new Error("privateKey must be set in AxiomConfig to run this function");
  }

  // Send the query
  const txResult = await config.contract.sendQuery(queryResponse, refundee, query);
  const txReceipt = await txResult.wait();

  // If tx doesn't revert, push the queryResponse to the listener queue
  if (txReceipt.status === 1) {
    sentQueryResponses.push({ queryResponse, callback } );
  }

  // Start listening for prover to emit TX complete
  config.contract.on(ContractEvents.QueryFulfilled, queryFulfilledHandler);
}