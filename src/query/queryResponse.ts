import { ethers, keccak256 } from "ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// block_response.keccak = keccak(blockHash . uint32(blockNumber))
export function getBlockResponse(
  blockHash: string, 
  blockNumber: number
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedBlockResponse = abiCoder.encode(
    ["bytes32", "uint32"], 
    [blockHash, blockNumber]
  );
  return keccak256(encodedBlockResponse);
}

// full_account_response.keccak = keccak(blockNumber . address . keccak(uint64(nonce) . uint96(balance) . storageRoot . codeHash))
export function getFullAccountResponse(
  blockNumber: number, 
  address: string, 
  nonce: string, 
  balance: number, 
  storageRoot: string, 
  codeHash: string,
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedAccountResponse = abiCoder.encode(
    ["uint64", "uint96", "bytes32", "bytes32"],
    [nonce, balance, storageRoot, codeHash]
  );
  const keccakAccountResponse = keccak256(encodedAccountResponse);
  const encodedFullAccountResponse = abiCoder.encode(
    ["uint32", "address", "bytes32"],
    [blockNumber, address, keccakAccountResponse]
  );
  return keccak256(encodedFullAccountResponse);
}

// full_storage_response.keccak = keccak(blockNumber . address . slot . uint256(value))
export function getFullStorageResponse(
  blockNumber: number,
  address: string,
  slot: number,
  value: number,
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedStorageResponse = abiCoder.encode(
    ["uint32", "address", "uint256", "uint256"],
    [blockNumber, address, slot, value]
  );
  return keccak256(encodedStorageResponse);
}

export function getQueryResponse(
  blockResponseRoot: string,
  accountResponseRoot: string,
  storageResponseRoot: string,
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedQueryResponse = abiCoder.encode(
    ["bytes32", "bytes32", "bytes32"],
    [blockResponseRoot, accountResponseRoot, storageResponseRoot]
  );
  return keccak256(encodedQueryResponse);
}

export function encodeQuery(
  length: number,
  blockNumber: number,
  address: string,
  slot: number,
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedQuery = abiCoder.encode(
    ["uint32", "uint32", "address", "uint256"],
    [length, blockNumber, address, slot]
  );
  return encodedQuery;
}

export function encodeQueryData(
  versionIdx: number,
  length: number,
  encodedQueries: string[],
): string {
  const abiCoder = new ethers.AbiCoder();
  const encodedQueryData = abiCoder.encode(
    ["uint8", "uint32", "bytes[]"],
    [versionIdx, length, encodedQueries]
  );
  return encodedQueryData;
}

export function getKeccakMerkleRoot(leaves: string[][]): string {
  const tree = StandardMerkleTree.of(leaves, ["bytes32"]);
  return tree.root;
}
