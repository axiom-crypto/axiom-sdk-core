import { describe, it } from "node:test";
import { Axiom } from "../../src/core/axiom";
import { AxiomConfig } from "../../src/shared/types";

describe('QueryBuilder', () => {
  if (process.env.PROVIDER_URL === undefined) {
    throw new Error("PROVIDER_URL environment variable is not set");
  }

  describe('Generating a queryResponse', () => {
    it('should return a queryResponse', async () => {
      const config: AxiomConfig = {
        apiKey: "demo",
        providerUri: process.env.PROVIDER_URL as string,
        version: "0.2",
      }
      const ax = new Axiom(config);
      const qb = ax.newQueryBuilder(16);
      qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
      qb.append({blockNumber: 17090220, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 2});
      qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 0});
      qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      qb.append({blockNumber: 17090300, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: null});
      
      const {queryResponse, queryData} = await qb.build();
      console.log("queryResponse:", queryResponse);
      console.log("queryData:", queryData);
    });
  });
});