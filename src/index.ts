const {
  AbiCoder,
  ethers,
  keccak256,
  solidityPackedKeccak256,
} = require("ethers");
const { gql, GraphQLClient } = require("graphql-request");

const client = new GraphQLClient(
  "https://axiom-database-1.hasura.app/v1/graphql",
  {
    headers: {
      authorization: `Bearer ${process.env.HASURA_JWT_TOKEN}`,
    },
  }
);

const abiCoder = AbiCoder.defaultAbiCoder();

const QUERY_BLOCKHASH = gql`
  query QueryBlockHashes($start: Int!, $stop: Int!) {
    demo_chaindata(
      order_by: { block_number: asc }
      where: { block_number: { _gte: $start, _lt: $stop } }
    ) {
      block_hash
    }
  }
`;

const QUERY_ROOT_CACHE = gql`
  query QueryRootCache($start: Int!) {
    demo_axiom_update_events(
      limit: 1
      where: { startBlockNumber: { _eq: $start } }
      order_by: { updateBlockNumber: desc }
    ) {
      prevHash
      root
      numFinal
    }
  }
`;

async function getMerkleProof(blockNumber: number, numFinal: number) {
  const startBlockNumber = blockNumber - (blockNumber % 1024);
  const result = await client.request(QUERY_BLOCKHASH, {
    start: startBlockNumber,
    stop: startBlockNumber + numFinal,
  });
  if (result.demo_chaindata.length !== numFinal)
    throw new Error("Query for block hashes failed");

  const blockHashes: string[] = Array(1024);
  for (let i = 0; i < 1024; i += 1) {
    blockHashes[i] =
      i < numFinal ? result.demo_chaindata[i].block_hash : ethers.ZeroHash;
  }

  const hashes: string[][] = [[], [], [], [], [], [], [], [], [], []];
  for (let i = 0; i < 10; i += 1) {
    const hashList: string[] = [];
    for (let j = 0; j < 2 ** (9 - i); j += 1) {
      if (i === 0) {
        const hash = solidityPackedKeccak256(
          ["bytes32", "bytes32"],
          [blockHashes[2 * j], blockHashes[2 * j + 1]]
        );
        hashList.push(hash);
      } else {
        const hash = solidityPackedKeccak256(
          ["bytes32", "bytes32"],
          [hashes[i - 1]![2 * j], hashes[i - 1]![2 * j + 1]]
        );
        hashList.push(hash);
      }
    }
    hashes[i] = hashList;
  }

  let side = blockNumber % 1024;
  let merkleProof: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    if (i === 0) {
      /* eslint no-bitwise: ["error", { "allow": ["^"] }] */
      merkleProof.push(blockHashes[side ^ 1]!);
    } else {
      /* eslint no-bitwise: ["error", { "allow": ["^"] }] */
      merkleProof.push(hashes[i - 1]![side ^ 1]!);
    }
    side = side >> 1;
  }
  return {
    merkleProof,
    root: hashes[9]![0]!,
    blockHash: blockHashes[blockNumber % 1024]!,
  };
}

// gets `roots` and `endHashProofs` input param for IAxiomV1.updateHistorical
async function getHistoricalProofs(startBlockNumber: number) {
  startBlockNumber = startBlockNumber - (startBlockNumber % 1024);
  const proofPromises = Array(128)
    .fill(0)
    .map((_, i) => getMerkleProof(startBlockNumber + i * 1024 + 1023, 1024));
  const proofs = await Promise.all(proofPromises);
  const endHashProofs = proofs.slice(0, 127).map((proof) => {
    let endHashProof = proof.merkleProof.reverse();
    endHashProof.push(proof.blockHash);
    return endHashProof;
  });
  const roots = proofs.map((proof) => proof.root);
  return {
    roots,
    endHashProofs,
  };
}

async function main() {
  let { roots, endHashProofs } = await getHistoricalProofs(0);
  let res = abiCoder.encode(
    ["bytes32[128]", "bytes32[11][127]"],
    [roots, endHashProofs]
  );
  process.stdout.write(res);
}

main().catch(console.error);
