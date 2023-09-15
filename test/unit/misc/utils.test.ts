import { getEventSchema, getFunctionSelector, getFunctionSignature } from "../../../src/shared/utils";

describe("Utils", () => {
  test("Get a function signature", () => {
    let signature = getFunctionSignature("transfer(address,uint256)");
    expect(signature).toEqual("transfer(address,uint256)");
    signature = getFunctionSignature("transfer(address to, uint256 amt)");
    expect(signature).toEqual("transfer(address,uint256)");
    signature = getFunctionSignature("transfer (address to, uint256 amt) public");
    expect(signature).toEqual("transfer(address,uint256)");
    signature = getFunctionSignature("transfer (address payable to, bytes32 aHash, uint gas)");
    expect(signature).toEqual("transfer(address,bytes32,uint256)");
  });

  test("Calculate function selector", () => {
    let selector = getFunctionSelector("transfer", ["address","uint256"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address","uint"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address"," uint256"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("validate", ["address"]);
    expect(selector).toEqual("0x207c64fb");
    selector = getFunctionSelector("validate(address)");
    expect(selector).toEqual("0x207c64fb");
    selector = getFunctionSelector("transfer(address,uint256)");
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer(address,uint)");
    expect(selector).toEqual("0xa9059cbb");
  });

  test("Calculate event schema", () => {
    let schema = getEventSchema("Transfer", ["address","address","uint256"]);
    expect(schema).toEqual("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
    schema = getEventSchema("Transfer(address,address,uint256)");
    expect(schema).toEqual("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
  });
});