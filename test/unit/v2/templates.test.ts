import { 
  Axiom,
  AxiomConfig,
  QueryV2,
  templateArrayIndexValues,
  templateMappingValues,
  templateSlotOverBlockRange,
} from "../../../src";
import {  } from "../../../src/v2/templates/templateMappingValues";
import {  } from "../../../src/v2/templates/templateSlotOverBlockRange";

describe("Templates", () => {
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const MATIC_ADDR = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
  const PUDGY_PENGUINS_ADDR = "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8";

  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY as string,
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
  };
  const axiom = new Axiom(config);

  test("templateMappingValues", async () => {
    const wethHolders = [
      "0xf04a5cc80b1e94c69b48f5ee68a08cd2f09a7c3e",
      "0x2f0b23f53734252bda2277357e97e1517d6b042a",
      "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
      "0xc3d688b66703497daa19211eedff47f25384cdc3",
      "0x08638ef1a205be6762a8b935f5da9b700cf7322c",
      "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
      "0x8eb8a3b98659cce290402893d0123abb75e3ab28",
      "0xba12222222228d8ba445958a75a0704d566bf2c8",
    ];
    const dataQuery = templateMappingValues(15537394, WETH_ADDR, "3", "address", wethHolders);

    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery);

    const processedDq = qb.getDataQuery();
    expect(processedDq?.storageSubqueries!.length).toEqual(10);
  });

  test("templateMappingValues appended to another templateMappingValues", async () => {
    const wethHolders = [
      "0xf04a5cc80b1e94c69b48f5ee68a08cd2f09a7c3e",
      "0x2f0b23f53734252bda2277357e97e1517d6b042a",
      "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
      "0xc3d688b66703497daa19211eedff47f25384cdc3",
      "0x08638ef1a205be6762a8b935f5da9b700cf7322c",
      "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
      "0x8eb8a3b98659cce290402893d0123abb75e3ab28",
      "0xba12222222228d8ba445958a75a0704d566bf2c8",
    ];
    const dataQuery = templateMappingValues(15537394, WETH_ADDR, "3", "address", wethHolders);
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery);

    const maticHolders = [
      "0x5e3ef299fddf15eaa0432e6e66473ace8c13d908",
      "0x401f6c983ea34274ec46f84d70b31c151321188b",
      "0xcd6507d87f605f5e95c12f7c4b1fc3279dc944ab",
      "0xf977814e90da44bfa03b6295a0616a897441acec",
      "0xb316fa9fa91700d7084d377bfdc81eb9f232f5ff",
      "0xcbfe11b78c2e6cb25c6eda2c6ff46cd4755c8fca",
      "0xb72b8c812376b5f8436d6854d41646a88aa88422",
      "0x4c569c1e541a19132ac893748e0ad54c7c989ff4",
      "0x3b7bb88db769923dc2ee1e9e6a83c00a74c407d2",
      "0xa83b11093c858c86321fbc4c20fe82cdbd58e09e",
    ];
    const dataQuery2 = templateMappingValues(16000000, MATIC_ADDR, "3", "address", maticHolders);
    qb.append(dataQuery2);

    const processedDq = qb.getDataQuery();
    expect(processedDq?.storageSubqueries!.length).toEqual(20);
  });

  test("templateSlotOverBlockRange", async () => {
    const dataQuery = templateSlotOverBlockRange(15537394, 15537394 + 500, 32, WETH_ADDR, "2");
    const qb = await (axiom.query as QueryV2).new(dataQuery);
    const processedDq = qb.getDataQuery();
    expect(processedDq?.storageSubqueries!.length).toEqual(16);
  });

  test("templateArrayIndexValues", async () => {
    const dataQuery = templateArrayIndexValues(
      15537394,
      PUDGY_PENGUINS_ADDR,
      "8",  // _allTokens[]
      "1000",
      "2000",
      "30",
      "uint256"
    );
    const qb = await (axiom.query as QueryV2).new(dataQuery);
    const processedDq = qb.getDataQuery();
    expect(processedDq?.storageSubqueries!.length).toEqual(34);
  });
});
