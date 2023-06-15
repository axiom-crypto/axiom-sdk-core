import { BigNumberish, ethers, keccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";

// block_response.keccak = keccak(blockHash . uint32(blockNumber))
export function getBlockResponse(
  blockHash: string,
  blockNumber: number
): string {
  const encodedBlockResponse = ethers.solidityPacked(
    ["bytes32", "uint32"],
    [blockHash, blockNumber]
  );
  return keccak256(encodedBlockResponse);
}

// full_account_response.keccak = keccak(blockNumber . address . keccak(uint64(nonce)
// . uint96(balance) . storageRoot . codeHash))
export function getFullAccountResponse(
  blockNumber: number,
  address: string,
  nonce: BigNumberish,
  balance: BigNumberish,
  storageRoot: string,
  codeHash: string
): string {
  const encodedAccountResponse = ethers.solidityPacked(
    ["uint64", "uint96", "bytes32", "bytes32"],
    [nonce, balance, storageRoot, codeHash]
  );
  const keccakAccountResponse = keccak256(encodedAccountResponse);
  const encodedFullAccountResponse = ethers.solidityPacked(
    ["uint32", "address", "bytes32"],
    [blockNumber, address, keccakAccountResponse]
  );
  return keccak256(encodedFullAccountResponse);
}

// full_storage_response.keccak = keccak(blockNumber . address . slot . uint256(value))
export function getFullStorageResponse(
  blockNumber: number,
  address: string,
  slot: BigNumberish,
  value: BigNumberish
): string {
  const encodedStorageResponse = ethers.solidityPacked(
    ["uint32", "address", "uint256", "uint256"],
    [blockNumber, address, slot, value]
  );
  return keccak256(encodedStorageResponse);
}

export function getKeccakMerkleRoot(leaves: string[]): string {
  const tree = new MerkleTree(leaves, keccak256);
  return tree.getHexRoot();
}
