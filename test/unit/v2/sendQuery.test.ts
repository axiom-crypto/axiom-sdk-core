import { AxiomV2ComputeQuery } from "@axiom-crypto/codec";
import { Axiom, AxiomConfig } from "../../../src";
import { QueryV2 } from "../../../src/v2/query/queryV2";
import { ethers } from "ethers";
import { getFunctionSelector, resizeArray } from "../../../src/shared/utils";
import { ConstantsV2 } from "../../../src/v2/constants";

describe("QueryV2", () => {
  const BLOCK_NUMBER = 15537400;
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
    privateKey: process.env.PRIVATE_KEY as string,
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
    chainId: 1,
  };

  // Override w/ your local anvil address
  const overrides = {
    Addresses: {
      Axiom: "0xf201fFeA8447AB3d43c98Da3349e0749813C9009",
      AxiomQuery: "0x837a41023CF81234f89F956C94D676918b4791c1",
    },
  };
  const axiom = new Axiom(config, overrides);

  test("Can send on-chain Query", async () => {
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
          fieldOrLogIdx: 3,
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
    await qb.build();
    
    const payment = qb.calculateFee();
    console.log(payment);
    await qb.sendOnchainQuery(
      payment,
      (receipt: any) => {
        console.log("receipt", receipt);
      }
    );
  });

  test("Can send off-chain Query", async () => {
    
  });
});
