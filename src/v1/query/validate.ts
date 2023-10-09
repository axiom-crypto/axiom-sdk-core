import { BigNumberish, ethers } from "ethers";
import { AccountState, QueryRow } from "../types";
import { getAccountData, getFullBlock } from "@axiom-crypto/tools";

// Ported from axiom-proving-service/services/query/responseValidation.ts
export async function validateQueryRow(
  provider: ethers.JsonRpcProvider,
  queryRow: QueryRow,
) {
  const block = await getFullBlock(provider, queryRow.blockNumber);
  let accountState: AccountState | undefined;
  let slot = queryRow.slot;
  if (slot) {
    slot = ethers.toBeHex(slot, 32);
  }
  if (queryRow.address) {
    if (!ethers.isAddress(queryRow.address)) {
      throw new Error(`Address ${queryRow.address} is not a valid address`);
    }
    let slots: BigNumberish[] = [];
    if (slot) {
      slots.push(slot);
    }
    const proofRes = await getAccountData(provider, queryRow.blockNumber, queryRow.address, slots);
    const accountProof = proofRes.accountProof;
    if (!isAssignedSlot(queryRow.address, accountProof)) {
      throw new Error(
        `Address ${queryRow.address} is an empty account at block ${queryRow.blockNumber}`
      );
    }
    const stateRoot = ethers.keccak256(accountProof[0]);
    if (stateRoot !== block.stateRoot) {
      throw new Error(
        `State root mismatch: ${block.stateRoot} (block) ${stateRoot} (accountProof)`
      );
    }
    accountState = {
      nonce: proofRes.nonce,
      balance: proofRes.balance,
      storageHash: proofRes.storageHash,
      codeHash: proofRes.codeHash,
    };
    if (slot) {
      const storageProof = proofRes.storageProof[0];
      const proof = storageProof.proof;
      const _value = storageProof.value;
      if (proof.length === 0) {
        throw new Error(
          `Slot ${slot} has empty MPT proof in account ${queryRow.address} at block ${queryRow.blockNumber}`
        );
      }
      if (
        !isAssignedSlot(slot, proof) &&
        ethers.toBeHex(_value, 32) !== ethers.toBeHex(0, 32)
      ) {
        throw new Error(
          `WARNING: eth_getProof returned non-zero value on an empty slot`
        );
      }
      const storageHash = ethers.keccak256(proof[0]);
      if (accountState.storageHash !== storageHash) {
        throw new Error(
          `Storage hash mismatch: ${accountState.storageHash} (account) ${storageHash} (storageProof)`
        );
      }
      if (
        ethers.toBeHex(queryRow.value as BigNumberish, 32) !== ethers.toBeHex(_value, 32)
      ) {
        console.error(`Storage slot value mismatch [block ${queryRow.blockNumber}, account ${queryRow.address}, slot ${queryRow.slot}]: ${queryRow.value} (query) ${_value} (storageProof)
        Replacing value with ${_value}`);
        queryRow.value = ethers.toBeHex(_value, 32);
      }
    }
  }
}

// copied from axiom-demo/pages/api/prod/slot.ts
function isAssignedSlot(key: ethers.BigNumberish, proof: string[]) {
  const keyHash = ethers.keccak256(key.toString());
  let claimedKeyHash = "0x";
  let keyIdx = 0;
  for (let i = 0; i < proof.length; i += 1) {
    const parsedNode = ethers.decodeRlp(proof[i]!);
    if (parsedNode.length === 17) {
      claimedKeyHash += keyHash[keyIdx + 2];
      keyIdx += 1;
    } else {
      const prefix = parsedNode[0][2];
      if (prefix === "1" || prefix === "3") {
        claimedKeyHash += parsedNode[0].slice(3);
        keyIdx = keyIdx + parsedNode[0].length - 3;
      } else {
        claimedKeyHash += parsedNode[0].slice(4);
        keyIdx = keyIdx + parsedNode[0].length - 4;
      }
    }
  }
  return keyHash === claimedKeyHash;
}
