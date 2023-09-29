import { ethers } from "ethers"
import {
  AccountField,
  AccountSubquery,
  ReceiptField,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxField,
  TxSubquery,
  bytes32,
  validateAddress,
  validateBytes32,
  validateSize,
  getFieldIdxHeaderLogsBloomIdx,
  getFieldIdxReceiptLogAddress,
  getFieldIdxReceiptBlockNumber,
  getFieldIdxReceiptDataIdx,
  getFieldIdxReceiptLogIdx,
  getFieldIdxReceiptLogsBloomIdx,
  getFieldIdxReceiptTopicIdx,
  getFieldIdxReceiptTxIndex,
  getFieldIdxReceiptTxType,
  getFieldIdxTxBlockNumber,
  getFieldIdxTxCalldataHash,
  getFieldIdxTxCalldataIdx,
  getFieldIdxTxContractDataIdx,
  getFieldIdxTxFunctionSelector,
  getFieldIdxTxIndex,
  getFieldIdxTxType,
  HeaderField,
  HeaderSubquery,
  getEventSchema,
} from "@axiom-crypto/tools"

/**
 * Builder for a Header data subquery
 * @param blockNumber Block number to query
 */
export const buildHeaderSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());

  /**
   * End of the builder chain for a Header subquery. Specifies the HeaderField to query.
   * @param field HeaderField to query
   * @returns HeaderSubquery struct
   */
  const field = (field: HeaderField): HeaderSubquery => {
    return {
      blockNumber: blockNumberNum,
      fieldIdx: field,
    }
  }

  /**
   * End of the builder chain for a Header subquery. Specifies the logs bloom index to query.
   * @param logsBloomIdx Logs Bloom index (bytes as bytes32 array) to query
   * @returns HeaderSubquery struct
   */
  const logsBloom = (logsBloomIdx: number): HeaderSubquery => {
    if (logsBloomIdx < 0 || logsBloomIdx >= 8) {
      throw new Error("logsBloomIdx range is [0,8)");
    }
    return {
      blockNumber: blockNumberNum,
      fieldIdx: getFieldIdxHeaderLogsBloomIdx(logsBloomIdx),
    }
  }

  return Object.freeze({
    field,
    logsBloom,
  });
}

/**
 * Builder for an Account data subquery
 * @param blockNumber Block number to query
 */
