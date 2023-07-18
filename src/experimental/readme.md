# Axiom Experimental SDK

- Includes Transactions and Receipts

## Code example 

```typescript
import { sleep } from "../shared/utils";
import { Axiom, AxiomConfig } from "@axiom-crypto/experimental";
import { ethers, solidityPacked } from "ethers";
import { Constants } from "../shared/constants";
import { abi as AxiomExperimentalAbi } from "../lib/abi/AxiomExperimentalTxMock.json";
import dotenv from "dotenv";
import { TransactionField } from "@axiom-crypto/experimental/experimental/txReceiptsQueryBuilder";
import { ReceiptField } from "@axiom-crypto/experimental/experimental/onlyReceiptsQueryBuilder";
dotenv.config();

let providerUri = process.env.PROVIDER_URI as string;
if (!providerUri || providerUri === "") {
  providerUri = "http://127.0.0.1:8545";
}

const config: AxiomConfig = {
  providerUri,
  version: "experimental",
  chainId: 5,
  mock: true,
};
const ax = new Axiom(config);

async function newTxQuery() {
  const qb = ax.experimental.newTxReceiptsQueryBuilder();
  await qb.appendTxQuery({
    txHash:
      "0x9ba6df3200fe8d62103ede64a32a2475e4c7f992fe5e8ea7f08a490edf32d48d",
    field: TransactionField.To,
  });
  await qb.appendTxQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: TransactionField.Data,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Status,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.CumulativeGas,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Logs,
    logIndex: 0,
  });

  return qb;
}

async function newReceiptQuery() {
  const qb = ax.experimental.newOnlyReceiptsQueryBuilder();
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Status,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Logs,
    logIndex: 0,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.CumulativeGas,
  });
  return qb;
}

async function main() {
  let signer: ethers.Signer;

  const provider = new ethers.JsonRpcProvider(providerUri); //process.env.INFURA_URL as string);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  signer = wallet;

  let signerAddress = await signer.getAddress();

  {
    let qb = await newTxQuery();
    console.log("Sending query transaction...");
    const res = await qb.sendTxReceiptsQuery(signer, signerAddress, {
      value: ethers.parseEther("0.01"),
      gasPrice: ethers.parseUnits("100", "gwei"),
    });
    console.log(res);
  }
  {
    let qb = await newReceiptQuery();
    console.log("Sending query transaction...");
    const res = await qb.sendOnlyReceiptsQuery(signer, signerAddress, {
      value: ethers.parseEther("0.01"),
      gasPrice: ethers.parseUnits("100", "gwei"),
    });
    console.log(res);
  }
}
main();
```