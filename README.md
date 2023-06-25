# Axiom SDK

Axiom is a ZK coprocessor for Ethereum. Utilizing the properties of Zero Knowledge proofs, Axiom allows anyone to prove historical data on-chain and use that data in a smart contract.

## Getting started

In order to get started, create a config object and pass it to a new Axiom class instance as follows:

```typescript
const config: AxiomConfig = {
    providerUri: <your provider uri (such as from Alchemy, Infura, etc)>,
    version: "v1",
    chainId: 1, // optional; defaults to 1 (Ethereum Mainnet)
}
const ax = new Axiom(config);
```

## Building a query

The Axiom SDK includes a tool for building a query. Create a new query by calling the `newQueryBuilder` function, which creates a new QueryBuilder object:

```typescript
const qb = ax.newQueryBuilder();
```

Append queries to the instance of QueryBuilder with a `blockNumber` (required), `address` (optional), and `slot` number (optional). The maximum number queries that can be appended to a QueryBuilder object is currently fixed at 64. If you need more queries, split the request up into multiple QueryBuilder objects.

For more information on slots, please see our documentation on [finding storage slots](https://docs-alpha.axiom.xyz/developers/sending-a-query/finding-storage-slots).

```typescript
const UNI_V2_ADDR = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
await qb.append({blockNumber: 17090300, address: null, slot: null});
await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 0});
await qb.append({blockNumber: 17090217, address: UNI_V2_ADDR, slot: 1});
```

The `append` function will validate the value at the slot. If you attempt to read from a slot at an account that has not yet been created, an error will be thrown.

Call the QueryBuilder's `build` function to generate the `keccakQueryResponse`, `queryHash`, and `query` calldata for the Axiom contract function:

```typescript
const { keccakQueryResponse, queryHash, query } = await qb.build();
```

## Submitting a query

You can submit a query to the on-chain Axiom contract by calling the `sendQuery` function on the contract after providing a signer:

```typescript
const providerUri = your provider URI (such as from Alchemy, Infura, etc)>;
const provider = new ethers.JsonRpcProvider(providerUri);
const wallet = new ethers.Wallet(<private key>, provider);
const axiomContract = new ethers.Contract(
    ax.getAxiomContractAddress(), 
    ax.getAxiomQueryAbi(), 
    wallet
);

const txResult = await axiomContract.sendQuery(
    keccakQueryResponse,
    <refund adddress>,
    query,
    {
        value: ethers.parseEther("0.05"),
    }
);
const txReceipt = await txResult.wait();
```

Note that if you submit a Query with the exact same appended queries as a previous transaction, it will fail due to the `keccakQueryResponse` hashing to the same value as before. Additionally, please ensure that the `providerUri` that you provide matches with the `chainId` value passed in at the top in the `config` object (so if `chainId` is 5, then provide a `providerUri` for Goerli).

## Using the result of the call

After the contract has processed the `sendQuery` call, it will emit an event that the Prover will use to generate a ZK proof of the data in the query. Once the Prover is done generating the ZK proof, it will write that the `keccakQueryResponse` for that Query has been fulfilled, and a the following event will be emitted, letting you know that your data is ready to be used:

```solidity
event QueryFulfilled(bytes32 keccakQueryResponse, uint256 payment, address prover);
```

# Troubleshooting

## Submitting the same `keccakQueryResponse`

Each `keccakQueryResponse` submitted to AxiomQuery must be unique, therefore if you have already called `sendQuery` with one `keccakQueryResponse`, the transaction will fail if you try to submit the same `keccakQueryResponse` after the first. This means that your calls to the QueryBuilder `append` function must differ in at least one field by the time `build` is called.

## Provider URIs

Ensure that the `providerUri` you are using matches the `chainId`. For example, on Ethereum Mainnet (`chainId` 1), Alchemy's `providerUri` looks like:

```
https://eth-mainnet.g.alchemy.com/v2/UBGccHgGCaE...
```

Whereas on Goerli (`chainId` 5), it looks like this:

```
https://eth-goerli.g.alchemy.com/v2/UBGccHgGCaE...
```