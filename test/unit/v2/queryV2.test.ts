import { AxiomV2ComputeQuery } from "@axiom-crypto/codec";
import { Axiom, AxiomConfig } from "../../../src";
import { QueryV2 } from "../../../src/v2/query/queryV2";
import { ethers } from "ethers";
import { getFunctionSelector } from "../../../src/shared/utils";

describe("QueryV2", () => {
  const BLOCK_NUMBER = 15537394;
  const WETH_ADDR = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";

  const vkey = ["1","2","3","4","5"];
  const computeProof = [
    "0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb",
    "0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510",
    "0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2",
    "0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3",
    "0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761",
    "0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483",
    "0x14bcc435f49d130d189737f9762feb25c44ef5b886bef833e31a702af6be4748",
    "0xa766932420cc6e9072394bef2c036ad8972c44696fee29397bd5e2c06001f615",
  ];

  const config: AxiomConfig = {
    apiKey: "demo",
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
  };
  const axiom = new Axiom(config);

  test("should initialize QueryV2", () => {
    expect(typeof axiom.query).toEqual("object");
  });

  test("should initialize QueryBuilderV2 with dataQuery", async () => {
    const dataQuery = {
      headerSubqueries: [],
      receiptSubqueries: [],
    };
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery);
    expect(typeof query).toEqual("object");
  });

  test("should initialize QueryBuilderV2 with computeQuery", async () => {
    const dataQuery = {
      headerSubqueries: [],
      receiptSubqueries: [],
    };
    const computeQuery: AxiomV2ComputeQuery = {
      k: 8,
      omega: "0x1234",
      vkey,
      computeProof,
    };
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery, computeQuery);
    expect(typeof query).toEqual("object");
  });

  test("should initialize QueryBuilderV2 with callback", async () => {
    const dataQuery = {
      headerSubqueries: [],
      receiptSubqueries: [],
    };
    const computeQuery: AxiomV2ComputeQuery = {
      k: 8,
      omega: "0x1234",
      vkey,
      computeProof,
    };
    const callbackQuery = {
      callbackAddr: WETH_ADDR,
      callbackFunctionSelector: getFunctionSelector("balanceOf", ["address"]),
      resultLen: 32,
      callbackExtraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery, computeQuery, callbackQuery);
    expect(typeof query).toEqual("object");
  });

  test("should initialize QueryBuilderV2 with options", async () => {
    const dataQuery = {
      headerSubqueries: [],
      receiptSubqueries: [],
    };
    const computeQuery: AxiomV2ComputeQuery = {
      k: 8,
      omega: "0x1234",
      vkey,
      computeProof,
    };
    const callbackQuery = {
      callbackAddr: WETH_ADDR,
      callbackFunctionSelector: getFunctionSelector("balanceOf", ["address"]),
      resultLen: 32,
      callbackExtraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    const options = {};
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery, computeQuery, callbackQuery, options);
    expect(typeof query).toEqual("object");
  });

  test("should initialize QueryBuilderV2 and build Query", async () => {
    const dataQuery = {
      headerSubqueries: [
        {
          blockNumber: BLOCK_NUMBER,
          fieldIdx: 0,
        },
        {
          blockNumber: BLOCK_NUMBER + 1,
          fieldIdx: 1,
        },
      ],
      receiptSubqueries: [
        {
          txHash:
            "0x47082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602",
          fieldOrLogIdx: 5,
          topicOrDataIdx: 10,
          eventSchema: ethers.ZeroHash,
        },
      ],
    };
    const computeQuery: AxiomV2ComputeQuery = {
      k: 8,
      omega: "0x1234",
      vkey,
      computeProof,
    };
    const callbackQuery = {
      callbackAddr: WETH_ADDR,
      callbackFunctionSelector: getFunctionSelector("balanceOf", ["address"]),
      resultLen: 32,
      callbackExtraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    const options = {};
    const query = axiom.query as QueryV2;
    const qb = await query.new(dataQuery, computeQuery, callbackQuery, options);
    expect(typeof query).toEqual("object");

    const {
      dataQueryHash,
      dataQuery: dataQueryStr,
      computeQuery: computeQueryStr,
      callback,
    } = await qb.build();
    expect(dataQueryHash).toEqual(
      "0x32141524b1e90c66ec7cb6de2473e7f3cba0b2d99cc0adeae18f4ec6279081fc"
    );
    expect(dataQueryStr).toEqual(
      "0x0000000100ed14f20000000000ed14f30000000147082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602000000050000000a0000000000000000000000000000000000000000000000000000000000000000"
    );
    expect(computeQueryStr).toEqual(
      "0x08000000000000000000000000000000000000000000000000000000000000123400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cbb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c55100b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2f1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3a8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761d1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa9196048314bcc435f49d130d189737f9762feb25c44ef5b886bef833e31a702af6be4748a766932420cc6e9072394bef2c036ad8972c44696fee29397bd5e2c06001f61500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    expect(callback).toEqual({
      callbackAddr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      callbackExtraData: "0x2e15d7aa0650de1009710fdd45c3468d75ae1392",
      callbackFunctionSelector: "0x70a08231",
      resultLen: 32,
    });
  });
});
