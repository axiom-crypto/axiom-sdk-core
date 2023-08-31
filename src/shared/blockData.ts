import { ethers } from "ethers";
import { shortenedHex } from "./utils";

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

export async function getHeaderField(blockNumber: number, fieldIdx: number, provider: ethers.JsonRpcProvider) {
  const block = await getFullBlock(blockNumber, provider);
  // WIP
}

export async function getAccountField(blockNumber: number, address: string, fieldIdx: number, provider: ethers.JsonRpcProvider) {
  // WIP
}

export async function getStorageField(blockNumber: number, address: string, slot: ethers.BigNumberish, provider: ethers.JsonRpcProvider) {
  // WIP
}

export async function getTxField(txHash: string, fieldIdx: number) {
  // WIP
}

export async function getReceiptField(txHash: string, fieldIdx: number, topicOrDataIdx?: number) {
  // WIP
}