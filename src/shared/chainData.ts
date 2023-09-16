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
} from "@axiom-crypto/codec";
import { SharedConstants } from "./constants";
import { ConstantsV2 } from "../v2/constants";

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
  if (fieldOrCalldataIdx < ConstantsV2.TxCalldataIdxOffset) {
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
    }
  }

  if (fieldOrCalldataIdx < ConstantsV2.TxContractDataIdxOffset) {
    // Parse calldata blob (ignoring function selector) to get calldata at specified idx
    const calldata = tx.data;
    const calldataIdx = fieldOrCalldataIdx - ConstantsV2.TxCalldataIdxOffset;
    const reader = new ByteStringReader(calldata);
    const _functionSignature = reader.readBytes("bytes4"); // unused
    for (let i = 0; i < calldataIdx; i++) {
      reader.readBytes("bytes32");
    }
    const calldataValue = reader.readBytes("bytes32");
    return calldataValue;
  }

  // Get contractData Idx
  const contractDataIdx = fieldOrCalldataIdx - ConstantsV2.TxContractDataIdxOffset;
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

  if (fieldOrLogIdx < ConstantsV2.ReceiptLogIdxOffset) {
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
      case ConstantsV2.TxTxTypeFieldIdx:
        return receipt.type ?? null;
      case ConstantsV2.ReceiptBlockNumberFieldIdx:
        return receipt.blockNumber ?? null;
      case ConstantsV2.ReceiptTxIndexFieldIdx:
        return receipt.index ?? null;
      default:
        throw new Error(`Invalid receipt field index: ${fieldOrLogIdx}`);
    }
  }

  const logIdx = fieldOrLogIdx - ConstantsV2.ReceiptLogIdxOffset;
  const log = receipt.logs[logIdx] ?? null;
  if (!log) {
    return null;
  }

  // TransactionReceipt {
  //   provider: JsonRpcProvider {},
  //   to: '0x253553366Da8546fC250F225fe3d25d0C782303b',
  //   from: '0xB392448932F6ef430555631f765Df0dfaE34efF3',
  //   contractAddress: null,
  //   hash: '0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453',
  //   index: 96,
  //   blockHash: '0x0ec62b9b2b9dda21ece949b81131815c3f4c65e985837bcd8db25075c1bd084c',
  //   blockNumber: 17874577,
  //   logsBloom: '0x0000000000040000000000000010010000000000000000000101000010000000000004000000200008000000000000000000000000801000000000000012a0000000040000000000480000080280000800000000040010000000000000000000000000000300800000000010080008000000002000000800010000100000000000000100000000000000100000000000040000200000002000000000408000000000100000020400088040100420000000040000000000050080000400000022000000060000000000000200000150002008000000080004000000000200280000c0000800040000080000000100000000000040081000000100080200002000',
  //   gasUsed: 340980n,
  //   cumulativeGasUsed: 10227326n,
  //   gasPrice: 16417267766n,
  //   type: 2,
  //   status: 1,
  //   root: undefined
  // }

  // Log {
  //   provider: JsonRpcProvider {},
  //   transactionHash: '0x540d8ddec902752fdac71a44274513b80b537ce9d8b60ab6668078b583e17453',
  //   blockHash: '0x0ec62b9b2b9dda21ece949b81131815c3f4c65e985837bcd8db25075c1bd084c',
  //   blockNumber: 17874577,
  //   removed: undefined,
  //   address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
  //   data: '0x000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000014b392448932f6ef430555631f765df0dfae34eff3000000000000000000000000',
  //   topics: [
  //     '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752',
  //     '0x7610115e31b8be283a240f1b8ea09ca53abfdfaa17c79175efd8cfef62b37ab9'
  //   ],
  //   index: 205,
  //   transactionIndex: 96
  // },

  if (topicOrDataOrAddressIdx < ConstantsV2.ReceiptDataIdxOffset) {
    // Return topic
    if (topicOrDataOrAddressIdx < log.topics.length) {
      return log.topics[topicOrDataOrAddressIdx];
    }

    // Return address
    if (topicOrDataOrAddressIdx === ConstantsV2.ReceiptAddressIdx) {
      return log.address ?? null;
    }

    console.warn("Invalid topic index: ", topicOrDataOrAddressIdx);
    return null;
  }

  // Return data
  const dataIdx = topicOrDataOrAddressIdx - ConstantsV2.ReceiptDataIdxOffset;
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
