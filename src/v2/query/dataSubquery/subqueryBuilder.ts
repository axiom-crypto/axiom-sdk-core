import { ethers } from "ethers"
import {
  AccountField,
  ReceiptField,
  TxField,
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
  getEventSchema,
} from "@axiom-crypto/tools"
import {
  UnbuiltAccountSubquery,
  UnbuiltHeaderSubquery,
  UnbuiltReceiptSubquery,
  UnbuiltSolidityNestedMappingSubquery,
  UnbuiltStorageSubquery,
  UnbuiltTxSubquery
} from "../../types";

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
   * @returns UnbuiltHeaderSubquery struct
   */
  const field = (field: HeaderField): UnbuiltHeaderSubquery => {
    return {
      blockNumber: blockNumberNum,
      fieldIdx: field,
    }
  }

  /**
   * End of the builder chain for a Header subquery. Specifies the logs bloom index to query.
   * @param logsBloomIdx Logs Bloom index (bytes as bytes32 array) to query
   * @returns UnbuiltHeaderSubquery struct
   */
  const logsBloom = (logsBloomIdx: number): UnbuiltHeaderSubquery => {
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
     * @returns UnbuiltAccountSubquery struct
     */
    const field = (field: AccountField): UnbuiltAccountSubquery => {
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
     * @returns UnbuiltStorageSubquery struct
     */
    const slot = (slot: number | string | BigInt): UnbuiltStorageSubquery => {
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
  txHash: string,
) => {
  validateBytes32(txHash);

  /**
   * End of builder chain for a Transaction subquery. 
   * @param field The TxField to query
   * @returns UnbuiltTxSubquery struct
   */
  const field = (field: TxField): UnbuiltTxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: field,
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Specifies the calldata data index 
   * (as an array of bytes32 after the 4-byte function selector) to query.
   * @param dataIdx Calldata index (bytes as bytes32 array) to query
   * @returns UnbuiltTxSubquery struct
   */
  const calldata = (dataIdx: number | string | BigInt): UnbuiltTxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxCalldataIdx(dataIdxNum),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Specifies the contract data index
   * (as an array of bytes32) to query.
   * @param dataIdx Contract data index (bytes as bytes32 array) to query
   * @returns UnbuiltTxSubquery struct
   */
  const contractData = (dataIdx: number | string | BigInt): UnbuiltTxSubquery => {
    validateSize(dataIdx, "uint32");
    const dataIdxNum = Number(dataIdx.toString());
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxContractDataIdx(dataIdxNum),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the transaction type.
   * @returns UnbuiltTxSubquery struct
   */
  const txType = (): UnbuiltTxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxType(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the block number.
   * @returns UnbuiltTxSubquery struct
   */
  const blockNumberQuery = (): UnbuiltTxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxBlockNumber(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the transaction index.
   * @returns UnbuiltTxSubquery struct
   */
  const txIndex = (): UnbuiltTxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxIndex(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the function selector.
   * @returns UnbuiltTxSubquery struct
   */
  const functionSelector = (): UnbuiltTxSubquery => {
    return {
      txHash,
      fieldOrCalldataIdx: getFieldIdxTxFunctionSelector(),
    }
  }

  /**
   * End of the builder chain for a Transaction subquery. Queries the keccak256 hash of 
   * the transaction's calldata.
   * @returns UnbuiltTxSubquery struct
   */
  const calldataHash = (): UnbuiltTxSubquery => {
    return {
      txHash,
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
  txHash: string,
) => {
  validateBytes32(txHash);

  /**
   * End of the builder chain for a Receipt subquery. Specifies the ReceiptField to query.
   * @param field 
   * @returns UnbuiltReceiptSubquery struct
   */
  const field = (field: ReceiptField): UnbuiltReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: field,
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Specifies the logs bloom index to query.
   * @param logsBloomIdx Logs Bloom index (bytes as bytes32 array) to query
   * @returns UnbuiltReceiptSubquery struct
   */
  const logsBloom = (logsBloomIdx: number): UnbuiltReceiptSubquery => {
    if (logsBloomIdx < 0 || logsBloomIdx >= 8) {
      throw new Error("logsBloomIdx range is [0,8)");
    }
    return {
      txHash,
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
       * @returns UnbuiltReceiptSubquery struct
       */
      const eventSchema = (eventSchema: string): UnbuiltReceiptSubquery => {
        eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
        validateBytes32(eventSchema);
        return {
          txHash,
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
       * @returns UnbuiltReceiptSubquery struct
       */
      const eventSchema = (eventSchema: string): UnbuiltReceiptSubquery => {
        eventSchema = eventSchema.startsWith("0x") ? eventSchema : getEventSchema(eventSchema);
        validateBytes32(eventSchema);
        
        return {
          txHash,
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
     * @returns UnbuiltReceiptSubquery struct
     */
    const address = (): UnbuiltReceiptSubquery => {
      return {
        txHash,
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
   * @returns UnbuiltReceiptSubquery struct
   */
  const txType = (): UnbuiltReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: getFieldIdxReceiptTxType(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Queries the block number.
   * @returns UnbuiltReceiptSubquery struct
   */
  const blockNumberQuery = (): UnbuiltReceiptSubquery => {
    return {
      txHash,
      fieldOrLogIdx: getFieldIdxReceiptBlockNumber(),
      topicOrDataOrAddressIdx: 0,
      eventSchema: ethers.ZeroHash,
    }
  }

  /**
   * End of the builder chain for a Receipt subquery. Queries the transaction index.
   * @returns UnbuiltReceiptSubquery struct
   */
  const txIndex = (): UnbuiltReceiptSubquery => {
    return {
      txHash,
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
       * @returns UnbuiltSolidityNestedMappingSubquery struct
       */
      const keys = (keys: (number | string | BigInt)[]): UnbuiltSolidityNestedMappingSubquery => {
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