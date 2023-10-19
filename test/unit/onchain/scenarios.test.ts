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
  buildHeaderSubquery,
  HeaderField,
  buildAccountSubquery,
  AccountField,
  AxiomV2QueryOptions,
} from "../../../src";

describe("Quickstart V2", () => {
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
    mock: true,
  };
  const axiom = new Axiom(config);

  const exampleClientAddr = "0x8fb73ce80fdb8f15877b161e4fe08b2a0a9979a9";

  test("Send a small on-chain Query", async () => {
    const query = (axiom.query as QueryV2).new();
    const options: AxiomV2QueryOptions = {
      callbackGasLimit: 1000000
    }
    query.setOptions(options);

    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema(
      "Swap(address,uint256,uint256,uint256,uint256,address)"
    );
    const blockNumber = 9500000;

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

    const headerSubquery = buildHeaderSubquery(blockNumber)
      .field(HeaderField.BaseFeePerGas);
    query.appendDataSubquery(headerSubquery);

    const accountSubquery = buildAccountSubquery(blockNumber)
      .address("0xB392448932F6ef430555631f765Df0dfaE34efF3")
      .field(AccountField.Balance);
    query.appendDataSubquery(accountSubquery);

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
    const queryId = await query.sendOnchainQuery(
      paymentAmt,
      (receipt: ethers.ContractTransactionReceipt) => {
        // You can do something here once you've received the receipt
        console.log("receipt", receipt);
      }
    );
    console.log("queryId", queryId);
  }, 40000);

  // test("Send a size-64 on-chain Query", async () => {
  //   const query = (axiom.query as QueryV2).new();

  //   const endBlockNumber = 9800000;
  //   const interval = 10000;
  //   for (let i = 64; i > 0; i--) {
  //     const accountSubquery = buildAccountSubquery(endBlockNumber - i * interval)
  //       .address("0xB392448932F6ef430555631f765Df0dfaE34efF3")
  //       .field(AccountField.Balance);
  //     query.appendDataSubquery(accountSubquery);
  //   }
  //   const callback: AxiomV2Callback = {
  //     target: exampleClientAddr,
  //     extraData: bytes32(0),
  //   }
  //   query.setCallback(callback);

  //   if (!query.validate()) {
  //     throw new Error("Query validation failed");
  //   }
  //   await query.build();
  //   const paymentAmt = query.calculateFee();
  //   const queryId = await query.sendOnchainQuery(
  //     paymentAmt,
  //     (receipt: ethers.ContractTransactionReceipt) => {
  //       // You can do something here once you've received the receipt
  //       console.log("receipt", receipt);
  //     }
  //   );
  //   console.log("queryId", queryId);
  // }, 40000);
});
