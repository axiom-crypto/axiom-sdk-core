import { ethers } from "ethers";
import { Axiom, AxiomConfig, HeaderField, QueryV2, buildHeaderSubquery } from "../../../src";
import { ConstantsV2 } from "../../../src/v2/constants";

// Test coverage areas:
// - QueryBuilderV2 options
//
// NOTE: dataQueryCalldataGasWarningThreshold is tested in `calculatorCalldataGas.test.ts`

describe("QueryBuilderV2 Options", () => {
  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI as string,
    privateKey: process.env.PRIVATE_KEY as string,
    chainId: 1,
    version: "v2",
  };
  const axiom = new Axiom(config);

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    new ethers.JsonRpcProvider(process.env.PROVIDER_URI as string),
  );
  const blockNumber = 18300000;

  test("set targetChainId", async () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery = buildHeaderSubquery(blockNumber).field(HeaderField.Timestamp);
    query.appendDataSubquery(headerSubquery);
    query.setOptions({
      targetChainId: "31337",
    });
    const builtQuery = await query.build();
    expect(builtQuery.targetChainId).toEqual("31337");
    expect(builtQuery.maxFeePerGas).toEqual(ConstantsV2.DefaultMaxFeePerGasWei);
    expect(builtQuery.callbackGasLimit).toEqual(ConstantsV2.DefaultCallbackGasLimitGwei);
    expect(builtQuery.refundee).toEqual(await wallet.getAddress());
  });

  test("set maxFeePerGas", async () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery = buildHeaderSubquery(blockNumber).field(HeaderField.Timestamp);
    query.appendDataSubquery(headerSubquery);
    query.setOptions({
      maxFeePerGas: "1000000000000",
    });
    const builtQuery = await query.build();
    expect(builtQuery.targetChainId).toEqual("1");
    expect(builtQuery.maxFeePerGas).toEqual("1000000000000");
    expect(builtQuery.callbackGasLimit).toEqual(ConstantsV2.DefaultCallbackGasLimitGwei);
    expect(builtQuery.refundee).toEqual(await wallet.getAddress());
  });

  test("set callbackGasLimit", async () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery = buildHeaderSubquery(blockNumber).field(HeaderField.Timestamp);
    query.appendDataSubquery(headerSubquery);
    query.setOptions({
      callbackGasLimit: 10000,
    });
    const builtQuery = await query.build();
    expect(builtQuery.targetChainId).toEqual("1");
    expect(builtQuery.maxFeePerGas).toEqual(ConstantsV2.DefaultMaxFeePerGasWei);
    expect(builtQuery.callbackGasLimit).toEqual(10000);
    expect(builtQuery.refundee).toEqual(await wallet.getAddress());
  });

  test("set refundee", async () => {
    const query = (axiom.query as QueryV2).new();
    const headerSubquery = buildHeaderSubquery(blockNumber).field(HeaderField.Timestamp);
    query.appendDataSubquery(headerSubquery);
    query.setOptions({
      refundee: "0xe76a90E3069c9d86e666DcC687e76fcecf4429cF",
    });
    const builtQuery = await query.build();
    expect(builtQuery.targetChainId).toEqual("1");
    expect(builtQuery.maxFeePerGas).toEqual(ConstantsV2.DefaultMaxFeePerGasWei);
    expect(builtQuery.callbackGasLimit).toEqual(ConstantsV2.DefaultCallbackGasLimitGwei);
    expect(builtQuery.refundee).toEqual("0xe76a90E3069c9d86e666DcC687e76fcecf4429cF");
  });
});
