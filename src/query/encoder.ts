import { ethers } from "ethers";

export function encodeQuery(
  length: number,
  blockNumber: number,
  address: string,
  slot: ethers.BigNumberish,
  value: ethers.BigNumberish,
): string {
  const queryTypes = ["uint8", "uint32", "address", "uint256", "uint256"];
  const queryData = [length, blockNumber, address, slot, value];

  // Only encode the first `length + 1` elements
  const encodedQuery = ethers.solidityPacked (
    queryTypes.slice(0, length + 1),
    queryData.slice(0, length + 1)
  );
  return encodedQuery;
}

export function encodeQueryData(
  versionIdx: number,
  length: number,
  encodedQueries: string[],
): string {
  const encodedQueryData = ethers.solidityPacked(
    ["uint8", "uint32", "bytes[]"],
    [versionIdx, length, encodedQueries]
  );
  return encodedQueryData;
}

export function encodeRowHash(
  blockNumber: number, 
  address: string, 
  slot: string
) {
  const packed = ethers.solidityPacked(
    ["uint32", "address", "uint256"], 
    [blockNumber, address, slot]
  );
  return ethers.keccak256(packed);
}