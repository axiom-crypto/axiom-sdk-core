import { AccessList, ethers } from "ethers";
import { bytes32, shortenedHex } from "./utils";
import {
  AccountField,
  HeaderField,
  ReceiptField,
  TxField,
  TxType,
  ByteStringReader,
  HeaderSubquery,
  AccountSubquery,
  StorageSubquery,
  TxSubquery,
  ReceiptSubquery,
} from "@axiom-crypto/codec";

export async function getFullBlock(blockNumber: number, provider: ethers.JsonRpcProvider) {
  const fullBlock = await provider.send(
    'eth_getBlockByNumber',
    [shortenedHex(blockNumber), true]
  );
  return fullBlock;
}

export async function getAccountData(blockNumber: number, addr: string, slots: ethers.BigNumberish[], provider: ethers.JsonRpcProvider) {
  const accountData = await provider.send(
    'eth_getProof',
    [addr, slots, shortenedHex(blockNumber)]
  );
  return accountData;
}

export async function getHeaderFieldValue(
  provider: ethers.JsonRpcProvider,
  { blockNumber, fieldIdx }: HeaderSubquery
): Promise<string | null> {
  const block = await getFullBlock(blockNumber, provider);
  if (!block) {
    return null;
  }
  switch (fieldIdx) {
    case HeaderField.ParentHash:
      return block.parentHash ?? null;
    case HeaderField.Sha3Uncles:
      return block.sha3Uncles ?? null;
    case HeaderField.Miner:
      return block.miner ?? null;
    case HeaderField.StateRoot:
      return block.stateRoot ?? null;
    case HeaderField.TransactionsRoot:
      return block.transactionsRoot ?? null;
    case HeaderField.ReceiptsRoot:
      return block.receiptsRoot ?? null;
    case HeaderField.LogsBloom:
      return block.logsBloom ?? null;
    case HeaderField.Difficulty:
      return block.difficulty ?? null;
    case HeaderField.Number:
      return block.number ?? null;
    case HeaderField.GasLimit:
      return block.gasLimit ?? null;
    case HeaderField.GasUsed:
      return block.gasUsed ?? null;
    case HeaderField.Timestamp:
      return block.timestamp ?? null;
    case HeaderField.ExtraData:
      return block.extraData ?? null;
    case HeaderField.MixHash:
      return block.mixHash ?? null;
    case HeaderField.Nonce:
      return block.nonce ?? null;
    case HeaderField.BaseFeePerGas:
      return block.baseFeePerGas ?? null;
    case HeaderField.WithdrawlsRoot:
      return block.withdrawlsRoot ?? null;
    case HeaderField.BlobGasUsed:
      return block.blobGasUsed ?? null;
    case HeaderField.ExcessBlobGas:
      return block.excessBlobGas ?? null;
    case HeaderField.ParentBeaconBlockRoot:
      return block.parentBeaconBlockRoot ?? null;
    default:
      throw new Error(`Invalid header field: ${fieldIdx}`);
  }
}

export async function getAccountFieldValue(
  provider: ethers.JsonRpcProvider,
  { blockNumber, addr, fieldIdx }: AccountSubquery
): Promise<string | null> {
  const account = await getAccountData(blockNumber, addr, [], provider);
  if (!account) {
    return null;
  }
  switch (fieldIdx) {
    case AccountField.Nonce:
      return account.nonce ?? null;
    case AccountField.Balance:
      return account.balance ?? null;
    case AccountField.StorageRoot:
      return account.storageHash ?? null;
    case AccountField.CodeHash:
      return account.codeHash ?? null;
    default:
      throw new Error(`Invalid account field: ${fieldIdx}`);
  }
}

export async function getStorageFieldValue(
  provider: ethers.JsonRpcProvider,
  { blockNumber, addr, slot }: StorageSubquery,
): Promise<string | null> {
  return await provider.getStorage(addr, slot, blockNumber);
}

