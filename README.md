# Axiom SDK

This is the beginning of a new SDK for smart contract development using Axiom.

Currently provides helper functions for generating calldata for Axiom function calls.

This version is **PRIVATE** as it uses our Hasura GraphQL database. We can migrate this to public by setting up JWT tokens for user signup/authentication for the database.

We choose to use Typescript for this SDK since it is what developers will need to integrate with their apps and front ends.

## Commands

Build SDK with the command:

```bash
pnpm build
```

## Scripts

Inputs (aside from ZK proof calldata) for `IAxiomV1Verifier.updateHistorical` can be generated with

```bash
pnpm ts-node scripts/console.ts historical <startBlockNumber>
```

Inputs for `IAxiomV1Verifier.mmrVerifyBlockHash` can be generated with

```bash
pnpm ts-node scripts/console.ts mmrProof <blockNumber> <numBlocksInMMR>
```