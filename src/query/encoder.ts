import { ethers } from "ethers";

export function encodeQuery(
  length: number,
  blockNumber: number,
  address: string,
  slot: ethers.BigNumberish,
): string {
  const abiCoder = new ethers.AbiCoder();
  const queryTypes = ["uint32", "uint32", "address", "uint256"];
  const queryData = [length, blockNumber, address, slot];
  const encodedQuery = abiCoder.encode(
    queryTypes.slice(0, length + 1),
    queryData.slice(0, length + 1)
  );
  console.log(length, encodedQuery);
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