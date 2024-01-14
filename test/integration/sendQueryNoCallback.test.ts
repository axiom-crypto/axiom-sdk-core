import { ethers } from "ethers";
import {
  AxiomSdkCore,
  AxiomSdkCoreConfig,
  QueryV2,
  buildAccountSubquery,
  AccountField,
} from "../../src";

// Test coverage areas:
// - DataQuery
// - No callback

describe("Send Query no Callback", () => {
  const config: AxiomSdkCoreConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
    mock: (process.env.MOCK ?? "false").toLowerCase() === "true" ? true : false,
  };
  const axiom = new AxiomSdkCore(config);

  test("Send a size-31 account DataQuery", async () => {
    const query = (axiom.query as QueryV2).new();

    const endBlockNumber = 9800000;
    const interval = 10000;
    for (let i = 31; i > 0; i--) {
      const accountSubquery = buildAccountSubquery(endBlockNumber - i * interval)
        .address("0xB392448932F6ef430555631f765Df0dfaE34efF3")
        .field(AccountField.Balance);
      query.appendDataSubquery(accountSubquery);
    }

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
});