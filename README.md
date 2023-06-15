# Axiom SDK

Axiom is a ZK coprocessor for Ethereum. Utilizing the properties of Zero Knowledge proofs, Axiom allows anyone to prove historical data on-chain and use that data in a smart contract.

## Getting started

In order to get started, create a config object and pass it to a new Axiom class instance as follows:

```
const config: AxiomConfig = {
    apiKey: "demo",
    providerUri: <your provider uri (such as from Alchemy, Infura, etc)>,
    version: "1",
}
const ax = new Axiom(config);
```

## Building a query

The Axiom SDK includes a tool for building a query. Create a new query by calling the newQueryBuilder function, which creates a new QueryBuilder object:

```
const qb = ax.newQueryBuilder();
```

Append queries with a blockNumber (required), address (optional), and slot number (optional). The maximum number queries that can be appended to a QueryBuilder object is currently fixed at 64. If you need more queries, split the request up into multiple QueryBuilder objects.

See the appendix section below for more information on how to figure out what variable goes in what slot.

```
await qb.append({blockNumber: 17090300, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 0});
await qb.append({blockNumber: 17090217, address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", slot: 1});
await qb.append({blockNumber: 17090220, address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", slot: 5});
```

Call the QueryBuilder's build function to generate the queryResponse and query calldata for the Axiom contract function:

```
const {queryResponse, query} = await qb.build();
```

## Submitting a query

You can submit a query to the on-chain Axiom contract by calling the sendQuery function on the contract after providing a signer:

```
const provider = new ethers.JsonRpcProvider(<your provider uri (such as from Alchemy, Infura, etc)>);
const wallet = new ethers.Wallet(<the private key for the address>, provider);
const axiomContract = new ethers.Contract(<AxiomV1 contract address>, getAbiForVersion("v1"), wallet);

const txResult = await axiomContract.sendQuery(queryResponse, <address to send refund in case the transaction doesn't work>, query, {value: ethers.parseEther("0.1")});
const txReceipt = await txResult.wait();
```

## Using the result of the call

After the contract has processed the sendQuery call, it will emit an event that the Prover will use to generate a ZK proof of the data in the query. Once the Prover is done generating the ZK proof, it will write that the queryResponse for that Query has been fulfilled, and an event will be emitted letting the user know that their data is ready to be used.

## Commands

Build SDK with the command:

```bash
pnpm build
```

## Appendix

### How Ethereum stores data

Description here.
