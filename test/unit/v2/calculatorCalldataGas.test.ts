import {
  Axiom,
  AxiomConfig,
  HeaderField,
  QueryV2,
  buildHeaderSubquery,
  buildSolidityNestedMappingSubquery,
} from "../../../src";
import { calculateCalldataGas } from "../../../src/v2/query/gasCalc";

// Test coverage areas:
// - Calldata gas calculator

describe("Calldata Gas Calculator", () => {
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
  };
  const axiom = new Axiom(config);

  test("basic calculator test", () => {
    const gas = calculateCalldataGas("0x123456789000");
    expect(gas).toEqual(84);
  });

  test("large dataQuery gas test", async () => {
    const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
    const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
    const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

    const query = (axiom.query as QueryV2).new();
    for (let i = 0; i < 32; i++) {
      const sq = buildSolidityNestedMappingSubquery(18000000)
        .address(UNI_V3_FACTORY_ADDR)
        .mappingSlot(3)
        .keys([WETH_ADDR, WSOL_ADDR, 10000, 5000]);
      query.appendDataSubquery(sq);
    }
    const builtQuery = await query.build();

    // Calculate calldata gas for just the mapping subqueries
    const gas = calculateCalldataGas(builtQuery.dataQuery);
    expect(gas).toEqual(51264);
  });

  test("hit calldata gas limit", async () => {
    // Retool console.warn to throw an error so that we can test for that error
    console.warn = () => {
      throw new Error("Hit calldata gas warning threshold");
    };
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      query.setOptions({
        dataQueryCalldataGasWarningThreshold: 100,
      });
      const blockNumber = 18200000;
      for (let i = 0; i < 20; i++) {
        const subquery = buildHeaderSubquery(blockNumber + i).field(HeaderField.StateRoot);
        query.appendDataSubquery(subquery);
      }
      await query.build();
    };
    expect(testFn).rejects.toThrow();
  });
});
