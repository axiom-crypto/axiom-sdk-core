import { AccountField, AccountSubquery, ReceiptField, ReceiptSubquery, SolidityNestedMappingSubquery, StorageSubquery, TxField, TxSubquery, TxType, bytes32, getAccountFieldIdx, getReceiptFieldIdx, getTxFieldIdx, validateAddress, validateBytes32, validateSize } from "@axiom-crypto/codec"
import { ethers } from "ethers"
import { receiptUseAddress, receiptUseBlockNumber, receiptUseDataIdx, receiptUseLogIdx, receiptUseTopicIdx, receiptUseTxIndex, receiptUseTxType, txUseBlockNumber, txUseCalldataHash, txUseCalldataIdx, txUseContractDataIdx, txUseFunctionSelector, txUseTxIndex, txUseTxType } from "../../fields"
import { getEventSchema } from "../../../shared/utils"
import { HeaderField, HeaderSubquery, getHeaderFieldIdx } from "@axiom-crypto/codec"
import { getTxTypeForBlockNumber } from "../../../shared"

export const buildHeaderSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");
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
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    validateAddress(address)
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
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    validateAddress(address)
    const slot = (slot: number | string | BigInt): StorageSubquery => {
      validateSize(slot, "uint256");
      const slotStr = bytes32(slot.toString());
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
  validateBytes32(txHash);
  const field = (field: TxField) => {
    const type = (type: TxType): TxSubquery => {
      return {
        txHash,
        fieldOrCalldataIdx: getTxFieldIdx(type, field),
      }
    }

    const blockNumber = (blockNumber: number | string | BigInt): TxSubquery => {
      validateSize(blockNumber, "uint32");
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

  const calldata = (dataIdx: number | string | BigInt): TxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: txUseCalldataIdx(dataIdxNum),
    }
  }

  const contractData = (dataIdx: number | string | BigInt): TxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: txUseContractDataIdx(dataIdxNum),
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
    txType,
    blockNumber,
    txIndex,
    functionSelector,
    calldataHash,
  });
}

export const buildReceiptSubquery = (txHash: string) => {
  validateBytes32(txHash);
  const field = (field: ReceiptField): ReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: getReceiptFieldIdx(field),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  const log = (logIdx: number) => {
    validateSize(logIdx, "uint32");
    logIdx = receiptUseLogIdx(logIdx);

    const eventSchema = (eventSchema: string) => {
      eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
      validateBytes32(eventSchema);

      const topic = (topicIdx: number): ReceiptSubquery => {
        validateSize(topicIdx, "uint32");
        return {
          txHash,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: receiptUseTopicIdx(topicIdx),
          eventSchema,
        }
      }

      const data = (dataIdx: number): ReceiptSubquery => {
        validateSize(dataIdx, "uint32");
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

  const txType = (): ReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: receiptUseTxType(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  const blockNumber = (): ReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: receiptUseBlockNumber(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  const txIndex = (): ReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: receiptUseTxIndex(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  return Object.freeze({
    field,
    log,
    txType,
    blockNumber,
    txIndex,
  });
}

export const buildSolidityNestedMappingSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());

  const address = (address: string) => {
    validateAddress(address);
    
    const mappingSlot = (mappingSlot: number | string | BigInt) => {
      validateSize(mappingSlot, "uint256");
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