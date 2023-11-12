# Axiom SDK

Axiom is a ZK coprocessor for Ethereum. Utilizing the properties of Zero Knowledge proofs, Axiom allows anyone to prove historical data on-chain and trustlessly use that data in a smart contract.

# Getting started with v2

Create an `Axiom` instance and a `QueryV2` instance from it (we will use Goerli testnet in this example):

```typescript
const config: AxiomConfig = {
  privateKey: process.env.PRIVATE_KEY_GOERLI as string,
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  version: "v2",
  chainId: 5, // Goerli
  mock: true,
};
const axiom = new Axiom(config);
const query = (axiom.query as QueryV2).new();
```

## Building a Query

There are two ways to build a query. We'll cover both of them here.

```typescript
// Some constants used below
const BLOCK_NUM = 9500000;
const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
```

### Building a Query: Appending method

```typescript
// Appends a subquery where we look for the gas used at block BLOCK_NUM
const headerSubquery = buildHeaderSubquery(BLOCK_NUM)
  .field(HeaderField.GasUsed);
query.appendDataSubquery(headerSubquery);

// Appends a receipt subquery for transaction
// 0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b in which we look at
// log index 4 (Transfer (index_topic_1 address from, index_topic_2 address to, uint256 value))
// and the second topic (indexed address to) of that log event
const txHash = "0x0a126c0e009e19af335e964de0cea513098c9efe290c269dee77ca9f10838e7b";
const swapEventSchema = getEventSchema(
  "Swap(address,uint256,uint256,uint256,uint256,address)"
);
const receiptSubquery = buildReceiptSubquery(txHash)
  .log(4) // event
  .topic(0) // event schema
  .eventSchema(swapEventSchema);
query.appendDataSubquery(receiptSubquery);

// slot 5: mapping(address => mapping(address => mapping(uint24 => address))) public override getPool;
const mappingSubquery = buildSolidityNestedMappingSubquery(BLOCK_NUM)
  .address(UNI_V3_FACTORY_ADDR)
  .mappingSlot(5)
  .keys([
    WETH_ADDR,
    WSOL_ADDR,
    10000,
  ]);
query.appendDataSubquery(mappingSubquery);

const callbackQuery = {
  target: WETH_ADDR,
  extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
};

query.setCallback(callbackQuery);
await query.build();
```

### Building a Query: Passing in objects

```typescript
const dataQuery = [
  {
    blockNumber: BLOCK_NUM,
    fieldIdx: HeaderField.GasLimit,
  },
  {
    blockNumber: BLOCK_NUM + 1,
    fieldIdx: HeaderField.StateRoot,
  },
  {
    blockNumber: BLOCK_NUM,
    addr: WETH_WHALE,
    fieldIdx: AccountField.Nonce,
  },
  {
    txHash: "0x47082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602",
    fieldOrLogIdx: ReceiptField.CumulativeGas,
    topicOrDataOrAddressIdx: 0,
    eventSchema: ethers.ZeroHash,
  },
];

const callbackQuery = {
  target: WETH_ADDR,
  extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
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
const payment = await query.calculateFee();
const queryId = await query.sendOnchainQuery(
  payment,
  (receipt: ethers.ContractTransactionReceipt) => {
    // You can do something here once you've received the transaction receipt
    console.log("receipt", receipt);
  }
);
console.log("queryId", queryId);
```

### Submitting a Query: IPFS

// WIP: will be supported soon

```typescript
// ensure you've already called `await query.build()`
const payment = await query.calculateFee();
const queryId = await query.sendQueryWithIpfs(
  payment,
  (receipt: ethers.ContractTransactionReceipt) => {
    // You can do something here once you've received the transaction receipt
    console.log("receipt", receipt);
  }
);
console.log("queryId", queryId);
```

# Additional examples

There are also numerous up-to-date examples in the `test/unit/v2/` folder. Some slightly older examples exist in the [Examples V2 repo](https://github.com/axiom-crypto/examples-v2).
