# Axiom SDK Integration Tests

The following env vars are required:

```
PROVIDER_URI_GOERLI

```

Tests will run with real proofs by default via the following command:

```
pnpm test:integration
```

You can run the tests with mock proofs via:

```
pnpm test:integration:mock
```