import { AccountField, AccountSubquery, ReceiptField, ReceiptSubquery, SolidityNestedMappingSubquery, StorageSubquery, TxField, TxSubquery, TxType, bytes32, getAccountFieldIdx, getReceiptFieldIdx, getTxFieldIdx } from "@axiom-crypto/codec"
import { ethers } from "ethers"
import { receiptUseAddress, receiptUseDataIdx, receiptUseLogIdx, receiptUseTopicIdx, txUseBlockNumber, txUseCalldataHash, txUseCalldataIdx, txUseContractDataIdx, txUseContractDeploySelector, txUseFunctionSelector, txUseNoCalldataSelector, txUseTxIndex, txUseTxType } from "../../fields"
import { getEventSchema } from "../../../shared/utils"
import { HeaderField, HeaderSubquery, getHeaderFieldIdx } from "@axiom-crypto/codec"
import { getTxTypeForBlockNumber } from "../../../shared"

export const buildHeaderSubquery = (blockNumber: number | string | BigInt) => {
  const blockNumberNum = Number(blockNumber.toString());
  const field = (field: HeaderField): HeaderSubquery => {
    return {
      blockNumber: blockNumberNum,
      fieldIdx: getHeaderFieldIdx(field),
    }
  }

  return Object.freeze({
    field,
  });
}

export const buildAccountSubquery = (blockNumber: number | string | BigInt) => {
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    const field = (field: AccountField): AccountSubquery => {
      return {
        blockNumber: blockNumberNum,
        addr: address,
        fieldIdx: getAccountFieldIdx(field),
      }
    }

    return Object.freeze({
      field,
    });
  }

  return Object.freeze({
    address,
  });
}

export const buildStorageSubquery = (blockNumber: number | string | BigInt) => {
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    const slot = (slot: number | string | BigInt): StorageSubquery => {
      const slotStr = bytes32(0);
      return {
        blockNumber: blockNumberNum,
        addr: address,
        slot: slotStr,
      }
    }

    return Object.freeze({
      slot,
    });
  }

  return Object.freeze({
    address,
  });
}

export const buildTxSubquery = (txHash: string) => {
  const field = (field: TxField) => {
    const type = (type: TxType): TxSubquery => {
      return {
        txHash,
        fieldOrCalldataIdx: getTxFieldIdx(type, field),
      }
    }

    const blockNumber = (blockNumber: number | string | BigInt): TxSubquery => {
      const blockNumberNum = Number(blockNumber.toString());
      const txType = getTxTypeForBlockNumber(blockNumberNum);
      return {
        txHash,
        fieldOrCalldataIdx: getTxFieldIdx(txType, field),
      }
    }

    return Object.freeze({
      type,
      blockNumber,
    });
  }

  const calldata = (bytes32Idx: number | string | BigInt): TxSubquery => {
    const bytes32IdxNum = Number(bytes32Idx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: txUseCalldataIdx(bytes32IdxNum),
    }
  }

  const contractData = (bytes32Idx: number | string | BigInt): TxSubquery => {
    const bytes32IdxNum = Number(bytes32Idx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: txUseContractDataIdx(bytes32IdxNum),
    }
  }

  const txType = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseTxType(),
    }
  }

  const blockNumber = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseBlockNumber(),
    }
  }

  const txIndex = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseTxIndex(),
    }
  }

  const functionSelector = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseFunctionSelector(),
    }
  }

  const noCalldataSelector = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseNoCalldataSelector(),
    }
  }

  const contractDeploySelector = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseContractDeploySelector(),
    }
  }

  const calldataHash = (): TxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: txUseCalldataHash(),
    }
  }

  return Object.freeze({
    field,
    calldata,
    contractData,
  });
}

export const buildReceiptSubquery = (txHash: string) => {
  const field = (field: ReceiptField): ReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: getReceiptFieldIdx(field),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  const log = (logIdx: number) => {
    logIdx = receiptUseLogIdx(logIdx);
    const eventSchema = (eventSchema: string) => {
      eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
      const topic = (topicIdx: number): ReceiptSubquery => {
        return {
          txHash,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: receiptUseTopicIdx(topicIdx),
          eventSchema,
        }
      }

      const data = (dataIdx: number): ReceiptSubquery => {
        return {
          txHash,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: receiptUseDataIdx(dataIdx),
          eventSchema,
        }
      }

      const address = (): ReceiptSubquery => {
        return {
          txHash,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: receiptUseAddress(),
          eventSchema,
        }
      }

      return Object.freeze({
        topic,
        data,
        address,
      });
    }

    return Object.freeze({
      eventSchema,
    })
  }

  return Object.freeze({
    field,
    log,
  });
}

export const buildNestedMappingSubquery = (blockNumber: number | string | BigInt) => {
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    const mappingSlot = (mappingSlot: number | string | BigInt) => {
      const mappingSlotStr = bytes32(mappingSlot.toString());
        const keys = (keys: (number | string | BigInt)[]): SolidityNestedMappingSubquery => {
          if (keys.length > 4) {
            throw new Error("Max mapping depth supported is 4");
          }
          const keysStr = keys.map(k => bytes32(k.toString()));
          return {
            blockNumber: blockNumberNum,
            addr: address,
            mappingSlot: mappingSlotStr,
            mappingDepth: keys.length,
            keys: keysStr,
          }
        }

      return Object.freeze({
        keys,
      });
    }

    return Object.freeze({
      mappingSlot,
    });
  }

  return Object.freeze({
    address,
  });
}