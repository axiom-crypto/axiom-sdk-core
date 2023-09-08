import { Axiom, AxiomConfig } from "../../../src";
import { Versions } from "../../../src/shared/constants";

describe('Axiom Core tests', () => {
  const AX_ADDR_OVERRIDE = "0x8eb3a522cab99ed365e450dad696357de8ab7e9d";
  const AX_QUERY_ADDR_OVERRIDE = "0x82842F7a41f695320CC255B34F18769D68dD8aDF";

  test('should initialize without an API key', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    }
    const ax = new Axiom(config);
    expect(typeof ax).toEqual("object");
  });

  test('should initialize AxiomV2', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    }
    const ax = new Axiom(config);

    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
  });

  test('should initialize v2 Axiom with overrides', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    }
    const overrides = {
      Addresses: {
        Axiom: AX_ADDR_OVERRIDE,
        AxiomQuery: AX_QUERY_ADDR_OVERRIDE,
      },
      Urls: {
        ApiBaseUrl: "https://axiom-api-staging.vercel.app/v2",
      },
    }
    const ax0 = new Axiom(config);
    const ax1 = new Axiom(config, overrides);
    expect(ax0.getAxiomAddress()).not.toEqual(AX_ADDR_OVERRIDE);
    expect(ax0.getAxiomQueryAddress()).not.toEqual(AX_QUERY_ADDR_OVERRIDE);
    expect(ax1.getAxiomAddress()).toEqual(AX_ADDR_OVERRIDE);
    expect(ax1.getAxiomQueryAddress()).toEqual(AX_QUERY_ADDR_OVERRIDE);
  });

  test('should fail on invalid version number', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.3",
    }
    expect(() => new Axiom(config)).toThrowError("Invalid version number. Valid versions are: " + Versions.join(", "));
  });

  test('should get v2 abi', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    }
    const ax = new Axiom(config);
    const abi = ax.getAxiomAbi();

    expect(abi[0].type).toEqual("constructor");
  })

  test('should get AxiomV2 Mainnet contract addresses', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 1,
    }
    const ax = new Axiom(config);
    const axiomV2 = ax.getAxiomAddress();
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2).toEqual("");
    expect(axiomV2Query).toEqual("");
  });

  test('should get AxiomV2QueryMock Goerli contract addresses', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 5,
      mock: true,
    }
    const ax = new Axiom(config);
    const axiomV2Mock = ax.getAxiomAddress();
    const axiomV2QueryMock = ax.getAxiomQueryAddress();
    
    expect(axiomV2Mock).toEqual("");
    expect(axiomV2QueryMock).toEqual("0x18d8a359c23bebc4b5a0d116f792172a114a1fb7");
  });
});