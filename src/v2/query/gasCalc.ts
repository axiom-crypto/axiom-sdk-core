import { ByteStringReader } from "@axiom-crypto/tools";

export function calculateCalldataGas(hexString: string): number {
  let gas = 0;
  const reader = new ByteStringReader(hexString);
  while (reader.getNumBytesRemaining() > 0) {
    const byte = reader.readBytes(1);
    if (byte === "0x00") {
      gas += 4;
    } else {
      gas += 16;
    }
  }

  return gas;
}
