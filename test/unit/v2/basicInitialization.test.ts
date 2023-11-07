import { Axiom, AxiomConfig } from "../../../src";
import { Versions } from "../../../src/shared/constants";

describe("Basic Initialization", () => {
  test("should initialize without an API key", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new Axiom(config);
    expect(typeof ax).toEqual("object");
  });

  test("should initialize AxiomV2", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new Axiom(config);

    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
  });

  test("should fail on invalid version number", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.3",
    };
    expect(() => new Axiom(config)).toThrowError("Invalid version number. Valid versions are: " + Versions.join(", "));
  });

  test("should get v2 abi", () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new Axiom(config);
    const abi = ax.getAxiomQueryAbi();

    expect(abi[0].type).toEqual("constructor");
  });

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
