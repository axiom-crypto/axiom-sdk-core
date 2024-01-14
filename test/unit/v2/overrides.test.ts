import { AxiomSdkCore, AxiomSdkCoreConfig } from "../../../src";
import { Versions } from "../../../src/shared/constants";

describe("Overrides", () => {
  const AX_ADDR_OVERRIDE = "0x8eb3a522cab99ed365e450dad696357de8ab7e9d";
  const AX_QUERY_ADDR_OVERRIDE = "0x82842F7a41f695320CC255B34F18769D68dD8aDF";

  test("should initialize v2 Axiom with overrides", () => {
    const config: AxiomSdkCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      version: "v2",
    };
    const overrides = {
      Addresses: {
        AxiomQuery: AX_QUERY_ADDR_OVERRIDE,
      },
      Urls: {
        ApiBaseUrl: "https://axiom-api-staging.vercel.app/v2",
      },
    };
    const ax0 = new AxiomSdkCore(config);
    const ax1 = new AxiomSdkCore(config, overrides);
    expect(ax0.getAxiomQueryAddress()).not.toEqual(AX_QUERY_ADDR_OVERRIDE);
    expect(ax1.getAxiomQueryAddress()).toEqual(AX_QUERY_ADDR_OVERRIDE);
  });
});
