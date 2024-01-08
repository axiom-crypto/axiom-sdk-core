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
// - Circuit Tx Subquery limits

describe("Circuit Tx Subquery Limits", () => {
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

  test(`AxiomV2CircuitConstant.TxChipConfig.MaxDataByteLen: ${AxiomV2CircuitConstant.TxChipConfig.MaxDataByteLen}`, async () => {
    const largeTxHash = "0x4d3c80374db9b47ce3c45271ecc12b291daac9bf63f9f55454d1b808ca023cfb";

    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const subquery = buildTxSubquery(largeTxHash).field(TxField.To);
      query.appendDataSubquery(subquery);
      await query.validate();
    };
    await expect(testFn()).rejects.toThrow();
  });

  test(`AxiomV2CircuitConstant.TxChipConfig.MaxAccessListLen: ${AxiomV2CircuitConstant.TxChipConfig.MaxAccessListLen}`, async () => {
    const largeAclHash = "0xfc970ffc82255f6bd6c1ca320beb28511ada9e63da36fe2df5217938672b2479";

    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      const subquery = buildTxSubquery(largeAclHash).field(TxField.To);
      query.appendDataSubquery(subquery);
      await query.validate();
    };
    await expect(testFn()).rejects.toThrow();
  });
});
