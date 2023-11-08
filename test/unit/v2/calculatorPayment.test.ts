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

  test("Payment calculation based on options", () => {
    const query = (axiom.query as QueryV2).new();
    let fee = query.calculateFee();
    expect(fee).toEqual("18000000000000000");

    const options: AxiomV2QueryOptions = {
      maxFeePerGas: "10000000000",
    };
    query.setOptions(options);
    fee = query.calculateFee();
    expect(fee).toEqual("9000000000000000");

    query.setOptions({
      maxFeePerGas: "500000000000",
      callbackGasLimit: 1000000000,
    });
    fee = query.calculateFee();
    expect(fee).toEqual("500203000000000000000");
  });
});
