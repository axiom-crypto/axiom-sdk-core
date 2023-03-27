# Axiom SDK

This is the beginning of a new SDK for smart contract development using Axiom.

Currently provides helper functions for generating calldata for Axiom function calls.

This version is **PRIVATE** as it uses our Hasura GraphQL database. We can migrate this to public by setting up JWT tokens for user signup/authentication for the database.

We choose to use Typescript for this SDK over Python and Rust. Typescript over Python because ethers-js is more mature than web3.py. Typescript over Rust because Rust GraphQL clients have a lot of overhead and the libraries are not as mature. Moreover more developers will be familiar with Typescript.

## Commands

Inputs (aside from ZK proof calldata) for `IAxiomV1Verifier.updateHistorical` can be generated with

```bash
npx ts-node sdk/src/index.ts historical <startBlockNumber>
```

For example, see [`updateHistorical_0.dat`](../test/data/updateHistorical_0.dat)

Inputs for `IAxiomV1Verifier.mmrVerifyBlockHash` can be generated with

```bash
npx ts-node sdk/src/index.ts mmrProof <blockNumber> <numBlocksInMMR>
```

For example, see [`mmrProof_58130_131072.dat`](../test/data/mmrProof_58130_131072.dat) where `2**17 = 131072`.
