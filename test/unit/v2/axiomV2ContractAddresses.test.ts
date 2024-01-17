import { AxiomSdkCore, AxiomSdkCoreConfig } from "../../../src";

// Test coverage areas:
// - AxiomV2 Contract Addresses

describe("AxiomV2 Contract Addresses", () => {
  test("should get AxiomV2 Mainnet contract addresses", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 1,
      mock: true,
    };
    const ax = new AxiomSdkCore(config);
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("0x83c8c0B395850bA55c830451Cfaca4F2A667a983");
  });

  test("should get AxiomV2Query Goerli contract addresses", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 5,
    };
    const ax = new AxiomSdkCore(config);
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("0xBd5307B0Bf573E3F2864Af960167b24Aa346952b");
  });

  test("should get AxiomV2QueryMock Goerli contract addresses", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: 5,
      mock: true,
    };
    const ax = new AxiomSdkCore(config);
    const axiomV2QueryMock = ax.getAxiomQueryAddress();

    expect(axiomV2QueryMock).toEqual("0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f");
  });

  test("should get AxiomV2Query Sepolia contract addresses", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: "11155111",
    };
    const ax = new AxiomSdkCore(config);
    const axiomV2Query = ax.getAxiomQueryAddress();

    expect(axiomV2Query).toEqual("0xb3034090C3A2BE1194e271C7850E1137D1Ad007f");
  });

  test("should get AxiomV2QueryMock Sepolia contract addresses", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
      chainId: "11155111",
      mock: true,
    };
    const ax = new AxiomSdkCore(config);
    const axiomV2QueryMock = ax.getAxiomQueryAddress();

    expect(axiomV2QueryMock).toEqual("0x83c8c0B395850bA55c830451Cfaca4F2A667a983");
  });
});
