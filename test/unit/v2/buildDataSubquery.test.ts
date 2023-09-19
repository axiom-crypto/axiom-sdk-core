import { AccountField, AccountSubquery, DataSubqueryType, HeaderField, HeaderSubquery, ReceiptSubquery, SolidityNestedMappingSubquery, SpecialValuesV2, StorageSubquery, TxField, TxSubquery, TxType } from "@axiom-crypto/codec";
import { Axiom, AxiomConfig, QueryV2, bytes32 } from "../../../src";
import {
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildTxSubquery,
  buildStorageSubquery,
  buildSolidityNestedMappingSubquery,
} from '../../../src/v2/query/dataSubquery/builder';

describe("Build data subquery", () => {
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase();
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392".toLowerCase();

  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    chainId: 1,
    version: "v2",
  }
  const axiom = new Axiom(config);

  test("Build and append a header subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery: HeaderSubquery = buildHeaderSubquery(18000000)
      .field(HeaderField.GasUsed);
    query.appendDataSubquery(headerSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as HeaderSubquery;
    expect(subquery?.blockNumber).toEqual(18000000);
    expect(subquery?.fieldIdx).toEqual(HeaderField.GasUsed);
  });

  test("Build and append a header logsBloom subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery: HeaderSubquery = buildHeaderSubquery(18000000)
      .logsBloom(2);
    query.appendDataSubquery(headerSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as HeaderSubquery;
    expect(subquery?.blockNumber).toEqual(18000000);
    expect(subquery?.fieldIdx).toEqual(SpecialValuesV2.HeaderLogsBloomIdxOffset + 2);
  });

  test("Build and append an account subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const accountSubquery: AccountSubquery = buildAccountSubquery(18000000)
      .address(WETH_WHALE)
      .field(AccountField.Balance);
    query.appendDataSubquery(accountSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as AccountSubquery;
    expect(subquery?.blockNumber).toEqual(18000000);
    expect(subquery?.addr).toEqual(WETH_WHALE);
    expect(subquery?.fieldIdx).toEqual(AccountField.Balance);
  });

  test("Build and append a storage subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const storageSubquery: StorageSubquery = buildStorageSubquery(18000000)
      .address(WETH_ADDR)
      .slot(1);
    query.appendDataSubquery(storageSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as StorageSubquery;
    expect(subquery?.blockNumber).toEqual(18000000);
    expect(subquery?.addr).toEqual(WETH_ADDR);
    expect(subquery?.slot).toEqual(bytes32(1));
  });

  test("Build and append a tx subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const txSubquery: TxSubquery = buildTxSubquery("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6")
      .field(TxField.MaxPriorityFeePerGas)
      .type(TxType.Eip1559);
    query.appendDataSubquery(txSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as TxSubquery;
    expect(subquery?.txHash).toEqual("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6");
    expect(subquery?.fieldOrCalldataIdx).toEqual(2);
  });

  test("Build and append a receipt subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const receiptSubquery: ReceiptSubquery = buildReceiptSubquery("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6")
      .log(0)
      .topic(1)
      .eventSchema("Transfer (address from, address to, uint256 value)");
    query.appendDataSubquery(receiptSubquery);
    const dataQuery = query.getDataQuery();
    
    const subquery = dataQuery?.[0].subqueryData as ReceiptSubquery;
    expect(subquery?.txHash).toEqual("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6");
    expect(subquery?.fieldOrLogIdx).toEqual(100);
    expect(subquery?.topicOrDataOrAddressIdx).toEqual(1);
    expect(subquery?.eventSchema).toEqual("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
  });

  test("Build and append a receipt log address subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const receiptSubquery: ReceiptSubquery = buildReceiptSubquery("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6")
      .log(0)
      .address();
    query.appendDataSubquery(receiptSubquery);
    const dataQuery = query.getDataQuery();
    
    const subquery = dataQuery?.[0].subqueryData as ReceiptSubquery;
    expect(subquery?.txHash).toEqual("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6");
    expect(subquery?.fieldOrLogIdx).toEqual(100);
    expect(subquery?.topicOrDataOrAddressIdx).toEqual(50);
    expect(subquery?.eventSchema).toEqual(bytes32(0));
  });

  test("Build and append a receipt logsBloom subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const receiptSubquery: ReceiptSubquery = buildReceiptSubquery("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6")
      .logsBloom(2);
    query.appendDataSubquery(receiptSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as ReceiptSubquery;
    expect(subquery?.txHash).toEqual("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6");
    expect(subquery?.fieldOrLogIdx).toEqual(SpecialValuesV2.ReceiptLogsBloomIdxOffset + 2);
  });

  test("Build and append a nested mapping subquery", () => {
    const query = (axiom.query as QueryV2).new();
    const nestedMappingSubquery: SolidityNestedMappingSubquery = buildSolidityNestedMappingSubquery(18000000)
      .address(WETH_ADDR)
      .mappingSlot(0)
      .keys([
        WETH_ADDR,
        WETH_WHALE,
        100000
      ]);
    query.appendDataSubquery(nestedMappingSubquery);
    const dataQuery = query.getDataQuery();

    const subquery = dataQuery?.[0].subqueryData as SolidityNestedMappingSubquery;
    expect(subquery?.blockNumber).toEqual(18000000);
    expect(subquery?.addr).toEqual(WETH_ADDR);
    expect(subquery?.mappingSlot).toEqual(bytes32(0));
    expect(subquery?.mappingDepth).toEqual(3);
    expect(subquery?.keys).toEqual([
      bytes32(WETH_ADDR),
      bytes32(WETH_WHALE),
      bytes32(100000)
    ]);
  });
});