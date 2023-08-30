import { AccountField, AxiomV2ComputeQuery, getAccountFieldIdx } from "@axiom-crypto/codec";
import { Axiom, AxiomConfig } from "../../../src";
import { QueryV2 } from "../../../src/v2/query/queryV2";
import { ethers } from "ethers";
import { getFunctionSelector, resizeArray } from "../../../src/shared/utils";
import { ConstantsV2 } from "../../../src/v2/constants";

describe("QueryV2", () => {
  const BLOCK_NUMBER = 15537394;
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
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
    privateKey: process.env.PRIVATE_KEY as string,
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
      accountSubqueries: [
        {
          blockNumber: BLOCK_NUMBER,
          addr: WETH_WHALE,
          fieldIdx: getAccountFieldIdx(AccountField.Nonce),
        }
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
    const computeQueryReq: AxiomV2ComputeQuery = {
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
    const qb = await query.new(dataQuery, computeQueryReq, callbackQuery, options);
    
    const processedDq = qb.getDataQuery();
    expect(processedDq?.accountSubqueries?.[0].addr).toEqual(WETH_WHALE.toLowerCase());

    const {
      dataQueryHash,
      dataQuery: dataQueryStr,
      computeQuery,
      callback,
    } = await qb.build();
    expect(dataQueryHash).toEqual(
      "0x3312ad0a554819de93c71cf5c484a326642f8c797ad2f94f6901c4a89a3d14e6"
    );
    expect(dataQueryStr).toEqual(
      "0x00000001000100ed14f200000000000100ed14f300000001000200ed14f22e15d7aa0650de1009710fdd45c3468d75ae139200000000000547082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602000000050000000a0000000000000000000000000000000000000000000000000000000000000000"
    );
    expect(computeQuery.k).toEqual(computeQueryReq.k);
    expect(computeQuery.omega).toEqual(computeQueryReq.omega);
    expect(computeQuery.vkey).toEqual(resizeArray(computeQueryReq.vkey, ConstantsV2.VkeyLen, ethers.ZeroHash));
    expect(computeQuery.computeProof).toEqual(resizeArray(computeQueryReq.computeProof, ConstantsV2.ProofLen, ethers.ZeroHash));
    expect(callback).toEqual({
      callbackAddr: WETH_ADDR.toLowerCase(),
      callbackExtraData: "0x2e15d7aa0650de1009710fdd45c3468d75ae1392",
      resultLen: 32,
      callbackFunctionSelector: "0x70a08231",
    });
  });
});
