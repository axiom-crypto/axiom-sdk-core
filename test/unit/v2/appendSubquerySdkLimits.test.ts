import { buildStorageSubquery } from "../../../dist";
import {
  AccountField,
  Axiom,
  AxiomConfig,
  HeaderField,
  QueryV2,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildSolidityNestedMappingSubquery,
} from "../../../src";

describe("Append subquery: SDK-enforced limits", () => {
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
  const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
  const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY as string,
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
  };
  const axiom = new Axiom(config);

  test("Append 32 Header subqueries", () => {
    const blockNumber = 18000000;
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 32; i++) {
      const subquery = buildHeaderSubquery(blockNumber + i).field(HeaderField.Nonce);
      query.appendDataSubquery(subquery);
    }
  });

  test("Append 33 Header subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 33; i++) {
        const subquery = buildHeaderSubquery(blockNumber + i).field(HeaderField.Nonce);
        query.appendDataSubquery(subquery);
      }
    };
    expect(testFn).toThrow();
  });

  test("Append 33 Account subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 33; i++) {
        const subquery = buildAccountSubquery(blockNumber + i)
          .address(WETH_WHALE)
          .field(AccountField.Balance);
        query.appendDataSubquery(subquery);
      }
    };
    expect(testFn).toThrow();
  });

  test("Append 33 Storage subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 33; i++) {
        const subquery = buildStorageSubquery(blockNumber + i)
          .address(WETH_ADDR)
          .slot(0);
        query.appendDataSubquery(subquery);
      }
    };
    expect(testFn).toThrow();
  });

  test("Append 11 Account + 11 Storage + 10 Nested Mapping subqueries", () => {
    const blockNumber = 18000000;
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 11; i++) {
      const accountSubquery = buildAccountSubquery(blockNumber + i)
        .address(WETH_WHALE)
        .field(AccountField.Balance);
      query.appendDataSubquery(accountSubquery);
      const account = buildStorageSubquery(blockNumber + i)
        .address(WETH_ADDR)
        .slot(0);
      query.appendDataSubquery(account);
      if (i === 10) {
        continue;
      }
      const mapping = buildSolidityNestedMappingSubquery(blockNumber + i)
        .address(UNI_V3_FACTORY_ADDR)
        .mappingSlot(5)
        .keys([WETH_ADDR, WSOL_ADDR, 10000]);
      query.appendDataSubquery(mapping);
    }
  });

  test("Append 11 Account + 11 Storage + 11 Nested Mapping subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 11; i++) {
        const accountSubquery = buildAccountSubquery(blockNumber + i)
          .address(WETH_WHALE)
          .field(AccountField.Balance);
        query.appendDataSubquery(accountSubquery);
        const account = buildStorageSubquery(blockNumber + i)
          .address(WETH_ADDR)
          .slot(0);
        query.appendDataSubquery(account);
        const mapping = buildSolidityNestedMappingSubquery(blockNumber + i)
          .address(UNI_V3_FACTORY_ADDR)
          .mappingSlot(5)
          .keys([WETH_ADDR, WSOL_ADDR, 10000]);
        query.appendDataSubquery(mapping);
      }
    };
    expect(testFn).toThrow();
  });
});
