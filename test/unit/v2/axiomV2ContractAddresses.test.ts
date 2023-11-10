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
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("0x507c2Bf1C9549cC158FFF428dfc7367E6f33E8C8");
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

    expect(axiomV2QueryMock).toEqual("0xbEb34aBec311213bAAAFeed834079437c2a57e40");
  });
});
