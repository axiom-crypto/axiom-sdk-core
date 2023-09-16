import { ethers } from "ethers";
import {
  getAccountData,
  getAccountFieldValue,
  getFullBlock,
  getHeaderFieldValue,
  getReceiptFieldValue,
  getSolidityNestedMappingValue,
  getStorageFieldValue,
  getTxFieldValue,
  getTxTypeForTxHash,
} from "../../../src/shared/chainData";
import {
  AccountField,
  HeaderField,
  ReceiptField,
  TxField,
  TxType,
} from "@axiom-crypto/codec";
import { bytes32 } from "../../../src/shared/utils";
import { receiptUseAddress, receiptUseDataIdx, receiptUseLogIdx, txUseCalldataIdx } from "../../../src";


describe("ChainData query tests", () => {
  const MATIC_ADDR = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";
  const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI as string);

  test("get header fields", async () => {
    const blockNumber = 17000000;
    const block = await getFullBlock(blockNumber, provider);
    const parentHash = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.ParentHash });
    expect(parentHash).toEqual(block.parentHash);
    const sha3Uncles = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Sha3Uncles });
    expect(sha3Uncles).toEqual(block.sha3Uncles);
    const miner = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Miner });
    expect(miner).toEqual(block.miner);
    const stateRoot = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.StateRoot });
    expect(stateRoot).toEqual(block.stateRoot);
    const transactionsRoot = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.TransactionsRoot });
    expect(transactionsRoot).toEqual(block.transactionsRoot);
    const receiptsRoot = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.ReceiptsRoot });
    expect(receiptsRoot).toEqual(block.receiptsRoot);
    const logsBloom = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.LogsBloom });
    expect(logsBloom).toEqual(block.logsBloom);
    const difficulty = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Difficulty });
    expect(difficulty).toEqual(block.difficulty);
    const number = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Number });
    expect(number).toEqual(block.number);
    const gasLimit = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.GasLimit });
    expect(gasLimit).toEqual(block.gasLimit);
    const gasUsed = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.GasUsed });
    expect(gasUsed).toEqual(block.gasUsed);
    const timestamp = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Timestamp });
    expect(timestamp).toEqual(block.timestamp);
    const extraData = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.ExtraData });
    expect(extraData).toEqual(block.extraData);
    const mixHash = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.MixHash });
    expect(mixHash).toEqual(block.mixHash);
    const nonce = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.Nonce });
    expect(nonce).toEqual(block.nonce);
    const baseFeePerGas = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.BaseFeePerGas });
    expect(baseFeePerGas).toEqual(block.baseFeePerGas);
    const withdrawlsRoot = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.WithdrawlsRoot });
    expect(withdrawlsRoot).toEqual(null);
    const blobGasUsed = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.BlobGasUsed });
    expect(blobGasUsed).toEqual(null);
    const excessBlobGas = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.ExcessBlobGas });
    expect(excessBlobGas).toEqual(null);
    const parentBeaconBlockRoot = await getHeaderFieldValue(provider, { blockNumber, fieldIdx: HeaderField.ParentBeaconBlockRoot });
    expect(parentBeaconBlockRoot).toEqual(null);
  });

  test("get account fields", async () => {
    const blockNumber = 17000000;
    const addr = MATIC_ADDR;
    const account = await getAccountData(blockNumber, addr, [], provider);
    const nonce = await getAccountFieldValue(provider, { blockNumber, addr, fieldIdx: AccountField.Nonce });
    expect(nonce).toEqual(account.nonce);
    const balance = await getAccountFieldValue(provider, { blockNumber, addr, fieldIdx: AccountField.Balance });
    expect(balance).toEqual(account.balance);
    const storageRoot = await getAccountFieldValue(provider, { blockNumber, addr, fieldIdx: AccountField.StorageRoot });
    expect(storageRoot).toEqual(account.storageHash);
    const codeHash = await getAccountFieldValue(provider, { blockNumber, addr, fieldIdx: AccountField.CodeHash });
    expect(codeHash).toEqual(account.codeHash);
  });

  test("get storage slot", async () => {
    const blockNumber = 17000000;
    const addr = MATIC_ADDR;
    const slot = "2";
    const knownValue = bytes32(BigInt("10000000000000000000000000000"));
    const value = await getStorageFieldValue(provider, { blockNumber, addr, slot });
    expect(value).toEqual(knownValue);
  });

  test("get tx field value", async () => {
    const txHash = "0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453";
    const chainId = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.ChainId });
    expect(chainId).toEqual(1n);
    const nonce = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.Nonce });
    expect(nonce).toEqual(4);
    const maxPriorityFeePerGas = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.MaxPriorityFeePerGas });
    expect(maxPriorityFeePerGas).toEqual(100000000n);
    const maxFeePerGas = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.MaxFeePerGas });
    expect(maxFeePerGas).toEqual(23249354679n);
    const gasLimit = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.GasLimit });
    expect(gasLimit).toEqual(352692n);
    const to = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.To });
    expect(to).toEqual("0x253553366Da8546fC250F225fe3d25d0C782303b");
    const value = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: TxField.Value });
    expect(value).toEqual(2750421866180485n);
  });

  test("get tx calldataIdx value", async () => {
    const txHash = "0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453";
    let calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(0) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000100");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(1) });
    expect(calldataValue).toEqual("0x000000000000000000000000b392448932f6ef430555631f765df0dfae34eff3");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(2) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000001e13380");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(3) });
    expect(calldataValue).toEqual("0x9923eb9400000003082a0a4936bd94a9078de18bea9fb1e023ecfb31b44c5f9d");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(4) });
    expect(calldataValue).toEqual("0x000000000000000000000000231b0ee14048e9dccd1d247744d114a4eb5e8e63");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(5) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000140");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(6) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000001");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(7) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(8) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000006");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(9) });
    expect(calldataValue).toEqual("0x7a65726f6b700000000000000000000000000000000000000000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(10) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000001");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(11) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000020");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(12) });
    expect(calldataValue).toEqual("0x00000000000000000000000000000000000000000000000000000000000000a4");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(13) });
    expect(calldataValue).toEqual("0x8b95dd717610115e31b8be283a240f1b8ea09ca53abfdfaa17c79175efd8cfef");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(14) });
    expect(calldataValue).toEqual("0x62b37ab900000000000000000000000000000000000000000000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(15) });
    expect(calldataValue).toEqual("0x0000003c00000000000000000000000000000000000000000000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(16) });
    expect(calldataValue).toEqual("0x0000006000000000000000000000000000000000000000000000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(17) });
    expect(calldataValue).toEqual("0x00000014b392448932f6ef430555631f765df0dfae34eff30000000000000000");
    calldataValue = await getTxFieldValue(provider, { txHash, fieldOrCalldataIdx: txUseCalldataIdx(18) });
    expect(calldataValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000000");
  });

  test("get receipt field value", async () => {
    const txHash = "0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453";
    const value = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: ReceiptField.Status, eventSchema: "0x", topicOrDataOrAddressIdx: 0 });
    expect(value).toEqual(1);
  });

  test("get receipt logIdx value", async () => {
    const txHash = "0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453";
    const eventSchema = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: 0 });
    expect(receiptValue).toEqual("0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: 1 });
    expect(receiptValue).toEqual("0x7610115e31b8be283a240f1b8ea09ca53abfdfaa17c79175efd8cfef62b37ab9");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: 2 });
    expect(receiptValue).toEqual(null);
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: receiptUseDataIdx(0) });
    expect(receiptValue).toEqual("0x000000000000000000000000000000000000000000000000000000000000003c");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: receiptUseDataIdx(1) });
    expect(receiptValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000040");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: receiptUseDataIdx(2) });
    expect(receiptValue).toEqual("0x0000000000000000000000000000000000000000000000000000000000000014");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: receiptUseDataIdx(3) });
    expect(receiptValue).toEqual("0xb392448932f6ef430555631f765df0dfae34eff3000000000000000000000000");
    receiptValue = await getReceiptFieldValue(provider, { txHash, fieldOrLogIdx: receiptUseLogIdx(7), eventSchema, topicOrDataOrAddressIdx: receiptUseAddress() });
    expect(receiptValue).toEqual("0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63");
  });

  test("Get solidity nested mapping value", async () => {
    const blockNumber = 17000000;
    const addr = UNI_V3_FACTORY_ADDR;
    const mappingSlot = "5";
    const mappingDepth = 3;
    const keys: [string, string, string, string] = [
      bytes32("0x0000000000085d4780b73119b644ae5ecd22b376"),
      bytes32("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      bytes32(3000),
      "",
    ];
    const value = await getSolidityNestedMappingValue(provider, { blockNumber, addr, mappingSlot, mappingDepth, keys });
    expect(value).toEqual(bytes32("0xf5148fbdae394c553d019b4caeffc5f845dcd12c"));
  });

  test("Get TxType for hash", async () => {
    const legacy = await getTxTypeForTxHash(provider, "0x078a2ebd0cfcc55f03f8ac604a16147aba1bd67db398069cedae5495412ac47a");
    expect(legacy).toEqual(TxType.Legacy);
    const eip2930 = await getTxTypeForTxHash(provider, "0xa6b2e8ba408ae22f617dacef1bae75a129ec92c9c3f1832338f2585bb7d77a35");
    expect(eip2930).toEqual(TxType.Eip2930);
    const eip1559 = await getTxTypeForTxHash(provider, "0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453");
    expect(eip1559).toEqual(TxType.Eip1559);
  });
});