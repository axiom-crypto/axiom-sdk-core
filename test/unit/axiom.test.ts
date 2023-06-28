import { Axiom, AxiomConfig } from "../../src";
import { Versions } from "../../src/shared/constants";

describe('Axiom Core tests', () => {
  const AX_ADDR_OVERRIDE = "0x8eb3a522cab99ed365e450dad696357de8ab7e9d";
  const AX_QUERY_ADDR_OVERRIDE = "0x82842F7a41f695320CC255B34F18769D68dD8aDF";

  test('should initialize without an API key', () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const ax = new Axiom(config);
    expect(typeof ax).toEqual("object");
  });

  test('should initialize Axiom', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.2",
    }
    const ax = new Axiom(config);

    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
    expect(typeof ax.newQueryBuilder).toEqual("function");
  });

  test('should initialize v0.2 Axiom with overrides', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.2",
    }
    const overrides = {
      Addresses: {
        Axiom: AX_ADDR_OVERRIDE,
      },
    }
    const ax = new Axiom(config, overrides);
    
    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
    expect(typeof ax.newQueryBuilder).toEqual("function");
    expect(ax.getAxiomAddress()).toEqual(AX_ADDR_OVERRIDE);
  });

  test('should initialize v1 Axiom with overrides', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const overrides = {
      Addresses: {
        Axiom: AX_ADDR_OVERRIDE,
        AxiomQuery: AX_QUERY_ADDR_OVERRIDE,
      },
      Urls: {
        ApiBaseUrl: "https://axiom-api-staging.vercel.app/v1",
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
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.3",
    }
    expect(() => new Axiom(config)).toThrowError("Invalid version number. Valid versions are: " + Versions.join(", "));
  });

  test('should get abi', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.2",
    }
    const ax = new Axiom(config);
    const abi = ax.getAxiomAbi();

    expect(abi[0].type).toEqual("constructor");
  })

  test('should get Axiom contract address', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
      chainId: 5,
    }
    const ax = new Axiom(config);
    const addr = ax.getAxiomAddress();

    expect(addr).toEqual("0x8eb3a522cab99ed365e450dad696357de8ab7e9d");
  });

  test('should get AxiomQuery Mock contract address', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
      chainId: 5,
      mock: true,
    }
    const ax = new Axiom(config);
    const addr = ax.getAxiomQueryAddress();
    
    expect(addr).toEqual("0x06E05bbce03eFD739779533D93e4f5ea7c673137");
  });
});