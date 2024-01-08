import { ethers } from "ethers";
import { AxiomCore, AxiomCoreConfig, AxiomV2ComputeQuery, DataSubquery, QueryV2 } from "../../../src";
import { Versions } from "../../../src/shared/constants";

// Test coverage areas:
// - Basic initialization
// - DataQuery
// - ComputeQuery
// - Callback

describe("Basic Initialization", () => {
  const BLOCK_NUMBER = 15537394;
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";

  test("should initialize without an API key", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);
    expect(typeof ax).toEqual("object");
  });

  test("should initialize AxiomV2", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);

    expect(typeof ax).toEqual("object");
    expect(typeof ax.block).toEqual("object");
    expect(typeof ax.query).toEqual("object");
  });

  test("should fail on invalid version number", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v0.3",
    };
    expect(() => new AxiomCore(config)).toThrowError("Invalid version number. Valid versions are: " + Versions.join(", "));
  });

  test("should get v2 abi", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);
    const abi = ax.getAxiomQueryAbi();

    expect(abi[0].type).toEqual("constructor");
  });

  test("should set targetChainId to the same as (source) chainId", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);
    expect(ax.config.chainId).toEqual(ax.config.targetChainId);
  });

  test("should set targetProviderUri to the same as (source) providerUri", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);
    expect(ax.config.providerUri).toEqual(ax.config.targetProviderUri);
  });

  test("should fail if targetChainId is set while targetProviderUri is not set", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      targetChainId: 5,
      version: "v2",
    };
    expect(() => new AxiomCore(config)).toThrow();
  });

  test("should fail if targetProviderUri is set while targetChainId is not set", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      targetProviderUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    expect(() => new AxiomCore(config)).toThrow();
  });

  test("should set targetChainId and targetProviderUri", () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      targetChainId: 5,
      targetProviderUri: process.env.PROVIDER_URI_GOERLI as string,
      version: "v2",
    };
    const ax = new AxiomCore(config);
    expect(ax.config.chainId).toEqual(1n);
    expect(ax.config.targetChainId).toEqual(5n);
    expect(ax.config.providerUri).toEqual(process.env.PROVIDER_URI as string);
    expect(ax.config.targetProviderUri).toEqual(process.env.PROVIDER_URI_GOERLI as string);
  });
});
