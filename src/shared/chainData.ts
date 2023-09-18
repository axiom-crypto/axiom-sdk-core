import { ethers } from "ethers";
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
  SolidityNestedMappingSubquery,
  SpecialValuesV2,
} from "@axiom-crypto/codec";
import { SharedConstants } from "./constants";

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

export async function getTransactionData(txHash: string, provider: ethers.JsonRpcProvider) {
  const txData = await provider.send(
    'eth_getTransactionByHash',
    [txHash]
  );
  return txData;
}

export async function getBlockNumberFromTxHash(
  provider: ethers.JsonRpcProvider,
  txHash: string,
): Promise<number | null> {
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    return null;
  }
  return tx.blockNumber;
}

export async function getHeaderFieldValue(
  provider: ethers.JsonRpcProvider,
  { blockNumber, fieldIdx }: HeaderSubquery
): Promise<number | string | bigint | null> {
  const block = await getFullBlock(blockNumber, provider);
  if (!block) {
    return null;
  }

  if (
    fieldIdx >= SpecialValuesV2.HeaderLogsBloomIdxOffset && 
    fieldIdx < SpecialValuesV2.HeaderLogsBloomIdxOffset + 8
  ) {
    const logIdx = fieldIdx - SpecialValuesV2.HeaderLogsBloomIdxOffset;
    if (
      !block.logsBloom || 
      logIdx >= block.logsBloom.slice(2).length / 64
    ) {
      return null;
    }
    const reader = new ByteStringReader(block.logsBloom);
    for (let i = 0; i < logIdx; i++) {
      reader.readBytes("bytes32");
    }
    const logsBloomValue = reader.readBytes("bytes32");
    return logsBloomValue;
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
): Promise<number | string | bigint | null> {
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    return null;
  }
  if (fieldOrCalldataIdx < SpecialValuesV2.TxCalldataIdxOffset) {
    switch (fieldOrCalldataIdx) {
      case TxField.ChainId:
        return tx.chainId ?? null;
      case TxField.Nonce:
        return tx.nonce ?? null;
      case TxField.MaxPriorityFeePerGas:
        return tx.maxPriorityFeePerGas ?? null;
      case TxField.MaxFeePerGas:
        return tx.maxFeePerGas ?? null;
      case TxField.GasLimit:
        return tx.gasLimit ?? null;
      case TxField.To:
        return tx.to ?? null;
      case TxField.Value:
        return tx.value ?? null;
      case TxField.Data:
        return tx.data ?? null;
      case TxField.AccessList:
        throw new Error("Access Lists are currently unsupported.")
      case TxField.SignatureYParity:
        return tx.signature.yParity ?? null;
      case TxField.SignatureR:
        return tx.signature.r ?? null;
      case TxField.SignatureS:
        return tx.signature.s ?? null;
      case TxField.GasPrice:
        return tx.gasPrice ?? null;
      case TxField.v:
        return tx.signature.v ?? null;
      case TxField.r:
        return tx.signature.r ?? null;
      case TxField.s:
        return tx.signature.s ?? null;
      case SpecialValuesV2.TxTxTypeFieldIdx:
        return tx.type ?? null;
      case SpecialValuesV2.TxBlockNumberFieldIdx:
        return tx.blockNumber ?? null;
      case SpecialValuesV2.TxTxIndexFieldIdx:
        const txRaw = await getTransactionData(txHash, provider);
        return txRaw.transactionIndex ?? null;
      case SpecialValuesV2.TxFunctionSelectorFieldIdx:
        if (!tx.to && !!tx.data) {
          return SpecialValuesV2.TxContractDeploySelectorValue;
        }
        if (tx.data === "0x") {
          return SpecialValuesV2.TxNoCalldataSelectorValue;
        }
        const selectorReader = new ByteStringReader(tx.data);
        const selector = selectorReader.readBytes("bytes4"); // function selector
        return selector; 
      case SpecialValuesV2.TxCalldataHashFieldIdx:
        return ethers.keccak256(tx.data);
      default:
        throw new Error(`Invalid tx field index: ${fieldOrCalldataIdx}`);
    }
  }

  if (fieldOrCalldataIdx < SpecialValuesV2.TxContractDataIdxOffset) {
    // Parse calldata blob (ignoring function selector) to get calldata at specified idx
    const calldata = tx.data;
    const calldataIdx = fieldOrCalldataIdx - SpecialValuesV2.TxCalldataIdxOffset;
    const reader = new ByteStringReader(calldata);
    const _functionSignature = reader.readBytes("bytes4"); // unused
    for (let i = 0; i < calldataIdx; i++) {
      reader.readBytes("bytes32");
    }
    const calldataValue = reader.readBytes("bytes32");
    return calldataValue;
  }

  // Get contractData Idx
  const contractDataIdx = fieldOrCalldataIdx - SpecialValuesV2.TxContractDataIdxOffset;
  const contractData = tx.data;
  const reader = new ByteStringReader(contractData);
  for (let i = 0; i < contractDataIdx; i++) {
    reader.readBytes("bytes32");
  }
  const contractDataValue = reader.readBytes("bytes32");
  return contractDataValue;
}

