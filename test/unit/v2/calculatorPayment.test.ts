import { AxiomSdkCore, AxiomSdkCoreConfig, AxiomV2QueryOptions, QueryV2, buildSolidityNestedMappingSubquery } from "../../../src";
import { calculateCalldataGas } from "../../../src/v2/query/gasCalc";

// Test coverage areas:
// - Payment calculator

describe("Payment Calculator", () => {
  const config: AxiomSdkCoreConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
  };
  const axiom = new AxiomSdkCore(config);

  test("Payment calculation default based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    const fee = await query.calculateFee();
    expect(fee).toEqual("20500000000000000");
  });

  test("Payment calculation high based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    query.setOptions({
      maxFeePerGas: "500000000000",
      callbackGasLimit: 1000000000,
    });
    const fee = await query.calculateFee();
    expect(fee).toEqual("500253000000000000000");
  });

  test("Payment calculation low based on options", async () => {
    const query = (axiom.query as QueryV2).new();
    query.setOptions({
      maxFeePerGas: "3000000000",
      callbackGasLimit: 3000000,
    });
    const fee = await query.calculateFee();
    expect(fee).toEqual("13500000000000000");
  });
});
