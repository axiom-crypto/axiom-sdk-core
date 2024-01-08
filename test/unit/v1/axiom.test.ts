import { AxiomCore, AxiomCoreConfig } from "../../../src";
import { Versions } from "../../../src/shared/constants";

describe('Axiom Core tests', () => {
  const AX_ADDR_OVERRIDE = "0x8eb3a522cab99ed365e450dad696357de8ab7e9d";
  const AX_QUERY_ADDR_OVERRIDE = "0x82842F7a41f695320CC255B34F18769D68dD8aDF";

  test('should initialize without an API key', () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const ax = new AxiomCore(config);
    expect(typeof ax).toEqual("object");
  });

  test('should initialize Axiom', () => {
    const config: AxiomCoreConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.2",
    }
    const ax = new AxiomCore(config);

    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
    expect(typeof ax.newQueryBuilder).toEqual("function");
  });

  test('should initialize v1 Axiom with overrides', () => {
    const config: AxiomCoreConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const overrides = {
      Addresses: {
        AxiomQuery: AX_QUERY_ADDR_OVERRIDE,
      },
      Urls: {
        ApiBaseUrl: "https://axiom-api-staging.vercel.app/v1",
      },
    }
    const ax0 = new AxiomCore(config);
    const ax1 = new AxiomCore(config, overrides);
    expect(ax0.getAxiomQueryAddress()).not.toEqual(AX_QUERY_ADDR_OVERRIDE);
    expect(ax1.getAxiomQueryAddress()).toEqual(AX_QUERY_ADDR_OVERRIDE);
  });

  test('should fail on invalid version number', () => {
    const config: AxiomCoreConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.3",
    }
    expect(() => new AxiomCore(config)).toThrowError("Invalid version number. Valid versions are: " + Versions.join(", "));
  });

  test('should get a v1 abi', () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const ax = new AxiomCore(config);
    const abi = ax.getAxiomQueryAbi();

    expect(abi[0].type).toEqual("constructor");
  })

  test('should get AxiomV1 Mainnet contract addresses', () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
      chainId: 1,
    }
    const ax = new AxiomCore(config);
    const axiomV1Query = ax.getAxiomQueryAddress();

    expect(axiomV1Query).toEqual("0xd617ab7f787adf64c2b5b920c251ea10cd35a952");
  });

  test('should get AxiomV1QueryMock Goerli contract addresses', () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
      chainId: 5,
      mock: true,
    }
    const ax = new AxiomCore(config);
    const axiomV1QueryMock = ax.getAxiomQueryAddress();
    
    expect(axiomV1QueryMock).toEqual("0x4Fb202140c5319106F15706b1A69E441c9536306");
  });
});