export async function getReceiptFieldValue(
  provider: ethers.JsonRpcProvider,
  { txHash, fieldOrLogIdx, topicOrDataOrAddressIdx }: ReceiptSubquery,
): Promise<number | string | bigint | null> {
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    return null;
  }

  if (
    fieldOrLogIdx >= SpecialValuesV2.HeaderLogsBloomIdxOffset && 
    fieldOrLogIdx < SpecialValuesV2.HeaderLogsBloomIdxOffset + 8
  ) {
    const logIdx = fieldOrLogIdx - SpecialValuesV2.HeaderLogsBloomIdxOffset;
    if (
      !receipt.logsBloom || 
      logIdx >= receipt.logsBloom.slice(2).length / 64
    ) {
      return null;
    }
    const reader = new ByteStringReader(receipt.logsBloom);
    for (let i = 0; i < logIdx; i++) {
      reader.readBytes("bytes32");
    }
    const logsBloomValue = reader.readBytes("bytes32");
    return logsBloomValue;
  }

  if (fieldOrLogIdx < SpecialValuesV2.ReceiptLogIdxOffset) {
    switch (fieldOrLogIdx) {
      case ReceiptField.Status:
        return receipt.status ?? null;
      case ReceiptField.PostState:
        return receipt.status ?? null;
      case ReceiptField.CumulativeGas:
        return receipt.cumulativeGasUsed ?? null;
      case ReceiptField.LogsBloom:
        return receipt.logsBloom ?? null;
      case ReceiptField.Logs:
        throw new Error("Use `receiptUseLogIdx(idx) to get a log at index `idx` in this transaction");
      case SpecialValuesV2.TxTxTypeFieldIdx:
        return receipt.type ?? null;
      case SpecialValuesV2.ReceiptBlockNumberFieldIdx:
        return receipt.blockNumber ?? null;
      case SpecialValuesV2.ReceiptTxIndexFieldIdx:
        return receipt.index ?? null;
      default:
        throw new Error(`Invalid receipt field index: ${fieldOrLogIdx}`);
    }
  }

  const logIdx = fieldOrLogIdx - SpecialValuesV2.ReceiptLogIdxOffset;
  const log = receipt.logs[logIdx] ?? null;
  if (!log) {
    return null;
  }

  if (topicOrDataOrAddressIdx < SpecialValuesV2.ReceiptDataIdxOffset) {
    // Return topic
    if (topicOrDataOrAddressIdx < log.topics.length) {
      return log.topics[topicOrDataOrAddressIdx];
    }

    // Return address
    if (topicOrDataOrAddressIdx === SpecialValuesV2.ReceiptAddressIdx) {
      return log.address ?? null;
    }

    console.warn("Invalid topic index: ", topicOrDataOrAddressIdx);
    return null;
  }

  // Return data
  const dataIdx = topicOrDataOrAddressIdx - SpecialValuesV2.ReceiptDataIdxOffset;
  const reader = new ByteStringReader(log.data);
  for (let i = 0; i < dataIdx; i++) {
    reader.readBytes("bytes32");
  }
  const dataValue = reader.readBytes("bytes32");
  return dataValue;
}

export async function getSolidityNestedMappingValue(
  provider: ethers.JsonRpcProvider,
  { blockNumber, addr, mappingSlot, mappingDepth, keys }: SolidityNestedMappingSubquery,
): Promise<string | null> {
  let slot = bytes32(mappingSlot);
  for (let i = 0; i < mappingDepth; i++) {
    const key = bytes32(keys[i]);
    slot = ethers.keccak256(ethers.concat([key, slot]));
  }
  const value = await provider.getStorage(addr, slot, blockNumber);
  if (!value) {
    return null;
  }
  return value;
}


export function getTxTypeForBlockNumber(
  blockNumber: number,
): TxType {
  if (blockNumber < SharedConstants.EIP2930_BLOCK) {
    return TxType.Legacy;
  } else if (blockNumber < SharedConstants.EIP1559_BLOCK) {
    return TxType.Eip2930;
  } else {
    return TxType.Eip1559;
  }
}

export async function getTxTypeForTxHash(
  provider: ethers.JsonRpcProvider,
  txHash: string
): Promise<TxType | null> {
  const tx = await provider.getTransaction(txHash);
  if (!tx || !tx.blockNumber) {
    return null;
  }
  const blockNumber = tx.blockNumber;
  return getTxTypeForBlockNumber(blockNumber);
}
