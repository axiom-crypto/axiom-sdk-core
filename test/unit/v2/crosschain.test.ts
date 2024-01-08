import { 
  AxiomCore,
  AxiomCoreConfig,
  AxiomV2Callback,
  HeaderField,
  QueryV2,
  bytes32,
} from "../../../src";

// Test coverage areas:
// - Crosschain

describe("Crosschain", () => {
  const callback: AxiomV2Callback = {
    target: "0x41a7a901ef58d383801272d2408276d96973550d",
    extraData: bytes32("0xbbd0d3671093a36d6e3b608a7e3b1fdc96da1116"),
  };

  test("Build a query with a different target chain", async () => {
    const config: AxiomCoreConfig = {
      providerUri: process.env.PROVIDER_URI as string,
      targetChainId: 5,
      targetProviderUri: process.env.PROVIDER_URI_GOERLI as string,
      version: "v2",
    };
    const axiom = new AxiomCore(config);
    const blockNumber = 18200000;
    const dataQueryReq = [
      {
        blockNumber: blockNumber,
        fieldIdx: HeaderField.GasUsed,
      },
      {
        blockNumber: blockNumber + 100,
        fieldIdx: HeaderField.GasUsed,
      },
    ];
    const query = (axiom.query as QueryV2).new();
    query.append(dataQueryReq);
    query.setCallback(callback);

    await query.build();
    const builtQuery = query.getBuiltQuery();
    if (!builtQuery) {
      throw new Error("Query is not built");
    }

    expect(builtQuery.sourceChainId).toEqual("1");
    expect(builtQuery.targetChainId).toEqual("5");
    expect(builtQuery.queryHash).toEqual("0xda1933a884934070a870d18243ec2f1a7efa869966c4cf52d03b179c998a4825");
    expect(builtQuery.dataQueryHash).toEqual("0xfaaac492509be62a2026a769d31140ee49e4b662e56c95251b8ca6ccace0e91b");
    expect(builtQuery.dataQuery).toEqual("0x0000000000000001000200010115b5c00000000a00010115b6240000000a");
    expect(builtQuery.computeQuery.k).toEqual(0);
    expect(builtQuery.computeQuery.vkey.length).toEqual(0);
    expect(builtQuery.computeQuery.vkey).toEqual([]);
    expect(builtQuery.computeQuery.computeProof).toEqual("0x00");
  });
});