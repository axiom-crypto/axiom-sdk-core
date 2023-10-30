import { buildStorageSubquery } from "../../../dist";
import {
  AccountField,
  Axiom,
  AxiomConfig,
  HeaderField,
  QueryV2,
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

  test("Append 31 Header subqueries", () => {
    const blockNumber = 18000000;
    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 31; i++) {
      const subquery = buildHeaderSubquery(blockNumber + i).field(HeaderField.Nonce);
      query.appendDataSubquery(subquery);
    }
  });

  test("Append 32 Header subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 32; i++) {
        const subquery = buildHeaderSubquery(blockNumber + i).field(HeaderField.Nonce);
        query.appendDataSubquery(subquery);
      }
    };
    expect(testFn).toThrow();
  });

  test("Append 8 Account subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const dataQueryReq = [
        {
          blockNumber: blockNumber,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 1,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 2,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 3,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 4,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 5,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 6,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 7,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
      ];
      const query = (axiom.query as QueryV2).new(dataQueryReq);
    };
    expect(testFn).toThrow();
  });

  test("Append 8 Storage subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 8; i++) {
        const subquery = buildStorageSubquery(blockNumber + i)
          .address(WETH_ADDR)
          .slot(0);
        query.appendDataSubquery(subquery);
      }
    };
    expect(testFn).toThrow();
  });

  test("Append 3 Account + 3 Storage + 3 Nested Mapping subqueries", () => {
    const testFn = () => {
      const blockNumber = 18000000;
      const dataQueryReq = [
        {
          blockNumber: blockNumber,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 1,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber + 2,
          addr: WETH_WHALE,
          fieldIdx: AccountField.Nonce,
        },
        {
          blockNumber: blockNumber,
          addr: WETH_ADDR,
          slot: 0,
        },
        {
          blockNumber: blockNumber,
          addr: WETH_ADDR,
          slot: 1,
        },
        {
          blockNumber: blockNumber,
          addr: WETH_ADDR,
          slot: 2,
        },
      ];
      const query = (axiom.query as QueryV2).new(dataQueryReq);
      const mapping0 = buildSolidityNestedMappingSubquery(blockNumber)
        .address(UNI_V3_FACTORY_ADDR)
        .mappingSlot(5)
        .keys([WETH_ADDR, WSOL_ADDR, 10000]);
      query.appendDataSubquery(mapping0);
      const mapping1 = buildSolidityNestedMappingSubquery(blockNumber + 1)
        .address(UNI_V3_FACTORY_ADDR)
        .mappingSlot(5)
        .keys([WETH_ADDR, WSOL_ADDR, 10000]);
      query.appendDataSubquery(mapping1);
      const mapping2 = buildSolidityNestedMappingSubquery(blockNumber + 2)
        .address(UNI_V3_FACTORY_ADDR)
        .mappingSlot(5)
        .keys([WETH_ADDR, WSOL_ADDR, 10000]);
      query.appendDataSubquery(mapping2);
    };
    expect(testFn).toThrow();
  });
});
