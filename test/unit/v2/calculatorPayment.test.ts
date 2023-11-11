import { Axiom, AxiomConfig, AxiomV2QueryOptions, QueryV2, buildSolidityNestedMappingSubquery } from "../../../src";
import { calculateCalldataGas } from "../../../src/v2/query/gasCalc";

// Test coverage areas:
// - Payment calculator

describe("Payment Calculator", () => {
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
  };
  const axiom = new Axiom(config);

  test("Payment calculation default based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    const fee = await query.calculateFee();
    expect(fee).toEqual("18000000000000000");
  });

  test("Payment calculation high based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    query.setOptions({
      maxFeePerGas: "500000000000",
      callbackGasLimit: 1000000000,
    });
    const fee = await query.calculateFee();
    expect(fee).toEqual("500203000000000000000");
  });

  test("Payment calculation low based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    query.setOptions({
      maxFeePerGas: "500000000000",
      callbackGasLimit: 1000000000,
    });
    const fee = await query.calculateFee();
    expect(fee).toEqual("500203000000000000000");
  });
});
