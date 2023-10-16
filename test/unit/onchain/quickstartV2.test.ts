import { ethers } from "ethers";
import {
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  QueryV2,
  buildTxSubquery,
  getEventSchema,
  bytes32,
  buildReceiptSubquery,
} from "../../../src";

describe("Quickstart V2", () => {
  test("Send a simple on-chain Query", async () => {
    const config: AxiomConfig = {
      privateKey: process.env.PRIVATE_KEY_GOERLI as string,
      providerUri: process.env.PROVIDER_URI_GOERLI as string,
      version: "v2",
      chainId: 5,
    };
    const axiom = new Axiom(config);
    const query = (axiom.query as QueryV2).new();

    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema(
      "Swap(address,uint256,uint256,uint256,uint256,address)"
    );

    // First, we'll build a Receipt Subquery that queries the event schema at the specified
    // transaction hash
    const receiptSubquery0 = buildReceiptSubquery(txHash)
      .log(4) // event
      .topic(0) // event schema
      .eventSchema(swapEventSchema);
    query.appendDataSubquery(receiptSubquery0);

    // Second, we'll build another Receipt Subquery to query topic idx 2 (address to)
    const receiptSubquery1 = buildReceiptSubquery(txHash)
      .log(4) // event
      .topic(2) // to field
      .eventSchema(swapEventSchema);
    query.appendDataSubquery(receiptSubquery1);

    // Finally, we'll also query the function selector of this transaction hash as well
    const txSubquery = buildTxSubquery(txHash)
      .functionSelector();
    query.appendDataSubquery(txSubquery);

    const exampleClientAddr = "0xc4708a36027e167e16176c637a4730496612f757";
    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    }
    query.setCallback(callback);

    if (!query.validate()) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = query.calculateFee();
    await query.sendOnchainQuery(
      paymentAmt,
      (receipt: ethers.ContractTransactionReceipt, queryId: string) => {
        // You can do something here once you've received the receipt
        console.log("receipt", receipt);
        console.log("queryId", queryId);
      }
    );
  }, 40000);
});
