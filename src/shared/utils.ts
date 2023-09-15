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

export function deepSort(
  arr: any[],
  keys: string[],
  sortFns: ((a: any, b: any) => number)[],
) {
  return arr.sort((a, b) => {
    let result = 0;
    for (let i = 0; i < keys.length; i++) {
      result = sortFns[i](a[keys[i]], b[keys[i]]);
      if (result !== 0) {
        return result;
      }
    }
    return result;
  });
}

export function sortByNumber(a: number, b: number) {
  return a - b;
}

export function sortByHex(a: string, b: string) {
  return parseInt(a, 16) - parseInt(b, 16);
}

export function bytes32(data: string | number | ethers.BigNumberish): string {
  return ethers.toBeHex(data, 32);
}

// Deep copy any object with nested objects. Will not deep copy functions inside the object.
export function deepCopyObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export function getFunctionSignature(functionString: string): string {
  const functionName = functionString.split("(")[0].trim();
  if (functionName === "") {
    throw new Error(`Invalid function string: ${functionString}`);
  }
  const functionParams = functionString.split("(")[1].split(")")[0].trim();
  if (functionParams === "") {
    return `${functionName}()`;
  }
  const functionParamArray = functionParams.split(",").map((param) => {
    let type = param.trim().split(" ")[0].trim();
    if (type === "uint") {
      type = "uint256";
    } else if (type === "int") {
      type = "int256";
    }
    return type;
  });
  return `${functionName}(${functionParamArray.join(",")})`;
}

export function getFunctionSelector(functionNameOrSig: string, params?: string[]): string {
  if (params === undefined) {
    return ethers.id(getFunctionSignature(functionNameOrSig)).slice(0, 10);
  }
  return ethers.FunctionFragment.getSelector(functionNameOrSig, params);
}

export function getEventSchema(functionNameOrSig: string, params?: string[]): string {
  if (params === undefined) {
    return ethers.id(getFunctionSignature(functionNameOrSig));
  }
  const concatFunction = `${functionNameOrSig}(${params.join(',')})`;
  return ethers.id(concatFunction);
}

export function fillArray(length: number, value: string) {
  return Array(length).fill(value);
}

export function resizeArray(arr: string[], size: number, defaultValue: string) {
  if (arr.length < size) {
    return arr.concat(Array(size - arr.length).fill(defaultValue));
  }
  return arr.slice(0, size);
};