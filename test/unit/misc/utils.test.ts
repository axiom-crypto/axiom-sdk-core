import { getEventSchema, getFunctionSelector } from "../../../src/shared/utils";

describe("Utils", () => {
  test("Calculate function selector", () => {
    let selector = getFunctionSelector("transfer", ["address","uint256"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address","uint"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address"," uint256"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("validate", ["address"]);
    expect(selector).toEqual("0x207c64fb");
  });

  test("Calculate event schema", () => {
    let schema = getEventSchema("Transfer", ["address","address","uint256"]);
    expect(schema).toEqual("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
  });
});