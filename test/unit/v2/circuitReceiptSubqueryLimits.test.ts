import { AxiomV2CircuitConstant } from "@axiom-crypto/tools";
import {
  AccountField,
  AxiomCore,
  AxiomCoreConfig,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  HeaderField,
  QueryV2,
  ReceiptField,
  TxField,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildSolidityNestedMappingSubquery,
  buildStorageSubquery,
  buildTxSubquery,
  bytes32,
} from "../../../src";

// Test coverage areas:
// - Circuit Receipt Subquery limits

describe("Circuit Receipt Subquery Limits", () => {
  const config: AxiomCoreConfig = {
    privateKey: process.env.PRIVATE_KEY as string,
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
  };
  const axiom = new AxiomCore(config);

  // Modify console.error to throw so it can be caught by Jest
  console.error = () => {
    throw new Error();
  };

  test(`AxiomV2CircuitConstant.ReceiptChipConfig.MaxDataByteLen: ${AxiomV2CircuitConstant.ReceiptChipConfig.MaxDataByteLen}`, async () => {
    const largeLogNumRcHash = "0x802be4a5b8a6a25c98ecc0f0a1fd8a6903bac56971246761ce6d0dc1cb104481";

    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const subquery = buildReceiptSubquery(largeLogNumRcHash)
        .log(0)
        .topic(1)
        .eventSchema("Transfer (address from, address to, uint256 value)");
      query.appendDataSubquery(subquery);
      await query.validate();
    };
    await expect(testFn()).rejects.toThrow();
  });

  test(`AxiomV2CircuitConstant.ReceiptChipConfig.MaxLogNum: ${AxiomV2CircuitConstant.ReceiptChipConfig.MaxLogNum}`, async () => {
    const largeLogDataRcHash = "0xffc93d51ca81e588c7ece5dc17159740f16917064b4588d70a1843b6b2f858a6";

    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const subquery = buildReceiptSubquery(largeLogDataRcHash)
        .log(0)
        .topic(1)
        .eventSchema("Transfer (address from, address to, uint256 value)");
      query.appendDataSubquery(subquery);
      await query.validate();
    };
    await expect(testFn()).rejects.toThrow();
  });
});
