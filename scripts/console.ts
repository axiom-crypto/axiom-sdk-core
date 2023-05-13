import {
  getBlockMerkleProofMax1024,
  getBlockMmrProof,
  getHistoricalProofs,
} from "./merkle";
import { AbiCoder } from "ethers";

const abiCoder = AbiCoder.defaultAbiCoder();

async function main() {
  if (process.argv.length < 3) {
    throw new Error("Command line argument missing: historical | merkleProof");
  } else if (process.argv[2] === "historical") {
    if (process.argv.length < 3) {
      throw new Error("Missing arguments: historical <startBlockNumber>");
    }
    const startBlockNumber = Number(process.argv[3]);
    let { roots, endHashProofs } = await getHistoricalProofs(startBlockNumber);
    let res = abiCoder.encode(
      ["bytes32[128]", "bytes32[11][127]"],
      [roots, endHashProofs]
    );
    process.stdout.write(res);
  } else if (process.argv[2] === "merkleProof") {
    if (process.argv.length < 4) {
      throw new Error(
        "Missing arguments: merkleProof <blockNumber> <numFinal>"
      );
    }
    const blockNumber = Number(process.argv[3]);
    const numFinal = Number(process.argv[4]);
    const res = await getBlockMerkleProofMax1024(blockNumber, numFinal);
    process.stdout.write(JSON.stringify(res, null, 2));
  } else if (process.argv[2] === "mmrProof") {
    if (process.argv.length < 4) {
      throw new Error(
        "Missing arguments: mmrProof <blockNumber> <totalBlocks>"
      );
    }
    const blockNumber = Number(process.argv[3]);
    const totalBlocks = Number(process.argv[4]);
    const { mmr, claimedBlockHash, merkleProof } = await getBlockMmrProof(
      blockNumber,
      totalBlocks
    );
    process.stdout.write(
      abiCoder.encode(
        ["bytes32[]", "bytes32", "bytes32[]"],
        [mmr, claimedBlockHash, merkleProof]
      )
    );
  } else {
    throw new Error("Unknown command: " + process.argv[2]);
  }
}

main().catch(console.error);
