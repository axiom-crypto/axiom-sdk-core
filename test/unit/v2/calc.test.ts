import { Axiom, AxiomConfig, QueryV2, buildSolidityNestedMappingSubquery } from "../../../src";
import { calculateCalldataGas } from "../../../src/v2/query/gasCalc";

describe("Calculators", () => {
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
  };
  const axiom = new Axiom(config);

  test("Gas test", () => {
    const gas = calculateCalldataGas("0x123456789000");
    expect(gas).toEqual(84);
  });

  test("Large dataQuery gas test", async () => {
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
    const gas = calculateCalldataGas(builtQuery.dataQuery);
    expect(gas).toEqual(51264);
  });
});
