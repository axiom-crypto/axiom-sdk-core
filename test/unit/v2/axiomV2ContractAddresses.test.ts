import { Axiom, AxiomConfig } from "../../../src";

// Test coverage areas:
// - AxiomV2 Contract Addresses

describe("AxiomV2 Contract Addresses", () => {
  test("should get AxiomV2 Mainnet contract addresses", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 1,
    };
    const ax = new Axiom(config);
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("");
  });

  test("should get AxiomV2 Mainnet contract addresses", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 1,
      mock: true,
    };
    const ax = new Axiom(config);
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("");
  });

  test("should get AxiomV2Query Goerli contract addresses", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 5,
    };
    const ax = new Axiom(config);
    const axiomV2QueryMock = ax.getAxiomQueryAddress();

    expect(axiomV2QueryMock).toEqual("0xBbd0d3671093A36D6e3b608a7E3B1fdC96Da1116");
  });

  test("should get AxiomV2QueryMock Goerli contract addresses", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 5,
      mock: true,
    };
    const ax = new Axiom(config);
    const axiomV2QueryMock = ax.getAxiomQueryAddress();

    expect(axiomV2QueryMock).toEqual("0x28CeE427fCD58e5EF1cE4C93F877b621E2Db66df");
  });
});
