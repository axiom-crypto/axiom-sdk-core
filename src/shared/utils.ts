import { ethers } from "ethers";

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
    [shortenedHex(blockNumber), true]
  );
  return fullBlock;
}

export async function getAccountData(blockNumber: number, address: string, slots: ethers.BigNumberish[], provider: ethers.JsonRpcProvider) {
  const accountData = await provider.send(
    'eth_getProof',
    [address, slots, shortenedHex(blockNumber)]
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

export function sortBlockNumber(a: number, b: number) {
  return a - b;
};

export function sortAddress(a?: string, b?: string) {
  if (a === undefined && b === undefined) {
    return 0;
  } else if (a === undefined) {
    return -1;
  } else if (b === undefined) {
    return 1;
  }
  return parseInt(a, 16) - parseInt(b, 16);
};

export function sortSlot(
  a?: ethers.BigNumberish,
  b?: ethers.BigNumberish
) {
  if (a === undefined && b === undefined) {
    return 0;
  } else if (a === undefined) {
    return -1;
  } else if (b === undefined) {
    return 1;
  }
  return parseInt(a.toString(), 16) - parseInt(b.toString(), 16);
};

// Deep copy any object with nested objects. Will not deep copy functions inside the object.
export function deepCopyObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}