export const buildAccountSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");

  /**
   * Continues building an Account subquery. Specifies the address to query.
   */
  const blockNumberNum = Number(blockNumber.toString());
  const address = (address: string) => {
    validateAddress(address);

    /**
     * End of the builder chain for an Account subquery. Specifies the AccountField to 
     * query.
     * @param field AccountField to query
     * @returns AccountSubquery struct
     */
    const field = (field: AccountField): AccountSubquery => {
      return {
        blockNumber: blockNumberNum,
        addr: address,
        fieldIdx: field,
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

/**
 * Builder for a Storage data subquery
 * @param blockNumber Block number to query
 */
export const buildStorageSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());

  /**
   * Continues building a Storage subquery. Specifies the address to query.
   * @param address Address to query
   */
  const address = (address: string) => {
    validateAddress(address);

    /**
     * End of the builder chain for a Storage subquery. Specifies the storage slot to 
     * query.
     * @param slot Storage slot to query
     * @returns StorageSubquery struct
     */
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

/**
 * Builder for a Transaction data subquery
 * @param txHash Transaction hash to query
 */
export const buildTxSubquery = (
  blockNumber: number | string | BigInt,
  txIdx: number | string | BigInt
) => {
  validateSize(blockNumber, "uint32");
  validateSize(txIdx, "uint16");

  const blockNumberNum = Number(blockNumber.toString());
  const txIdxNum = Number(txIdx.toString());

  /**
   * End of builder chain for a Transaction subquery. 
   * @param field The TxField to query
   * @returns TxSubquery struct
   */
  const field = (field: TxField): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: field,
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Specifies the calldata data index 
   * (as an array of bytes32 after the 4-byte function selector) to query.
   * @param dataIdx Calldata index (bytes as bytes32 array) to query
   * @returns TxSubquery struct
   */
  const calldata = (dataIdx: number | string | BigInt): TxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxCalldataIdx(dataIdxNum),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Specifies the contract data index
   * (as an array of bytes32) to query.
   * @param dataIdx Contract data index (bytes as bytes32 array) to query
   * @returns TxSubquery struct
   */
  const contractData = (dataIdx: number | string | BigInt): TxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxContractDataIdx(dataIdxNum),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the transaction type.
   * @returns TxSubquery struct
   */
  const txType = (): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxType(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the block number.
   * @returns TxSubquery struct
   */
  const blockNumberQuery = (): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxBlockNumber(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the transaction index.
   * @returns TxSubquery struct
   */
  const txIndex = (): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxIndex(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the function selector.
   * @returns TxSubquery struct
   */
  const functionSelector = (): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxFunctionSelector(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the keccak256 hash of 
   * the transaction's calldata.
   * @returns TxSubquery struct
   */
  const calldataHash = (): TxSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrCalldataIdx: getFieldIdxTxCalldataHash(),
    }
  }

  return Object.freeze({
    field,
    calldata,
    contractData,
    txType,
    blockNumberQuery,
    txIndex,
    functionSelector,
    calldataHash,
  });
}

/**
 * Builder for a Receipt data subquery
 * @param txHash Transaction hash to query
 */
export const buildReceiptSubquery = (
  blockNumber: number | string | BigInt,
  txIdx: number | string | BigInt
) => {
  validateSize(blockNumber, "uint32");
  validateSize(txIdx, "uint16");

  const blockNumberNum = Number(blockNumber.toString());
  const txIdxNum = Number(txIdx.toString());

  /**
   * End of the builder chain for a Receipt subquery. Specifies the ReceiptField to query.
   * @param field 
   * @returns ReceiptSubquery struct
   */
  const field = (field: ReceiptField): ReceiptSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrLogIdx: field,
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Specifies the logs bloom index to query.
   * @param logsBloomIdx Logs Bloom index (bytes as bytes32 array) to query
   * @returns ReceiptSubquery struct
   */
  const logsBloom = (logsBloomIdx: number): ReceiptSubquery => {
    if (logsBloomIdx < 0 || logsBloomIdx >= 8) {
      throw new Error("logsBloomIdx range is [0,8)");
    }
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrLogIdx: getFieldIdxReceiptLogsBloomIdx(logsBloomIdx),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * Continues building a Receipt subquery for a log (event) index. 
   * @param logIdx Index of the log event to query
   */
  const log = (logIdx: number) => {
    validateSize(logIdx, "uint32");
    logIdx = getFieldIdxReceiptLogIdx(logIdx);

    /**
     * Continues building a Receipt subquery. Specifies the topic index of the
     * log to query.
     * @param topicIdx Index of the topic to query
     */
    const topic = (topicIdx: number) => {
      validateSize(topicIdx, "uint32");

      /**
       * End of the builder chain for a Receipt subquery. Specifies the event schema of the log.
       * @param eventSchema Bytes32 event schema
       * @returns ReceiptSubquery struct
       */
      const eventSchema = (eventSchema: string): ReceiptSubquery => {
        eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
        validateBytes32(eventSchema);
        return {
          blockNumber: blockNumberNum,
      txIdx: txIdxNum,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: getFieldIdxReceiptTopicIdx(topicIdx),
          eventSchema,
        }
      }
      
      return Object.freeze({
        eventSchema,
      });
    }

    /**
     * Continues building a Receipt subquery. Specifies the data index of the 
     * log to query.
     * @param dataIdx Index of the data to query (bytes as bytes32 array)
     */
    const data = (dataIdx: number) => {
      validateSize(dataIdx, "uint32");

      /**
       * End of the builder chain for a Receipt subquery. Specifies the event schema of the log.
       * @param eventSchema Bytes32 event schema
       * @returns ReceiptSubquery struct
       */
      const eventSchema = (eventSchema: string): ReceiptSubquery => {
        eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
        validateBytes32(eventSchema);
        return {
          blockNumber: blockNumberNum,
      txIdx: txIdxNum,
          fieldOrLogIdx: logIdx,
          topicOrDataOrAddressIdx: getFieldIdxReceiptDataIdx(dataIdx),
          eventSchema,
        }
      }

      return Object.freeze({
        eventSchema,
      });
    }

    /**
     * End of the builder chain for a Receipt subquery. Specifies querying the address 
     * of the log event.
     * @returns ReceiptSubquery struct
     */
    const address = (): ReceiptSubquery => {
      return {
        blockNumber: blockNumberNum,
      txIdx: txIdxNum,
        fieldOrLogIdx: logIdx,
        topicOrDataOrAddressIdx: getFieldIdxReceiptLogAddress(),
        eventSchema: ethers.ZeroHash,
      }
    }

    return Object.freeze({
      topic,
      data,
      address,
    });
  }

  /**
   * End of the builder chain for a Receipt subquery. Queries the transaction type.
   * @returns ReceiptSubquery struct
   */
  const txType = (): ReceiptSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrLogIdx: getFieldIdxReceiptTxType(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Queries the block number.
   * @returns ReceiptSubquery struct
   */
  const blockNumberQuery = (): ReceiptSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrLogIdx: getFieldIdxReceiptBlockNumber(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Queries the transaction index.
   * @returns ReceiptSubquery struct
   */
  const txIndex = (): ReceiptSubquery => {
    return {
      blockNumber: blockNumberNum,
      txIdx: txIdxNum,
      fieldOrLogIdx: getFieldIdxReceiptTxIndex(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  return Object.freeze({
    field,
    logsBloom,
    log,
    txType,
    blockNumberQuery,
    txIndex,
  });
}

/**
 * Builder for a Solidity Nested Mapping data subquery
 * @param blockNumber Block number to query
 */
export const buildSolidityNestedMappingSubquery = (blockNumber: number | string | BigInt) => {
  validateSize(blockNumber, "uint32");
  const blockNumberNum = Number(blockNumber.toString());

  /**
   * Continues building a Solidity Nested Mapping subquery. Specifies the contract address 
   * to query.
   * @param address Contract address to query
   */
  const address = (address: string) => {
    validateAddress(address);
    
    /**
     * Continues building a Solidity Nested Mapping subquery. Specifies the slot of the 
     * mapping in the contract.
     * @param mappingSlot Slot of the mapping in the contract to query.
     */
    const mappingSlot = (mappingSlot: number | string | BigInt) => {
      validateSize(mappingSlot, "uint256");
      const mappingSlotStr = bytes32(mappingSlot.toString());

      /**
       * End of the builder chain for a Solidity Nested Mapping subquery. Specifies an array
       * of keys for the nested mapping. Max nested mappinng depth supported is 4.
       * @param keys An array of keys for the nested mapping (max depth 4).
       * @returns SolidityNestedMappingSubquery struct
       */
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