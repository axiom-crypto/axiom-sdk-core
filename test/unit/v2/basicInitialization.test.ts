import { ethers } from "ethers";
import { Axiom, AxiomConfig, AxiomV2ComputeQuery, DataSubquery, QueryV2 } from "../../../src";
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

  // test("should initialize QueryBuilderV2 with dataQuery", async () => {
  //   const config: AxiomConfig = {
  //     providerUri: process.env.PROVIDER_URI as string,
  //     version: "v2",
  //   };
  //   const axiom = new Axiom(config);
  //   const query = (axiom.query as QueryV2).new();
  //   const dataQuery = [] as DataSubquery[];
  //   query.append(dataQuery);
  //   expect(typeof query).toEqual("object");
  // });

  // test("should initialize QueryBuilderV2 with computeQuery", async () => {
  //   const dataQuery = [] as DataSubquery[];
  //   const computeQuery: AxiomV2ComputeQuery = {
  //     k: 14,
  //     vkey,
  //     computeProof,
  //   };
  //   const config: AxiomConfig = {
  //     providerUri: process.env.PROVIDER_URI as string,
  //     version: "v2",
  //   };
  //   const axiom = new Axiom(config);
  //   const query = (axiom.query as QueryV2).new(dataQuery, computeQuery);
  //   expect(typeof query).toEqual("object");
  // });

  // test("should initialize QueryBuilderV2 with callback", async () => {
  //   const dataQuery = [] as DataSubquery[];
  //   const computeQuery: AxiomV2ComputeQuery = {
  //     k: 14,
  //     vkey,
  //     computeProof,
  //   };
  //   const callbackQuery = {
  //     target: WETH_ADDR,
  //     extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
  //   };
  //   const query = (axiom.query as QueryV2).new(dataQuery, computeQuery, callbackQuery);
  //   expect(typeof query).toEqual("object");
  // });

  // test("should initialize QueryBuilderV2 with options", async () => {
  //   const dataQuery = [] as DataSubquery[];
  //   const computeQuery: AxiomV2ComputeQuery = {
  //     k: 14,
  //     vkey,
  //     computeProof,
  //   };
  //   const callbackQuery = {
  //     target: WETH_ADDR,
  //     extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
  //   };
  //   const options = {};
  //   const query = (axiom.query as QueryV2).new(dataQuery, computeQuery, callbackQuery, options);
  //   expect(typeof query).toEqual("object");
  // });
});
