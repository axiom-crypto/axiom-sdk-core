import { getFunctionSelector } from "../../../src/shared/utils";

describe("Utils", () => {
  test("Calculate function selector", () => {
    let selector = getFunctionSelector("transfer", ["address","uint256"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address","uint"]);
    expect(selector).toEqual("0xa9059cbb");
    selector = getFunctionSelector("transfer", ["address"," uint256"]);
    expect(selector).toEqual("0xa9059cbb");
  });
});