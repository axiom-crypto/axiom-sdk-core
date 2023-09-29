import {
  bytes32,
  getSlotForMapping,
  HeaderField,
  AccountField,
  TxField,
  getBlockNumberAndTxIdx,
} from "@axiom-crypto/tools";
import {
  Axiom,
  AxiomConfig,
  QueryV2,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildSolidityNestedMappingSubquery,
  buildStorageSubquery,
  buildTxSubquery,
} from "../../../src";
import { ethers } from "ethers";

describe("Query Validation Tests", () => {
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
  const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI as string);

  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
    chainId: 1,
  };
  const axiom = new Axiom(config);
  const aq: QueryV2 = axiom.query;
  
  test("Validate pass: Header subquery", async () => {
    const query = aq.new();
    const subquery = buildHeaderSubquery(17000000)
      .field(HeaderField.GasUsed);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Account subquery", async () => {
    const query = aq.new();
    const subquery = buildAccountSubquery(18000000)
      .address(WETH_WHALE)
      .field(AccountField.Balance);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Storage subquery", async () => {
    const query = aq.new();
    const slot = getSlotForMapping("3", "address", WETH_WHALE);
    const subquery = buildStorageSubquery(18000000)
      .address(WETH_ADDR)
      .slot(slot);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Tx subquery", async () => {
    const query = aq.new();
    
    const hash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const { blockNumber, txIdx } = await getBlockNumberAndTxIdx(provider, hash);
    if (!blockNumber || !txIdx) {
      throw new Error("Failed to get block number and tx idx");
    }

    const subquery = buildTxSubquery(blockNumber, txIdx)
      .field(TxField.To);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Tx subquery calldata", async () => {
    const query = aq.new();

    const hash = "0xc9ef13429be1a3f44c75af95c4e2ac2083a3469e2751a42a04fcdace94ff98a5";
    const { blockNumber, txIdx } = await getBlockNumberAndTxIdx(provider, hash) as { blockNumber: number, txIdx: number };

    const subquery = buildTxSubquery(blockNumber, txIdx)
      .calldata(0);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });
  
  test("Validate pass: Receipt subquery", async () => {
    const query = aq.new();

    const hash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const { blockNumber, txIdx } = await getBlockNumberAndTxIdx(provider, hash) as { blockNumber: number, txIdx: number };

    const subquery = buildReceiptSubquery(blockNumber, txIdx)
      .log(0)
      .topic(1)
      .eventSchema("Transfer(address,address,uint256)");
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Solidity nested mapping subquery", async () => {
    const query = aq.new();
    const subquery = buildSolidityNestedMappingSubquery(17000000)
      .address(UNI_V3_FACTORY_ADDR)
      .mappingSlot(5)
      .keys([
        WETH_ADDR,
        WSOL_ADDR,
        10000,
      ]);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate fail: Header subquery", async () => {
    const query = aq.new();
    const test = () => {
      const subquery = buildHeaderSubquery("0x480aa3cf46a1813d543e169314d56831aa002d932444723fee6b9e31d01f8c28")
        .field(HeaderField.Miner);
      query.appendDataSubquery(subquery);
    }
    expect(test).toThrow();
  });

  test("Validate pass: Callback", async () => {

  });
});