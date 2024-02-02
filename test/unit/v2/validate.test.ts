import { getSlotForMapping, HeaderField, AccountField, TxField } from "@axiom-crypto/tools";
import {
  AxiomSdkCore,
  AxiomSdkCoreConfig,
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

  const config: AxiomSdkCoreConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
    chainId: 1,
  };
  const axiom = new AxiomSdkCore(config);
  const aq = axiom.query as QueryV2;

  const axiomSepolia = new AxiomSdkCore({
    providerUri: process.env.PROVIDER_URI_SEPOLIA as string,
    version: "v2",
    chainId: "11155111",
  });
  const aqSep = axiomSepolia.query as QueryV2;

  test("Validate pass: Header subquery", async () => {
    const query = aq.new();
    const subquery = buildHeaderSubquery(17000000).field(HeaderField.GasUsed);
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

    const txHash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const subquery = buildTxSubquery(txHash).field(TxField.To);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Tx subquery calldata", async () => {
    const query = aq.new();

    const txHash = "0x192bc136b4637e0c31dc80b7c4e8cd63328c7c411ba8574af1841ed2c4a6dd80";
    const subquery = buildTxSubquery(txHash).calldata(0);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Larger Tx subquery contractData", async () => {
    const query = aq.new();

    const txHash = "0xc9ef13429be1a3f44c75af95c4e2ac2083a3469e2751a42a04fcdace94ff98a5";
    const subquery = buildTxSubquery(txHash).contractData(0);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate pass: Receipt subquery", async () => {
    const query = aq.new();

    const txHash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const subquery = buildReceiptSubquery(txHash)
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
      .keys([WETH_ADDR, WSOL_ADDR, 10000]);
    query.appendDataSubquery(subquery);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate fail: Header subquery", async () => {
    const query = aq.new();
    const test = () => {
      const subquery = buildHeaderSubquery("0x480aa3cf46a1813d543e169314d56831aa002d932444723fee6b9e31d01f8c28").field(
        HeaderField.Miner,
      );
      query.appendDataSubquery(subquery);
    };
    expect(test).toThrow();
  });

  test("Validate pass: empty Callback combinations", async () => {
    const query = aq.new();
    const subquery = buildSolidityNestedMappingSubquery(17000000)
      .address(UNI_V3_FACTORY_ADDR)
      .mappingSlot(5)
      .keys([WETH_ADDR, WSOL_ADDR, 10000]);
    query.appendDataSubquery(subquery);

    query.setCallback({
      target: UNI_V3_FACTORY_ADDR,
      extraData: ethers.ZeroHash,
    });
    let isValid = await query.validate();
    expect(isValid).toEqual(true);

    query.setCallback({
      target: UNI_V3_FACTORY_ADDR,
      extraData: "",
    });
    isValid = await query.validate();
    expect(isValid).toEqual(true);

    query.setCallback({
      target: UNI_V3_FACTORY_ADDR,
      extraData: "0x",
    });
    isValid = await query.validate();
    expect(isValid).toEqual(true);
  });

  test("Validate fail: invalid Callback combinations", async () => {
    const query = aq.new();

    query.setCallback({
      target: "",
      extraData: "",
    });
    let isValid = await query.validate();
    expect(isValid).toEqual(false);

    query.setCallback({
      target: ethers.ZeroAddress,
      extraData: "",
    });
    isValid = await query.validate();

    query.setCallback({
      target: UNI_V3_FACTORY_ADDR,
      extraData: "0x1234",
    });
    isValid = await query.validate();
    expect(isValid).toEqual(false);
  });

  test("Validate fail: type 3 tx subquery", async () => {
    const sepoliaTransactions = [
      // type 3
      "0x8fd091f4b5b1b17431110afa99fbd9cabdabecb92a1315afa458fc3dcb91efde",
      "0x95ea8f5b10f8ac9f48943ac32014705a10c76d54551391f1ed34c72c6c28fa83",
      "0x48c6fcfd6cbc753938d486cb33711b63d4330b48371a7919648c9e1506d6b6e9",
      "0xbdb6eb8982db0695f6685840d01667d9c7beb5140b96e6af38c346c6a0de2edf",
      "0xaeac36b485d4c6672f6d7337ab8015b0d4483724151dfda88214c0e4fd675542",
    ];

    for (const txHash of sepoliaTransactions) {
      const query = aqSep.new();
      const subquery = buildTxSubquery(txHash).field(TxField.To);
      query.appendDataSubquery(subquery);
      const isValid = await query.validate();
      expect(isValid).toEqual(false);
    }
  });
});
