import { assert } from "console";

import { ethers, solidityPackedKeccak256 } from "ethers";
const { gql, GraphQLClient } = require("graphql-request");

const client = new GraphQLClient(
  "https://axiom-database-1.hasura.app/v1/graphql",
  {
    headers: {
      authorization: `Bearer ${process.env.HASURA_JWT_TOKEN}`,
    },
  }
);


export function buildMerkleTree(leaves: string[], depth: number) {
  const tree: string[][] = [];
  tree.push(leaves);
  for (let i = 0; i < depth; i += 1) {
    const level: string[] = [];
    for (let j = 0; j < 2 ** (depth - 1 - i); j += 1) {
      const hash = solidityPackedKeccak256(
        ["bytes32", "bytes32"],
        [
          tree[i]![2 * j] || ethers.ZeroHash,
          tree[i]![2 * j + 1] || ethers.ZeroHash,
        ]
      );
      level.push(hash);
    }
    tree.push(level);
  }
  return tree;
}

export function getMerkleProof(tree: string[][], leafId: number) {
  let side = leafId;
  let merkleProof: string[] = [];
  for (let i = 0; i < tree.length - 1; i += 1) {
    /* eslint no-bitwise: ["error", { "allow": ["^"] }] */
    merkleProof.push(tree[i]![side ^ 1]!);
    side = side >> 1;
  }
  return merkleProof;
}

export async function queryBlockHashRange(
  startBlockNumber: number,
  stopBlockNumber: number
): Promise<string[]> {
  const query = gql`
    query QueryBlockHashes($start: Int!, $stop: Int!) {
      demo_chaindata(
        order_by: { block_number: asc }
        where: { block_number: { _gte: $start, _lt: $stop } }
      ) {
        block_hash
      }
    }
  `;
  const result = await client.request(query, {
    start: startBlockNumber,
    stop: stopBlockNumber,
  });
  if (result.demo_chaindata.length !== stopBlockNumber - startBlockNumber)
    throw new Error("Query for block hashes failed");

  return result.demo_chaindata.map((x: any) => x.block_hash);
}

export async function getBlockMerkleProofMax1024(
  blockNumber: number,
  numFinal: number
) {
  const startBlockNumber = blockNumber - (blockNumber % 1024);
  const blockHashes = await queryBlockHashRange(
    startBlockNumber,
    startBlockNumber + numFinal
  );
  const tree = buildMerkleTree(blockHashes, 10);
  const merkleProof = getMerkleProof(tree, blockNumber % 1024);

  return {
    merkleProof,
    root: tree[10]![0]!,
    blockHash: tree[0]![blockNumber % 1024]!,
  };
}

// gets `roots` and `endHashProofs` input param for IAxiomV1.updateHistorical
export async function getHistoricalProofs(startBlockNumber: number) {
  if (startBlockNumber % 1024 !== 0)
    throw new Error("startBlockNumber must be a multiple of 1024");
  const blockHashes = await queryBlockHashRange(
    startBlockNumber,
    startBlockNumber + 2 ** 17
  );
  const trees = Array(128)
    .fill(0)
    .map((_, i) =>
      buildMerkleTree(blockHashes.slice(i * 1024, (i + 1) * 1024), 10)
    );
  const endHashProofs = trees.slice(0, -1).map((tree, i) => {
    let endHashProof = getMerkleProof(tree, 1023);
    endHashProof.reverse();
    endHashProof.push(tree[0]![1023]);
    return endHashProof;
  });
  const roots = trees.map((tree) => tree[10]![0]!);
  return {
    roots,
    endHashProofs,
  };
}

export async function queryBlockHash1024RootRange(
  startBlockNumber: number,
  stopBlockNumber: number
): Promise<string[]> {
  if ((stopBlockNumber - startBlockNumber) % 1024 !== 0) {
    throw new Error("Range must be a multiple of 1024");
  }
  const query = gql`
    query QueryRootCache($start: Int!, $stop: Int!) {
      demo_axiom_update_events(
        where: {
          startBlockNumber: { _gte: $start, _lt: $stop }
          numFinal: { _eq: 1024 }
        }
        order_by: { startBlockNumber: asc }
      ) {
        root
      }
    }
  `;
  const result = await client.request(query, {
    start: startBlockNumber,
    stop: stopBlockNumber,
  });
  if (
    result.demo_axiom_update_events.length !==
    (stopBlockNumber - startBlockNumber) / 1024
  ) {
    throw new Error("Query for block hashes failed");
  }
  return result.demo_axiom_update_events.map((x: any) => x.root);
}

/// Generates an input for IAxiomV1Verifier.mmrVerifyBlockHash for a given block number
/// Returns the batched MMR for blocks [0, totalBlocks) in 1024 batches, and the merkle inclusion proof of the blockhash for block blockNumber into it
export async function getBlockMmrProof(
  blockNumber: number,
  totalBlocks: number
) {
  if (totalBlocks % 1024 !== 0) {
    throw new Error("totalBlocks must be a multiple of 1024");
  }
  if (blockNumber >= totalBlocks) {
    throw new Error("blockNumber must be less than totalBlocks");
  }
  const historicalRoots = await queryBlockHash1024RootRange(0, totalBlocks);
  const mmrLength = historicalRoots.length;
  const numPeaks = mmrLength.toString(2).length;
  const mountains = Array(numPeaks)
    .fill(0)
    .map((_, i) => {
      if (((mmrLength >> i) & 1) === 0) {
        return [];
      } else {
        const end = (mmrLength >> i) << i;
        return buildMerkleTree(historicalRoots.slice(end - 2 ** i, end), i);
      }
    });
  let { merkleProof, blockHash, root } = await getBlockMerkleProofMax1024(
    blockNumber,
    1024
  );
  let rootId = blockNumber >> 10;
  assert(root === historicalRoots[rootId], "Root mismatch in historicalRoots");
  let peakId = numPeaks - 1;
  while (2 ** peakId <= rootId) {
    rootId -= 2 ** peakId;
    peakId -= 1;
  }
  assert(root === mountains[peakId]![0]![rootId], "Root mismatch in mmr");
  merkleProof = merkleProof.concat(getMerkleProof(mountains[peakId]!, rootId));

  return {
    mmr: mountains.map((mountain, i) =>
      mountain.length > 0 ? mountain[i]![0]! : ethers.ZeroHash
    ),
    claimedBlockHash: blockHash,
    merkleProof,
  };
}
