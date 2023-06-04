import { ethers } from "ethers";

export function encodeQuery(
  length: number,
  blockNumber: number,
  address: string,
  slot: ethers.BigNumberish,
  value: ethers.BigNumberish,
): string {
<<<<<<< HEAD
  const queryTypes = ["uint8", "uint32", "address", "uint256", "uint256"];
  const queryData = [length, blockNumber, address, slot, value];
=======
  const queryTypes = ["uint32", "uint32", "address", "uint256"];
  const queryData = [length, blockNumber, address, slot];
>>>>>>> 396399eba782bd9c3d397eac600f97533bc849a9

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