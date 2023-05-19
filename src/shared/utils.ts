import { ethers } from "ethers";

export function zeroBytes(numBytes: number) {
  return `0x${"00".repeat(numBytes)}`;
}

export function stripZerosLeft(hex: string) {
  if (hex.substring(0, 2) === '0x') {
    const hexSubstr = hex.substring(2, hex.length);
    const stripped = hexSubstr.replace(/^0+/, '');
    return `0x${stripped}`;
  }
  return hex.replace(/^0+/, '');
}

export function shortenedHex(num: number) {
  return stripZerosLeft(ethers.toBeHex(num));
}

export async function getFullBlock(blockNumber: number, provider: ethers.JsonRpcProvider) {
  const fullBlock = await provider.send(
    'eth_getBlockByNumber',
    [ethers.toBeHex(blockNumber), true]
  );
  return fullBlock;
}

export async function getAccountData(blockNumber: number, address: `0x${string}`, provider: ethers.JsonRpcProvider) {
  const accountData = await provider.send(
    'eth_getProof',
    [address, [], shortenedHex(blockNumber)]
  );
  return accountData;
} 

export function concatHexStrings(...args: string[]) {
  return `0x${args.map((s) => {
    if (s.substring(0, 2) === '0x') {
      return s.substring(2, s.length)
    } else {
      return s;
    }
  }).join('')}`;
}