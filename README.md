# Axiom SDK

Axiom is a ZK coprocessor for Ethereum. Utilizing the properties of Zero Knowledge proofs, Axiom allows anyone to prove historical data on-chain and trustlessly use that data in a smart contract.

# Getting started

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

# Reading query results

We provide the `areResponsesValid` view function in AxiomV1Query to help allow users to read block, account, and storage data from verified query results.  This function has the following signature:

```typescript
function areResponsesValid(
    bytes32 keccakBlockResponse,
    bytes32 keccakAccountResponse,
    bytes32 keccakStorageResponse,
    BlockResponse[] calldata blockResponses,
    AccountResponse[] calldata accountResponses,
    StorageResponse[] calldata storageResponses
) external view returns (bool);
```

To verify data about historic blocks, accounts, or storage, first pass in the `queryHash` (not the `keccakQueryResponse`; `queryHash` is also found as an output of the QueryBuilder `build` function) from the Axiom SDK to generate the `keccakBlockResponse`, `keccakAccountResponse`, and `keccakStorageResponse` which encode the verified query result on-chain:

```typescript
import { Axiom, AxiomConfig } from "@axiom-crypto/core";

const config: AxiomConfig = {
    providerUri: <your provider uri (such as from Alchemy, Infura, etc)>,
    version: "v1",
}
const ax = new Axiom(config);
const responseTree = await ax.query.getResponseTreeForQuery(<keccakQueryResponse>);
const keccakBlockResponse = responseTree.blockTree.getHexRoot();
const keccakAccountResponse = responseTree.accountTree.getHexRoot();
const keccakStorageResponse = responseTree.storageTree.getHexRoot();
```

Then, generate responses for data in historic block headers, accounts, and storage slots by creating `BlockResponse`, `AccountResponse`, and `StorageResponse` objects using `getValidationWitness`:

```typescript
const blockResponse: SolidityBlockResponse = ax.query.getValidationWitness(
    responseTree, <blockNumber>
);
const accountResponse: SolidityAccountResponse = ax.query.getValidationWitness(
    responseTree, <blockNumber>, <address>
);
const storageResponse: SolidityStorageResponse = ax.query.getValidationWitness(
    responseTree, <blockNumber>, <address>, <storage slot>
);
```

After passing these into `getValidationWitness` and verifying on-chain, read off the data you'd like to use from each object: 

- `BlockResponse` -- the `blockNumber` and `blockHash`
- `AccountResponse` -- the `blockNumber`, `addr`, `nonce`, `balance`, `storageRoot`, and `codeHash`
- `StorageResponse` -- the `blockNumber`, `addr`, `slot`, and `value` 

## Advanced reads

For more advanced users, we offer access to the raw Merkle-ized query results via `isKeccakResultValid` and `isPoseidonResultValid`.  These allow validation of Keccak and Poseidon encoded block, account, and storage data in the [Axiom Query Format](https://docs-alpha.axiom.xyz/developers/sending-a-query/axiom-query-format). The Poseidon format may be especially useful for ZK developers.

```solidity
function isKeccakResultValid(
    bytes32 keccakBlockResponse, 
    bytes32 keccakAccountResponse, 
    bytes32 keccakStorageResponse
) external view returns (bool);

function isPoseidonResultValid(
    bytes32 poseidonBlockResponse, 
    bytes32 poseidonAccountResponse, 
    bytes32 poseidonStorageResponse
) external view returns (bool);
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