import { ethers } from "ethers";
import {
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  QueryV2,
  bytes32,
  AxiomV2ComputeQuery,
  convertVkeyUint8ArrToBytes32Arr,
  buildReceiptSubquery,
  getTxHash,
  buildTxSubquery,
  TxField,
} from "../../../src";

describe("On-chain compute query scenarios", () => {
  const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY_GOERLI as string,
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
    // mock: true
  };
  const overrides = {
    // Addresses: {
    //   AxiomQuery: "",
    // },
  };
  const axiom = new Axiom(config, overrides);

  const exampleClientAddr = "0x41a7a901ef58d383801272d2408276d96973550d";
  const exampleClientAddrMock = "0x8fb73ce80fdb8f15877b161e4fe08b2a0a9979a9";
  const vk = [
    2,
    13,
    0,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    22,
    53,
    175,
    191,
    189,
    44,
    47,
    125,
    102,
    223,
    68,
    183,
    53,
    24,
    221,
    245,
    11,
    40,
    210,
    84,
    147,
    34,
    241,
    111,
    251,
    44,
    176,
    97,
    40,
    23,
    111,
    5,
    236,
    172,
    54,
    30,
    205,
    68,
    139,
    37,
    34,
    255,
    110,
    222,
    63,
    213,
    167,
    105,
    46,
    125,
    148,
    2,
    105,
    228,
    6,
    175,
    114,
    9,
    31,
    238,
    182,
    133,
    168,
    45,
    28,
    159,
    208,
    89,
    2,
    25,
    123,
    44,
    175,
    207,
    178,
    3,
    221,
    30,
    25,
    215,
    156,
    251,
    160,
    211,
    110,
    185,
    184,
    40,
    149,
    62,
    212,
    252,
    3,
    33,
    213,
    13,
    168,
    207,
    31,
    79,
    122,
    8,
    89,
    199,
    135,
    196,
    192,
    174,
    16,
    147,
    131,
    241,
    135,
    209,
    141,
    121,
    218,
    157,
    251,
    41,
    43,
    229,
    189,
    79,
    74,
    73,
    203,
    38,
    10,
    225,
    22,
    159,
    68,
    40,
    178,
    33,
    77,
    56,
    45,
    239,
    47,
    26,
    48,
    164,
    220,
    229,
    77,
    11,
    146,
    91,
    234,
    0,
    222,
    21,
    9,
    189,
    92,
    8,
    48,
    21,
    219,
    88,
    148,
    231,
    146,
    23,
    206,
    174,
    143,
    102,
    244,
    158,
    218,
    170,
    16,
    40,
    217,
    41,
    193,
    180,
    163,
    195,
    189,
    243,
    165,
    124,
    168,
    64,
    88,
    48,
    31,
    43,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    19,
    94,
    101,
    9,
    254,
    49,
    236,
    93,
    96,
    23,
    118,
    181,
    46,
    30,
    41,
    236,
    48,
    44,
    15,
    112,
    137,
    187,
    108,
    11,
    230,
    43,
    96,
    111,
    69,
    50,
    153,
    25,
    204,
    129,
    129,
    113,
    41,
    52,
    239,
    50,
    191,
    209,
    143,
    20,
    213,
    216,
    45,
    5,
    231,
    59,
    177,
    9,
    196,
    52,
    186,
    84,
    74,
    53,
    53,
    208,
    113,
    74,
    25,
    47,
    136,
    9,
    246,
    57,
    166,
    7,
    252,
    165,
    231,
    133,
    67,
    159,
    89,
    40,
    185,
    227,
    220,
    49,
    214,
    153,
    188,
    68,
    30,
    142,
    194,
    8,
    20,
    25,
    249,
    80,
    147,
    31,
    161,
    87,
    175,
    54,
    150,
    94,
    83,
    148,
    106,
    110,
    69,
    205,
    74,
    58,
    128,
    93,
    13,
    63,
    58,
    119,
    119,
    156,
    38,
    59,
    157,
    102,
    121,
    158,
    173,
    155,
    207,
    7,
    129,
    32,
    221,
    160,
    2,
    15,
    131,
    249,
    95,
    54,
    190,
    51,
    37,
    210,
    75,
    10,
    123,
    164,
    170,
    220,
    46,
    2,
    32,
    0,
    126,
    162,
    161,
    23,
    118,
    254,
    8,
    8,
    145,
    202,
    133,
    199,
    119,
    206,
    57,
    43,
    71,
    250,
    177,
    202,
    247,
    247,
    49,
    208,
    24,
    55,
    134,
    206,
    167,
    14,
    195,
    5,
    67,
    75,
    229,
    119,
    93,
    216,
    75,
    48,
    129,
    127,
    109,
    132,
    109,
    219,
    168,
    23,
    159,
    8,
    162,
    147,
    15,
    247,
    240,
    86,
    108,
    80,
    248,
    240,
    65,
    159,
    237,
    247,
    215,
    190,
    191,
    70,
    240,
    218,
    95,
    15,
    139,
    84,
    196,
    177,
    252,
    158,
    196,
    233,
    173,
    21,
    59,
    139,
    120,
    126,
    241,
    79,
    176,
    156,
    21,
    225,
    98,
    163,
    218,
    200,
    210,
    106,
    88,
    71,
    32,
    119,
    134,
    30,
    248,
    17,
    160,
    55,
    121,
    168,
    124,
    85,
    5,
    232,
    156,
    11,
    224,
    89,
    116,
    78,
    181,
    45,
    120,
    198,
    223,
    203,
    156,
    189,
    160,
    140,
    117,
    105,
    10,
    53,
    212,
    37,
    140,
    202,
    224,
    95,
    204,
    114,
    5,
    234,
    227,
    19,
    84,
    3,
    218,
    83,
    80,
    10,
    207,
    66,
    72,
    41,
    104,
    80,
    210,
    173,
    6,
    147,
    3,
    3,
    204,
    9,
    218,
    43,
    35,
    36,
    5,
    172,
    46,
    169,
    251,
    184,
    212,
    165,
    201,
    147,
    253,
    107,
    135,
    14,
    26,
    9,
    80,
    245,
    138,
    84,
    45,
    246,
    75,
    105,
    226,
    144,
    160,
    229,
    102,
    4,
    232,
    113,
    13,
    47,
    85,
    223,
    168,
    20,
    205,
    28,
    186,
    82,
    226,
    253,
    139,
    166,
    67,
    97,
    144,
    21,
    186,
    35,
    159,
    158,
    228,
    38,
    196,
    12,
    95,
    157,
    154,
    2,
    142,
    121,
    143,
    6,
    8,
    179,
    106,
    157,
    155,
    217,
    18,
    101,
    196,
    132,
    72,
    190,
    95,
    68,
    239,
    44,
    137,
    58,
    243,
    46,
    35,
    108,
    214,
    53,
    55,
    219,
    85,
    27,
    6,
    120,
    27,
    234,
    122,
    190,
    156,
    185,
    136,
    22,
    96,
    41,
    175,
    222,
    2,
    99,
    20,
    67,
    69,
    129,
    29,
    135,
    146,
    85,
    144,
    5,
    117,
    158,
    117,
    230,
    133,
    35,
  ];
  const computeProof =
    "0x00000000000000000000000000000000c42079f94a6350d7e6235f29174924f90000000000000000000000000000000028cc2ac818eb64fed8004e115fbcca6700000000000000000000000000000000000000000000000000000000b39244890000000000000000000000000000000032f6ef430555631f765df0dfae34eff30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000092a653000000000000000000000000000000000000000000000000000000003fc91a3a00000000000000000000000000000000fd70395cd496c647d5a6cc9d4b2b7fad000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004c472fd2a9a084d5819225c9f3461c05b30f01c6d32ca94d54d07e015d9113641331711c51952944ca5b5298abe023e2cd55b2f87f68462159e5e0baf98afc06052daf213d6997de815d1283e508ad2d488e704ae502cc20563c2aeb2540570d927eee681a413077a817b995f8f5507adbd36ea37faaa7dbb14278ada4f0805ceb49c0a626d19eba01b8affd026e9f9061169cda21c26cb60284f945016b4428f169954a875f0b352f601b7895f7b63685ee25ed042023b76e2dcf4e0462800fb19d9f1954fd681446c183114efebaefd313cf9c5dcf26c1bdc586f6bf36d267ed9013d169c356cb85a7c463431b6342333bf9ea07ff5d1373db19f0e7bbf46cd20020bbd3d370a169997ea40f023b1db0615bf9a89ea1db58d4fb52b0ad554d9f82c2f8ddc21510fbbb6858e8c629b6c7b19b990ca9f70ac5ca9bb89a795866c83cf8b06b16540ae4ca10235a19ce703ef67c558c49c94d6d9e085f57697b5e2fa5a242a2513362036fccd41ed4e270cb8a0f7a70a58988a3958734d2262016674f28ecdb83e85cdad01b1687b71777c90aaae5afa0d25b850ec9e51c226f1c0a446586ff6300749940933089eeabf9935261e3c65e9b23cca09f0e432a655db994bc1f548b53aaa14dd3a695994003d1ff564673a2fa2e99032197ba31a465d0fcf4e62f0fdd460cc15fde7947534c9d61972278567e3f3aa0df0991c59d0a1f0a1bfd29bd02c29d23b04c742263093444c5d4e7a4082c16c451f0104a2e1af714773eef18bfbd4fab4adcf8f3c5799ba5c757401b1877a0ffec7582198a0d44adb2d8f5381f0847a4fb5bb7ae4eaceb88a35ba88ce497398cee2ed7f5490f9783bc3a29b168f2efb2cb68e87abfc3c164344be40997703e921d591637c8110c0f7baa47eb3b16b3cfea49242db3234a9559f2bd8437fe50fa76a17ec78b043d00450d78b01b10c514acf726dcbbf3927420ec4d1a9b494ff333b190866a25e32156015e75c308f826e1ffaa7ba0b71121b9cd0f41827c70aba9326e1d8d06709244fb322592f1f33742ea498a796cb2198d1e42624d6a4c897374fae4032656000a0bff5a0e0e7c85beb0ce7ead316fcffddc47842e77e03bb85664bdd529210f87ba6c24d9205dc601d6cf9e6906f6e0a85b3a124bc18ab6b9724f31e82f23c96802314ca0a925e2bc1f3b79e7777c12eacf1ac2d3319b170f8503fc3f2d2f1dcde37a16395b0328dd13808eff9e24c272f576b2e6d6346f7b3f717e470e26091a53aa9c07b82b90819017a5108c9a7b70979325739905bc932850f32b2f3e0182659241955f2892f33f8b07560907ef57e43debd8da2bf2511a6c9e2f109858b14ac3f3d828af07c3d438bf4977c76c4813d2181f555b4fcc14d69ae928192f1b16994f69fb96054123424e2faa85b72e499e945e4dd92d4b5fb6e71f2f3bfa0bda20b020016ebf3e777eed4611239d13dced422aa3ddc3a124de3e900649c6b492668f0e03187146bec4c3e9f751a9065b30d1354a79cc5a4a67b8e01237a357a0260f1a3f12ce74a43c56457a317bc35afdb6889b7429490d062a530f87db49372a31c47b829b0469e82dac8652d2752f073599c5fd0ba01bc46eb60a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d7477da646692127e70bc38df24da340eed648ec0545cdd72cc24cdb9038fd137fcaaf54395abf940d29e8ea2fd705f4195b3afc127b0cbfad1989d27f180127b513cf3fdedf5a0cf8c3b429b2f96d0f07f6b1a700d2f450af3484056b27c717e3c1e374055e248f6eb6b9524947422bed1cbe9811f401fcb0a0d264cbe2302f10062ce9f961179791e41c3d845023faf9f52599758bfb257be199a61ff3501bad9cd542b06a37362c7ad6c6e6b7ee9245b0c8d4297fa31c1e8b11cc1ae6680afaf0f64d55257ecc5713b00ef0fb725d54d1c573d08aed2693c7dd46bd2cd60d2d1dd0df2ed64e1699247e58aa7a0154e2ae9ff028477bd591406a6598814d2cd22b98e37a5a077a8e6e3e88980993589bee96d91b3e77bda57675d84bb6d82adb0c95ecbc5691247258fdbcc3754c161cc29bd3c65134197d06964931fe931daaa1f1e7fc20ffc983d7af38fd82796a17cbe7307a02a1179934668c72399e0e82df5b4720df5f3f25d2dd2edc42c98d2d191ec5c3239c83a07afc097d9de307ed94f592118e3de34f5c32fc0930c2461d5050b455aa79bc4dab95c598d7301037d4e61e1e917ad45b11783744b8b6a75e7d3249520ca53ea32af9b363f006273843eda3be5aac9b56ce65496874c3523a46a190f23bdfd393862d2f699d20061d5db3c793113cea36f0d77e8e57a9f64cbae2bf59b7b698087dca622f706b0db7ab15e9e64790a3263d3d71330bf3675a455695642f6e0688ee3559034e681c1e2f59b8518a95a14ecf25c458f3b4b57d059cc8a3cc9d8ea127d0cff2b38e1ccdd587329abe7e3350cf3daaff3eec4bf7b586fa7b3a9fee779e3d8561d8b02b2c2a45a635cb1cabbbe222eb653d84185bd31c1d0236578965984e770179d5188966ed40023482973fac7ff3836ca9d712fc6bbe4be1de92da23baecd5ae22202657e4f2a1efa503ae7565f831849b59713e9ffffbe408187e49ab2ce212371fba760c9871a0361e028ad6e342cb0fd3449aea7ebc88cb1fdc18b1cc666a851f49d1734fb4f00b4903ac1007ae47e4f7340c8cea2d189b36b3b807a4fd66c9002d5104c61ac8e0cd55acdf71bebecda0f9e874be4b217c9a8503ac0833f006596e01c770b1e785c8e6cee91388dbd57954503ca252b9167e38af491ee38e0f0f";

  const vkey = convertVkeyUint8ArrToBytes32Arr(vk);

  test("Send a simple Compute Query", async () => {
    const query = (axiom.query as QueryV2).new();

    const blockNumber = 9610835;
    const txIdx = 6;
    const logIdx = 3;
    const eventSchema = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

    const txHash = await getTxHash(provider, blockNumber, txIdx);
    if (txHash === null) {
      throw new Error("txHash is null");
    }

    // Append a Receipt Subquery that gets the following event schema:
    // Swap(address,uint256,uint256,uint256,uint256,address)
    // 0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67
    let receiptSubquery = buildReceiptSubquery(txHash)
      .log(logIdx)
      .topic(0) // topic 0: event schema
      .eventSchema(eventSchema);
    query.appendDataSubquery(receiptSubquery);

    // Append a Receipt Subquery that checks the address recipient field
    receiptSubquery = buildReceiptSubquery(txHash)
      .log(logIdx)
      .topic(2) // topic 2: recipient
      .eventSchema(eventSchema);
    query.appendDataSubquery(receiptSubquery);

    // Append a Receipt Subquery that gets the block number of the transaction receipt
    receiptSubquery = buildReceiptSubquery(txHash).blockNumber(); // block number of the transaction
    query.appendDataSubquery(receiptSubquery);

    // Append a Transaction Subquery that gets the `to` field of the transaction
    let txSubquery = buildTxSubquery(txHash).field(TxField.To);
    query.appendDataSubquery(txSubquery);

    const computeQuery: AxiomV2ComputeQuery = {
      k: 13,
      resultLen: 4,
      vkey,
      computeProof,
    };
    query.setComputeQuery(computeQuery);

    const callback: AxiomV2Callback = {
      target: exampleClientAddr,
      extraData: bytes32(0),
    };
    query.setCallback(callback);

    const isValid = query.validate();
    expect(isValid).toBeTruthy();

    await query.build();
    const paymentAmt = query.calculateFee();
    const queryId = await query.sendOnchainQuery(paymentAmt, (receipt: ethers.ContractTransactionReceipt) => {
      console.log("receipt", receipt);
    });
    console.log("queryId", queryId);
  }, 40000);
});
