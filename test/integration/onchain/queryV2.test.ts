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
import { ConstantsV2 } from "../../../src/v2/constants";

describe("Quickstart V2", () => {
  test("Check calculated queryId matches on-chain value (pass in privateKey)", async () => {
    const config: AxiomConfig = {
      privateKey: process.env.PRIVATE_KEY_GOERLI as string,
      providerUri: process.env.PROVIDER_URI_GOERLI as string,
      version: "v2",
      chainId: 5,
      mock: true,
    };
    const axiom = new Axiom(config);
    const query = (axiom.query as QueryV2).new();

    const _exampleClientAddr = "0x41a7a901ef58d383801272d2408276d96973550d";
    const exampleClientAddrMock = "0xeFb3aCa4eEdbE546749E17D2c564F884603cEdC7";
    const exampleClientAddr = config.mock ? exampleClientAddrMock : _exampleClientAddr;
    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema("Swap(address,uint256,uint256,uint256,uint256,address)");

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

    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    };
    query.setCallback(callback);

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = query.calculateFee();

    const queryId0 = await query.getQueryId();

    const queryId1 = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
      const queryInitiated = receipt.logs.find(
        (log: ethers.Log) => log.topics[0] === ConstantsV2.QueryInitiatedOnchainSchema,
      );
      const queryIdRaw = queryInitiated?.topics[3];
      const queryId = BigInt(queryIdRaw ?? "").toString();
      expect(queryId).toEqual(queryId0);
    });
    expect(queryId0).toEqual(queryId1);
  }, 40000);

  test("Check calculated queryId matches on-chain value (external wallet)", async () => {
    const config: AxiomConfig = {
      providerUri: process.env.PROVIDER_URI_GOERLI as string,
      version: "v2",
      chainId: 5,
      mock: true,
    };
    const axiom = new Axiom(config);
    const query = (axiom.query as QueryV2).new();

    const abi = axiom.getAxiomQueryAbi();
    const address = axiom.getAxiomQueryAddress() as string;

    const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_GOERLI as string, provider);
    const axiomV2Query = new ethers.Contract(address, abi, wallet);

    const exampleClientAddr = "0x8fb73ce80fdb8f15877b161e4fe08b2a0a9979a9";
    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema("Swap(address,uint256,uint256,uint256,uint256,address)");

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

    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    };
    query.setCallback(callback);

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    const builtQuery = await query.build();
    const paymentAmt = query.calculateFee();

    const queryId = await query.getQueryId(await wallet.getAddress());

    // Submit Query to Airdrop contract
    const tx = await axiomV2Query.sendQuery(
      builtQuery.sourceChainId,
      builtQuery.dataQueryHash,
      builtQuery.computeQuery,
      builtQuery.callback,
      builtQuery.userSalt,
      builtQuery.maxFeePerGas,
      builtQuery.callbackGasLimit,
      await wallet.getAddress(),
      builtQuery.dataQuery,
      { value: paymentAmt },
    );
    const receipt = await tx.wait();
    const queryInitiated = receipt.logs.find(
      (log: ethers.Log) => log.topics[0] === ConstantsV2.QueryInitiatedOnchainSchema,
    );
    const queryIdRaw = queryInitiated?.topics[3];
    const queryIdAfter = BigInt(queryIdRaw ?? "").toString();
    expect(queryId).toEqual(queryIdAfter);
  }, 40000);
});
