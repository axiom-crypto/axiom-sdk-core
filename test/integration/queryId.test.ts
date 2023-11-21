import { ethers } from "ethers";
import {
  Axiom,
  AxiomConfig,
  QueryV2,
  getEventSchema,
  bytes32,
  buildReceiptSubquery,
  AxiomV2QueryOptions,
} from "../../src";

describe("QueryID Test", () => {
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
    mock: true,
  };
  const axiom = new Axiom(config);

  test("check queryId matches emitted event", async () => {
    const query = (axiom.query as QueryV2).new();
    const options: AxiomV2QueryOptions = {
      callbackGasLimit: 1000000,
    };
    query.setOptions(options);

    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const receiptSubquery = buildReceiptSubquery(txHash)
      .log(4) // event
      .topic(0) // event schema
      .eventSchema(getEventSchema("Swap(address,uint256,uint256,uint256,uint256,address)"));
    query.appendDataSubquery(receiptSubquery);

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = await query.calculateFee();

    let onchainQueryId = "";
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      const queryInitiatedOnChainEvent = receipt.logs[2];
      onchainQueryId = queryInitiatedOnChainEvent.topics[3];
    });
    console.log("queryId", queryId, bytes32(queryId));
    expect(bytes32(queryId)).toEqual(onchainQueryId);
  }, 60000);
});
