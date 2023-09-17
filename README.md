# Axiom SDK

Axiom is a ZK coprocessor for Ethereum. Utilizing the properties of Zero Knowledge proofs, Axiom allows anyone to prove historical data on-chain and trustlessly use that data in a smart contract.

# Getting started with v2

Create an `Axiom` instance and a `QueryV2` instance from it:

```typescript
const config: AxiomConfig = {
  privateKey: process.env.PRIVATE_KEY_GOERLI as string,
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  version: "v2",
  chainId: 5,
};
const overrides = {
  Addresses: {
    AxiomQuery: "AxiomV2Query override address",
  },
};
const axiom = new Axiom(config, overrides); // `overrides` is optional
const query = (axiom.query as QueryV2).new();
```

## Building a Query

There are two ways to build a query. We'll cover both of them here.

```typescript
// Some constants used below
const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
```

### Building a Query: Appending method

```typescript
// Appends a subquery where we look for the gas used at block 17000000
const headerSubquery = buildHeaderSubquery(17000000)
  .field(HeaderField.GasUsed);
query.appendHeaderSubquery(headerSubquery);

// Appends a receipt subquery for transaction 
// 0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6 in which we look at 
// log index 0 (Transfer (index_topic_1 address from, index_topic_2 address to, uint256 value))
// and the first topic (address from) of that log event
const receiptSubquery = buildReceiptSubquery("0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6")
  .log(0)
  .eventSchema("Transfer(address,address,uint256)")
  .topic(1);
query.appendReceiptSubquery(receiptSubquery);

// slot 5: mapping(address => mapping(address => mapping(uint24 => address))) public override getPool;
const mappingSubquery = buildSolidityNestedMappingSubquery(17000000)
  .address(UNI_V3_FACTORY_ADDR)
  .mappingSlot(5)
  .keys([
    WETH_ADDR,
    WSOL_ADDR,
    10000,
  ]);
query.appendSolidityNestedMappingSubquery(mappingSubquery);

const callbackQuery = {
  callbackAddr: WETH_ADDR,
  callbackFunctionSelector: getFunctionSelector("balanceOf(address)"),
  resultLen: 3,
  callbackExtraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
};

query.setCallback(callbackQuery);
await query.build();
```

### Building a Query: Passing in objects

```typescript
const dataQuery = {
  headerSubqueries: [
    {
      blockNumber: BLOCK_NUMBER,
      fieldIdx: getHeaderFieldIdx(HeaderField.Nonce),
    },
    {
      blockNumber: BLOCK_NUMBER + 3,
      fieldIdx: getHeaderFieldIdx(HeaderField.Miner),
    },
  ],
  receiptSubqueries: [
    {
      txHash:
        "0x47082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602",
      fieldOrLogIdx: getReceiptFieldIdx(ReceiptField.Status),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    },
  ],
  solidityNestedMappingSubqueries: [
    {
      blockNumber: 17000000,
      addr: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      mappingSlot: "5",
      mappingDepth: 3,
      keys: [
        bytes32("0x0000000000085d4780b73119b644ae5ecd22b376"),
        bytes32("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
        bytes32(3000),
      ],
    },
  ],
};

const callbackQuery = {
  callbackAddr: WETH_ADDR,
  callbackFunctionSelector: getFunctionSelector("balanceOf(address)"]),
  resultLen: 3,
  callbackExtraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
};

const query = (axiom.query as QueryV2).new(
  dataQuery,
  undefined,  // no computeQuery
  callbackQuery,
);
```

## Validating a Query

Validation will write to `console.error` for any errors detected in each of the fields (it will not throw an error or return early) and will return `false` if there is any error detected in any of the `Query` fields.

```typescript
const isValid = await query.validate();
if (!isValid) {
  throw new Error("Query validation failed.");
}
```

## Submitting a Query

Once a `Query` has been built, it can be submitted via two methods: On-chain or via IPFS.

### Submitting a Query: On-chain

```typescript
// ensure you've already called `await query.build()`
const payment = query.calculateFee();
await query.sendOnchainQuery(
  payment,
  (receipt: ethers.TransactionReceipt) => {
    // do something here
    console.log("receipt", receipt);
  }
);
```

### Submitting a Query: IPFS

```typescript
// ensure you've already called `await query.build()`
const payment = query.calculateFee();
await query.sendQueryWithIpfs(
  payment,
  (receipt: ethers.TransactionReceipt) => {
    // do something here
    console.log("receipt", receipt);
  }
);
```

# Additional examples

There are also numerous up-to-date examples in the `test/unit/v2/` folder. Some slightly older examples exist in the [Examples V2 repo](https://github.com/axiom-crypto/examples-v2). 