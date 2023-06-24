import { Axiom, AxiomConfig } from "../../src";

describe('Axiom Core tests', () => {
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

  test('should initialize Axiom with overrides', () => {
    const config: AxiomConfig = {
      apiKey: "demo",
      providerUri: process.env.PROVIDER_URI as string,
      version: "v1",
    }
    const overrides = {
      v1: {
        Addresses: {
          Axiom: "0x8eb3a522cab99ed365e450dad696357de8ab7e9d",
          AxiomQuery:"0x82842F7a41f695320CC255B34F18769D68dD8aDF",
        },
        Urls: {
          ApiBaseUrl: "https://axiom-api-staging.vercel.app/v1",
        },
      },
    }
    const ax = new Axiom(config, overrides);
    
    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
    expect(typeof ax.newQueryBuilder).toEqual("function");
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
    const addr = ax.getAxiomContractAddress();

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
    const addr = ax.getAxiomQueryContractAddress();
    
    expect(addr).toEqual("0x06E05bbce03eFD739779533D93e4f5ea7c673137");
  });
});