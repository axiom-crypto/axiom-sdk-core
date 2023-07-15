export const Constants = Object.freeze({
  MAX_ROWS: 8,

  EIP_2930_BLOCK_NUM: 12244000,
  EIP_1559_BLOCK_NUM: 12965000,
});

export const TxFields: { [txType: number]: any } = {
  0: [
    "nonce",
    "gasPrice",
    "gas",
    "to",
    "value",
    "input",
    "v",
    "r",
    "s"
  ],
  1: [
    "chainId",
    "nonce",
    "gasPrice",
    "gas",
    "to",
    "value",
    "input", // data
    "accessList",
    "v",
    "r",
    "s",
  ],
  2: [
    "chainId",
    "nonce",
    "maxPriorityFeePerGas",
    "maxFeePerGas",
    "gas",
    "to",
    "value",
    "input", // data
    "accessList",
    "v",
    "r",
    "s",
  ],
};