export function convertVkeyNumArrToBytes32Arr(vk: number[]): string[] {
  const vkHex = vk.map((x) => BigInt(x).toString(16))
  let vkey: string[] = [];
  let vkeyElement = "";
  for (let i = 0; i < vkHex.length; i++) {
    vkeyElement += vkHex[i];
    if ((i - 1) % 32 === 0) {
      vkey.push("0x" + vkeyElement);
      vkeyElement = "";
    }
    if (i === vkHex.length - 1) {
      if (vkeyElement.length === 0) {
        break;
      }
      vkey.push("0x" + vkeyElement.padEnd(64, "0"));
    }
  }
  return vkey;
}