export async function getTxFieldValue(
  provider: ethers.JsonRpcProvider,
  { txHash, fieldOrCalldataIdx }: TxSubquery,
): Promise<string | ethers.AccessList | null> {
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    return null;
  }
  if (fieldOrCalldataIdx < 100) {
    switch (fieldOrCalldataIdx) {
      case TxField.ChainId:
        return tx.chainId ? bytes32(tx.chainId) : null;
      case TxField.Nonce:
        return tx.nonce ? bytes32(tx.nonce) : null;
      case TxField.MaxPriorityFeePerGas:
        return tx.maxPriorityFeePerGas ? bytes32(tx.maxPriorityFeePerGas) : null;
      case TxField.MaxFeePerGas:
        return tx.maxFeePerGas ? bytes32(tx.maxFeePerGas) : null;
      case TxField.GasLimit:
        return tx.gasLimit ? bytes32(tx.gasLimit) : null;
      case TxField.To:
        return tx.to ?? null;
      case TxField.Value:
        return tx.value ? bytes32(tx.value) : null;
      case TxField.Data:
        return tx.data ? bytes32(tx.data) : null;
      case TxField.AccessList:
        return tx.accessList;
      case TxField.SignatureYParity:
        return tx.signature.yParity ? bytes32(tx.signature.yParity) : null;
      case TxField.SignatureR:
        return tx.signature.r ? bytes32(tx.signature.r) : null;
      case TxField.SignatureS:
        return tx.signature.s ? bytes32(tx.signature.s) : null;
      case TxField.GasPrice:
        return tx.gasPrice ? bytes32(tx.gasPrice) : null;
      case TxField.v:
        return tx.signature.v ? bytes32(tx.signature.v) : null;
      case TxField.r:
        return tx.signature.r ? bytes32(tx.signature.r) : null;
      case TxField.s:
        return tx.signature.s ? bytes32(tx.signature.s) : null;
    }
  }

  if (fieldOrCalldataIdx < 10000) {
    // Parse calldata blob (ignoring function selector) to get calldata at specified idx
    const calldata = tx.data;
    const calldataIdx = fieldOrCalldataIdx - 100;
    const reader = new ByteStringReader(calldata);
    const _functionSignature = reader.readBytes("bytes4");
    for (let i = 0; i < calldataIdx; i++) {
      reader.readBytes("bytes32");
    }
    const calldataValue = reader.readBytes("bytes32");
    return calldataValue;
  }

  // WIP
  const contractDataIdx = fieldOrCalldataIdx - 10000;
  // const contractData = await provider.call(tx, tx.blockNumber);
  return "";
}

export async function getReceiptFieldValue(
  provider: ethers.JsonRpcProvider,
  { txHash, fieldOrLogIdx, topicOrDataIdx }: ReceiptSubquery,
): Promise<string | ethers.Log | null> {
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    return null;
  }

  if (fieldOrLogIdx < 100) {
    switch (fieldOrLogIdx) {
      case ReceiptField.Status:
        return receipt.status ? bytes32(receipt.status) : null;
      case ReceiptField.PostState:
        return receipt.status ? bytes32(receipt.status) : null;
      case ReceiptField.CumulativeGas:
        return receipt.cumulativeGasUsed ? bytes32(receipt.cumulativeGasUsed) : null;
      case ReceiptField.LogsBloom:
        return receipt.logsBloom ?? null;
      case ReceiptField.Logs:
        throw new Error("Use `receiptUseLogIdx(idx) to get a log at index `idx` in this transaction");
    }
  }

  const logIdx = fieldOrLogIdx - 100;
  const log = receipt.logs[logIdx] ?? null;
  if (topicOrDataIdx && log) {
    if (topicOrDataIdx < log.topics.length) {
      return log.topics[topicOrDataIdx];
    }
    const dataIdx = topicOrDataIdx - log.topics.length;
    const reader = new ByteStringReader(log.data);
    for (let i = 0; i < dataIdx; i++) {
      reader.readBytes("bytes32");
    }
    const dataValue = reader.readBytes("bytes32");
    return dataValue;
  }
  return log;
}

export async function getTxTypeForTxHash(
  provider: ethers.JsonRpcProvider,
  txHash: string
): Promise<TxType | null> {
  const EIP2930_BLOCK = 12244000;
  const EIP1559_BLOCK = 12965000;
  const tx = await provider.getTransaction(txHash);
  if (!tx || !tx.blockNumber) {
    return null;
  }
  const blockNumber = tx.blockNumber;
  if (blockNumber < EIP2930_BLOCK) {
    return TxType.Legacy;
  } else if (blockNumber < EIP1559_BLOCK) {
    return TxType.Eip2930;
  } else {
    return TxType.Eip1559;
  }
}