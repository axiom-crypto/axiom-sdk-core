import axios from "axios";
import bs58 from 'bs58'

export async function writeStringIpfs(
  data: string,
): Promise<string | null> {
  const dataObj = {
    "pinataContent": {
      "data": data,
    },
    "pinataOptions": {
      "cidVersion": 0,
      "wrapWithDirectory": false,
    }
  }
  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", dataObj, {
      headers: {
        'Content-Type': "application/json",//`multipart/form-data; boundary= ${formData.getBoundary()}`,
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      }
    });
    return res.data.IpfsHash
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function readStringIpfs(
  hash: string,
): Promise<string | null> {
  try {
    const res = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return res.data.data ?? null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function convertIpfsCidToBytes32(ipfsCid: string) {
  return '0x' + Buffer.from(bs58.decode(ipfsCid).slice(2)).toString('hex')
}

export function convertBytes32ToIpfsCid(bytes32Hex: string) {
  return bs58.encode(Buffer.from('1220' + bytes32Hex.slice(2), 'hex'))
}