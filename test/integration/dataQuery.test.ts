import { ethers } from "ethers";
import {
  AxiomCore,
  AxiomCoreConfig,
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
  buildSolidityNestedMappingSubquery,
} from "../../src";
import { exampleClientMock, exampleClientReal } from "./constants";

describe("On-chain Data Query scenarios", () => {
  const config: AxiomCoreConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
    mock: (process.env.MOCK ?? "false").toLowerCase() === "true" ? true : false,
  };
  const axiom = new AxiomCore(config);

  const exampleClientAddr = config.mock ? exampleClientMock : exampleClientReal;

  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
  const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
  const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  test("Send a small DataQuery", async () => {
    const query = (axiom.query as QueryV2).new();
    const options: AxiomV2QueryOptions = {
      callbackGasLimit: 1000000,
    };
    query.setOptions(options);

    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema("Swap(address,uint256,uint256,uint256,uint256,address)");
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

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = await query.calculateFee();
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    });
    console.log("queryId", queryId);
  }, 60000);

  test("Send one of each DataQuery", async () => {
    const query = (axiom.query as QueryV2).new();
    const options: AxiomV2QueryOptions = {
      callbackGasLimit: 1000000,
    };
    query.setOptions(options);

    const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
    const swapEventSchema = getEventSchema("Swap(address,uint256,uint256,uint256,uint256,address)");
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
    const txSubquery = buildTxSubquery(txHash).functionSelector();
    query.appendDataSubquery(txSubquery);

    const headerSubquery = buildHeaderSubquery(blockNumber).field(HeaderField.BaseFeePerGas);
    query.appendDataSubquery(headerSubquery);

    const accountSubquery = buildAccountSubquery(blockNumber)
      .address("0xB392448932F6ef430555631f765Df0dfaE34efF3")
      .field(AccountField.Balance);
    query.appendDataSubquery(accountSubquery);

    const mappingSubquery = buildSolidityNestedMappingSubquery(blockNumber)
      .address(UNI_V3_FACTORY_ADDR)
      .mappingSlot(3)
      .keys([WETH_ADDR, WSOL_ADDR, 10000, 5000]);
    query.appendDataSubquery(mappingSubquery);

    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    };
    query.setCallback(callback);

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = await query.calculateFee();
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    });
    console.log("queryId", queryId);
  }, 60000);

  test("Send a size-31 header DataQuery", async () => {
    const query = (axiom.query as QueryV2).new();

    const endBlockNumber = 9800000;
    const interval = 10000;
    for (let i = 31; i > 0; i--) {
      const accountSubquery = buildHeaderSubquery(endBlockNumber - i * interval).field(HeaderField.Nonce);
      query.appendDataSubquery(accountSubquery);
    }
    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    };
    query.setCallback(callback);

    if (!(await query.validate())) {
      throw new Error("Query validation failed");
    }
    await query.build();
    const paymentAmt = await query.calculateFee();
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    });
    console.log("queryId", queryId);
  }, 60000);

  // test("Send a size-64 account DataQuery", async () => {
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
  //   };
  //   query.setCallback(callback);

  //   if (!(await query.validate())) {
  //     throw new Error("Query validation failed");
  //   }
  //   await query.build();
  //   const paymentAmt = await query.calculateFee();
  //   const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
  //     // You can do something here once you've received the receipt
  //     console.log("receipt", receipt);
  //   });
  //   console.log("queryId", queryId);
  // }, 60000);
});
