import {
  AccountField,
  AccountSubquery,
  AxiomV2ComputeQuery,
  DataSubquery,
  DataSubqueryType,
  HeaderField,
  HeaderSubquery,
  ReceiptField,
  ReceiptSubquery,
  SolidityNestedMappingSubquery,
  StorageSubquery,
  TxSubquery,
  TxField,
  getSlotForMapping,
  getBlockNumberAndTxIdx,
  getFieldIdxReceiptLogIdx,
  getFieldIdxReceiptTopicIdx,
  bytes32,
  getEventSchema,
  getFunctionSelector,
} from "@axiom-crypto/tools";
import {
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  AxiomV2QueryOptions,
  UnbuiltAccountSubquery,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildSolidityNestedMappingSubquery,
  buildStorageSubquery,
  buildTxSubquery,
} from "../../../src";
import { QueryV2 } from "../../../src/v2/query/queryV2";
import { ethers } from "ethers";
import { resizeArray } from "../../../src/shared/utils";

describe("QueryV2", () => {
  const BLOCK_NUMBER = 15537394;
  const WETH_ADDR = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const WETH_WHALE = "0x2E15D7AA0650dE1009710FDd45C3468d75AE1392";
  const WSOL_ADDR = "0xd31a59c85ae9d8edefec411d448f90841571b89c";
  const UNI_V3_FACTORY_ADDR = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI);

  const vkeyLen = 27;
  const vkey = [
    "0x0000000e0000000609bddd9050d5cb871ead4831773e485d445bde72a636efda",
    "0x1a1ce29363a95e142250c9b1df9fcc375c0b71f470588fa27fd57ad62b8cc3b8",
    "0xaca6c8e6e65a5225833d35582dfe7f9fbdb28598e7d87261505ac67a26951b63",
    "0x452351ddad76be162d068b32017323fa42cdbeb8882e6b9582277860c70eb6c4",
    "0x8c39a3fa19ab7624b1c084dc9fcca92697d8d41620b2393d75f44573da6be049",
    "0xcc79594db2d33d0b2adb2b256c968b17fc485d2105d46f7221d936f975fce7fd",
    "0xa5b28db43392ab162e3fee98ae4b3b5935b6a8cd2b4cc8fc26d319b8cca11b05",
    "0xb683ec6275cd9c146fc386defa21b217f145d3d8bff96a5ef1d2530dddeb53fd",
    "0xd228c6a0da9844082e3fee98ae4b3b5935b6a8cd2b4cc8fc26d319b8cca11b05",
    "0xb683ec6275cd9c146fc386defa21b217f145d3d8bff96a5ef1d2530dddeb53fd",
    "0xd228c6a0da984408fcdcb0effeaf608e158bad39e70072d125e5b5ea83955ffb",
    "0x519a816dfc19e1224006758437d363765499910d51df557f567e3d629fbd7967",
    "0x6cd5aa11f6bcaf2e28e51fedd5bb63a14f5eb83b2ce83646742b81b1d31c9c27",
    "0xa8642cfe25252a2f3ce91b8b813227e1249646be944066164de6bdca2160993f",
    "0x647e99067fdcb308aa083ca60fd005a3426f1cdae3f61cd9cbf99a325dd10b9d",
    "0x8bdf8050a2bf9e1925024beceabdb4b4911d011231b05c11cbea9de0a296a9a7",
    "0xff37223fa4521324822bb6371579ee4d87fc23254bb027e326c7a60c83989daa",
    "0xfb5d7cdca6f47902548b714abc5c49468e138847d3fd35a200d1c5240b1fb352",
    "0xc8f988d6dadf7c12c9c899f8dfcd1b01a8497ee582027bdc6ad9995e6c6836d4",
    "0x19ee3efcb9fc3908d65b2e0e1f1afb07e7f35cbfea5f0649c5e0fa2e50825254",
    "0x4fabda276bdae80dc2d10c313afdca472b8d45c6c98872fb8d8b09bc88a77455",
    "0xa4995ef6767e9b079e0425b2f369b67d1bdf0cba3a2681fd12b690922d42547e",
    "0xe5d9d4dea6af9615aec2751eaac88b4bcf7969cca3e547bebd893d3f751abc05",
    "0x8af761b646abf21daef711c3949c6f59999cf8d0b12c7c256700e6ec67350497",
    "0x0bbab076c2dad81f826c6e91fed65b76616d54dfb63bd4c854b8e774554f2d5c",
    "0xfa80f45234bb7103758da87d898e257c4bede49ce5365c6d7436b466a5c7f655",
    "0x0e10dcf28e543323",
  ];
  const computeProofRaw = [
    "0xf08a9fbf6aa1f3fb27851ff707d578c63969e8fc30499e992459e14105e03720",
    "0xd93c948001512f47a1f4ee4e1302363d88c5df5d52a507ae9ecdd6043bb4cc2e",
    "0x4819463c40c44377be16a3bc55f2a05308657483d6b19261fe180229a0cbc503",
    "0xb90ca2c55f2dab164337f7503f109f617a3f914481761ef706fdfc42a7883915",
    "0x5230666db2fcc516076061538fd01d7869b30567881cc34e05ecd123fb7d7999",
    "0x894f3f36d1d5cd76a41dd27ac0098a844757515b9fd0a16b0a3a8e67947ac780",
    "0x8189020b1c13c38731ad46af4699500e23ec90b77977669064b50500a77eec05",
    "0x9e9c8f90974b04f35fcdc714509ca9a38abe8df61753cc4aefc61564331e8b16",
    "0x6df183079bbf659093c8334e1a6bae21a719ba17b29d94ec7f1277fd27013f81",
    "0xa20fb5ae56418e81ed9dedf3e708429fd5ad703cd7d49d6dabe947092bf12f87",
    "0x823c310561b7f55a17a657aa87203eedf580b6fee639019fd23e36279b091b20",
    "0x632debc513cf2897c18f4776d76d502333c8df622ff06a097ff2522eff34aa9b",
    "0x09f19aac148f0b1169901ace4dc7d5924b436a9413ae16d3f67d6471e51571a4",
    "0xac5dc971463c1e82b9368b0a80215ace2ee1a0494c59eec646e80f03b0db6592",
    "0x3fd8d858a40199f75dbfa182bb9f0c880ca7942fdb2df30fe0119730442bf42f",
    "0x18d483768799f9892f761ee6a046b5c6b984a173c5f5474b5a49dd3e9a0d3bab",
    "0x6b033b106f8c6d51ce72616d71e041e54ea3da3ce7a5d2f075313ac1be439f02",
    "0x5fffc0cf07ac33893ddf94fc1b25a4b8b073f15dcd95fc3484fe473e1072b205",
    "0xdd6a2cb891ee443ecabbb84caee02cfca08870e5bb07cf096201ae9d0112b109",
    "0x1ebb396036f43391ff39ff40c08acb10933891285b057d8672229af992ab7c08",
    "0xe5cbd8a1a206897374a425297eac18e4087b26c0b5cfc9901c64dc2e016ae30d",
    "0x220b6a7f35d58659fbb2038ca155d343f12d34ed35d8f6f3f0bdf78f297a1228",
    "0x779822e0786a139fe3bcca766302847155bc8dec5f445a95e3da3b3d5ffd0323",
    "0x5033c66364e6b862be706a082a294814dc3d2b7a808cc04527d22ec292d77716",
    "0xe85decacc284a06bff5b45679379b7d9d85d26090209a80da085555df6ee1302",
    "0xea1ffd2c0578cb5727984a3a5c77075546fd75931e04d7e44db3c3ea0f5b152f",
    "0xffb162acdf5c846bd9bc331025e4854856e4e8d68b7d2f9d5b395ef8b5fc9c08",
    "0xdea5e6df32bc9c0d4b71ee3437efebaf0ba11a29fa241350f25225cbf6b8ef12",
    "0x86f1680c12dee6efbf00443a6071e33964adbb4373c071efeb5835ec8e1efd1d",
    "0x2214f8adbf1ace46fb88b7b47d175654bf45b7f861fbcd485c8b8e32303a2118",
    "0xc52832a6739b9974a7aa78f3eab172fcedb13237a79da05916242b1dfdd2f40c",
    "0x777a97b11164c244e875b1a7fccebff66f92d05726994ae0e868cbd70c675712",
    "0xbb230940f96174495d3ab4b871a27d56f9510bc5a00594e8d24a2d033f420612",
    "0xe7535e736b4318db5bef5942fe66054f7b99f475e5fede5a589014785306071d",
    "0xecc0a65b07b4b274ccfc64f417b6c7a10604f34195c19b0926d322a2c826ce05",
    "0xb8d8c157037f3373536938aecff1d4392f48b29c16d0b499127f17cb675ed701",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0xc160b2e978e1037bcc2034e366cfed4f6532c014319ab40602cf93d3fefcec22",
    "0xc8a84807085c69fbebac778605aa0d2fd610f840ac32b248d1c2f4c00cb4b400",
    "0xd0579274b1e406c16b250704b8e1683019611adc878370956584c1a5f784ea0f",
    "0xa68b6973d41090b360a8dd0a151761115af8da30c688b25ecc6dad64854f2211",
    "0x429934b81bcdeb2a4be0bfdf278bd7c2894f8550b1e504995e310752db33a108",
    "0x8219d0029b2760dfbf2f231846de8b042e2a0be9f28dcaab2e4a34a82c841f2b",
    "0x564688c793dee27c7f89735f2bef9bf87ecbf53976f46b4286d01fe6f35edd23",
    "0x6ae147ae4f898b9c227e40b46713edbc07b5ac0686ed33e14d286da575ebbe09",
    "0x13e378b9ce62a3d367ba89cded15b9c485de4af9d8db711b7eecc9d43a915720",
    "0x762a767e01cc602b1c76037defdd8890f2a77f2a90ff1d14a49d9f639e45f505",
    "0x7e4bdec786615fe2cb6883b08b59f385fc6cc8f7aba6965053b18c60a6098e04",
    "0xdc83c16b9ffb6bf683d714b35c8fa5ab25950482fb7757a6c6ca7085f523482c",
    "0x98ef52da04bc13491ae2e874851c647f778f141681651a1d3b0c88db1c77c403",
    "0x46f091d16f7d8ca0dad3d971a5348e038134294467067c515956983d61685c1e",
    "0x17fd52ac8fe6ce1f8b6c03516fabebaa16bfcb18c66ebdd2e3c3a22ab0f5c22d",
    "0x72a7a090e6642273203457e9eb7db25bbf26418d144edac0c305a7bbf235182e",
    "0x417bda7622cac6f173a9e47c5a3626bd2b641e354b9b868fddee7802821ec020",
    "0xb463641aaa099f23202001b793dc978a89da2c24fa0ab4964f7fb0cccc772b15",
    "0xd2edda42535bea2201fdbe28d6aee35154fd4df0a82d09f14193a38404502005",
    "0xfffe392c999ef8065909de4aa427c8d02dfff8793f12582829f4efba645af524",
    "0xa51e7832f5c1970d29c1d3304c7f5c2cc199c7d7b4a6be3a518dd4adde247c1b",
    "0x3616e8bb8c735878faf1d00f7fe8d159d16917724df5e99d752c58812d484d2f",
    "0x0a402861a2d79ae8ebb9287c67a37c5fbab5ef17c428f4ef1b62c23f738fd423",
    "0x706b5e2d8b8e8550391b9d10fd8ac4462cb71677e2dc12aab4d4514daad0d512",
    "0xde7b9d73817e10ca37b5f2cab8ab5bcb549127d90229e0533bf97cb80252f709",
    "0xd902d285a5395f96ea452bd4a4053df580879c9ce50c3a14f06e2ed43ffe6ba1",
  ];
  const computeProof = ethers.concat(computeProofRaw);

  const config: AxiomConfig = {
    privateKey: process.env.PRIVATE_KEY as string,
    providerUri: process.env.PROVIDER_URI as string,
    version: "v2",
  };
  const axiom = new Axiom(config);

  test("should initialize QueryV2", () => {
    expect(typeof axiom.query).toEqual("object");
  });

  // NOTE: disabled until new contract is deployed
  // test("should get balance", async () => {
  //   const config: AxiomConfig = {
  //     privateKey: process.env.PRIVATE_KEY as string,
  //     providerUri: process.env.PROVIDER_URI_GOERLI as string,
  //     version: "v2",
  //     chainId: 5,
  //   };
  //   const axiomGoerli = new Axiom(config);
  //   const aqg = axiomGoerli.query as QueryV2;
  //   const balance = await aqg.getBalance();
  //   expect(balance).toEqual("0");
  // });

  test("should validate a QueryV2", async () => {
    const dataQuery = [
      {
        blockNumber: BLOCK_NUMBER,
        fieldIdx: 0,
      },
      {
        blockNumber: BLOCK_NUMBER + 1,
        fieldIdx: 1,
      },
      {
        blockNumber: BLOCK_NUMBER,
        addr: WETH_WHALE,
        fieldIdx: AccountField.Nonce,
      },
      {
        // blockNumber: 17975259,
        // txIdx: 34,
        txHash: "0x47082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602",
        fieldOrLogIdx: ReceiptField.CumulativeGas,
        topicOrDataOrAddressIdx: 0,
        eventSchema: ethers.ZeroHash,
      },
      {
        blockNumber: 17000000,
        addr: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        mappingSlot: "5",
        mappingDepth: 3,
        keys: [
          bytes32("0x0000000000085d4780b73119b644ae5ecd22b376"),
          bytes32("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
          bytes32(3000),
        ],
      },
    ];
    const computeQueryReq: AxiomV2ComputeQuery = {
      k: 14,
      vkey,
      computeProof,
    };
    const callbackQuery = {
      target: WETH_ADDR,
      extraData: bytes32(ethers.solidityPacked(["address"], [WETH_WHALE])),
    };
    const options = {};
    const query = (axiom.query as QueryV2).new(dataQuery, computeQueryReq, callbackQuery, options);
    const isValid = await query.validate();
    expect(isValid).toEqual(true);
  }, 20000);

  test("Compute callback resultLen based on number of subqueries", async () => {
    const query = (axiom.query as QueryV2).new();

    const callback: AxiomV2Callback = {
      target: WETH_ADDR,
      extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    query.setCallback(callback);

    query.appendDataSubquery(buildHeaderSubquery(17000000).field(HeaderField.GasLimit));
    query.appendDataSubquery(buildHeaderSubquery(17000001).field(HeaderField.GasLimit));

    const builtQuery = await query.build();
    expect(builtQuery.computeQuery.resultLen).toEqual(2);
  });

  test("Use specified callback resultLen if there is a computeQuery", async () => {
    const query = (axiom.query as QueryV2).new();

    const callback: AxiomV2Callback = {
      target: WETH_ADDR,
      extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    query.setCallback(callback);
    const computeQueryReq: AxiomV2ComputeQuery = {
      k: 14,
      resultLen: 4,
      vkey,
      computeProof,
    };
    query.setComputeQuery(computeQueryReq);

    query.appendDataSubquery(buildHeaderSubquery(17000000).field(HeaderField.GasLimit));
    query.appendDataSubquery(buildHeaderSubquery(17000001).field(HeaderField.GasLimit));

    const builtQuery = await query.build();
    expect(builtQuery.computeQuery.resultLen).toEqual(4);
  });

  test("Set various options", async () => {
    const query = (axiom.query as QueryV2).new();

    const options: AxiomV2QueryOptions = {
      maxFeePerGas: "100000000",
      callbackGasLimit: 50000,
      refundee: ethers.ZeroAddress,
    };
    query.setOptions(options);

    const callback: AxiomV2Callback = {
      target: WETH_ADDR,
      extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    query.setCallback(callback);
    const computeQueryReq: AxiomV2ComputeQuery = {
      k: 14,
      resultLen: 4,
      vkey,
      computeProof,
    };
    query.setComputeQuery(computeQueryReq);

    query.appendDataSubquery(buildHeaderSubquery(17000000).field(HeaderField.GasLimit));
    query.appendDataSubquery(buildHeaderSubquery(17000001).field(HeaderField.GasLimit));

    const builtQuery = await query.build();
    expect(builtQuery.maxFeePerGas).toEqual(options.maxFeePerGas);
    expect(builtQuery.callbackGasLimit).toEqual(options.callbackGasLimit);
    expect(builtQuery.refundee).toEqual(ethers.ZeroAddress);
  });

  test("Append a Header subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const subquery = buildHeaderSubquery(17000000).field(HeaderField.GasLimit);
    query.appendDataSubquery(subquery);
    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    expect((builtDataQuery?.[0].subqueryData as HeaderSubquery).blockNumber).toEqual(17000000);
    expect((builtDataQuery?.[0].subqueryData as HeaderSubquery).fieldIdx).toEqual(HeaderField.GasLimit);
  });

  test("Append an Account subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const subquery = buildAccountSubquery(17000000).address(WETH_WHALE).field(AccountField.Nonce);
    query.appendDataSubquery(subquery);
    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    expect((builtDataQuery?.[0].subqueryData as AccountSubquery).blockNumber).toEqual(17000000);
    expect((builtDataQuery?.[0].subqueryData as AccountSubquery).addr).toEqual(WETH_WHALE.toLowerCase());
    expect((builtDataQuery?.[0].subqueryData as AccountSubquery).fieldIdx).toEqual(AccountField.Nonce);
  });

  test("Append a Storage subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const slot = getSlotForMapping("3", "address", WETH_WHALE);
    const subquery = buildStorageSubquery(18000000).address(WETH_ADDR).slot(slot);
    query.appendDataSubquery(subquery);

    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    expect((builtDataQuery?.[0].subqueryData as StorageSubquery).blockNumber).toEqual(18000000);
    expect((builtDataQuery?.[0].subqueryData as StorageSubquery).addr).toEqual(WETH_ADDR.toLowerCase());
    expect((builtDataQuery?.[0].subqueryData as StorageSubquery).slot).toEqual(slot);
  });

  test("Append a Tx subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const txHash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const { blockNumber, txIdx } = (await getBlockNumberAndTxIdx(provider, txHash)) as {
      blockNumber: number;
      txIdx: number;
    };
    const subquery = buildTxSubquery(txHash).field(TxField.To);
    query.appendDataSubquery(subquery);

    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    expect((builtDataQuery?.[0].subqueryData as TxSubquery).blockNumber).toEqual(blockNumber);
    expect((builtDataQuery?.[0].subqueryData as TxSubquery).txIdx).toEqual(txIdx);
    expect((builtDataQuery?.[0].subqueryData as TxSubquery).fieldOrCalldataIdx).toEqual(TxField.To);
  });

  test("Append a Receipt subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const eventSchema = getEventSchema("Transfer", ["address", "address", "uint256"]);

    const txHash = "0x8d2e6cbd7cf1f88ee174600f31b79382e0028e239bb1af8301ba6fc782758bc6";
    const { blockNumber, txIdx } = (await getBlockNumberAndTxIdx(provider, txHash)) as {
      blockNumber: number;
      txIdx: number;
    };

    const subquery = buildReceiptSubquery(txHash).log(0).topic(1).eventSchema("Transfer(address,address,uint256)");
    query.appendDataSubquery(subquery);

    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    const fieldOrLogIdx = getFieldIdxReceiptLogIdx(0);
    const topicOrDataOrAddressIdx = getFieldIdxReceiptTopicIdx(1);
    expect((builtDataQuery?.[0].subqueryData as ReceiptSubquery).blockNumber).toEqual(blockNumber);
    expect((builtDataQuery?.[0].subqueryData as ReceiptSubquery).txIdx).toEqual(txIdx);
    expect((builtDataQuery?.[0].subqueryData as ReceiptSubquery).fieldOrLogIdx).toEqual(fieldOrLogIdx);
    expect((builtDataQuery?.[0].subqueryData as ReceiptSubquery).topicOrDataOrAddressIdx).toEqual(
      topicOrDataOrAddressIdx,
    );
    expect((builtDataQuery?.[0].subqueryData as ReceiptSubquery).eventSchema).toEqual(eventSchema);
  });

  test("Append a Solidity Nested Mapping subquery", async () => {
    const query = (axiom.query as QueryV2).new();
    const subquery = buildSolidityNestedMappingSubquery(17000000)
      .address(UNI_V3_FACTORY_ADDR)
      .mappingSlot(5)
      .keys([WETH_ADDR, WSOL_ADDR, 10000]);
    query.appendDataSubquery(subquery);

    await query.build();
    const builtQuery = query.getBuiltQuery();
    const builtDataQuery = builtQuery?.dataQueryStruct.subqueries;
    expect((builtDataQuery?.[0].subqueryData as SolidityNestedMappingSubquery).blockNumber).toEqual(17000000);
    expect((builtDataQuery?.[0].subqueryData as SolidityNestedMappingSubquery).addr).toEqual(
      UNI_V3_FACTORY_ADDR.toLowerCase(),
    );
    expect((builtDataQuery?.[0].subqueryData as SolidityNestedMappingSubquery).mappingSlot).toEqual(bytes32(5));
    expect((builtDataQuery?.[0].subqueryData as SolidityNestedMappingSubquery).mappingDepth).toEqual(3);
    expect((builtDataQuery?.[0].subqueryData as SolidityNestedMappingSubquery).keys).toEqual([
      bytes32(WETH_ADDR),
      bytes32(WSOL_ADDR),
      bytes32(10000),
    ]);
  });

  test("Set a built DataQuery", async () => {
    const dataQueryReq = [
      {
        blockNumber: BLOCK_NUMBER,
        fieldIdx: 0,
      },
      {
        blockNumber: BLOCK_NUMBER + 1,
        fieldIdx: 1,
      },
      {
        blockNumber: BLOCK_NUMBER,
        addr: WETH_WHALE,
        fieldIdx: AccountField.Nonce,
      },
      {
        // blockNumber: 17975259,
        // txIdx: 34,
        txHash: "0x47082a4eaba054312c652a21c6d75a44095b8be43c60bdaeffad03d38a8b1602",
        fieldOrLogIdx: ReceiptField.CumulativeGas,
        topicOrDataOrAddressIdx: 10,
        eventSchema: ethers.ZeroHash,
      },
    ];
    const computeQueryReq: AxiomV2ComputeQuery = {
      k: 14,
      vkey,
      computeProof,
    };
    const callbackQuery = {
      target: WETH_ADDR,
      extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    const options: AxiomV2QueryOptions = {
      maxFeePerGas: BigInt(100000000).toString(),
    };
    const query = (axiom.query as QueryV2).new(dataQueryReq, computeQueryReq, callbackQuery, options);

    const unbiltDq = query.getDataQuery();
    expect((unbiltDq?.[2] as UnbuiltAccountSubquery).addr).toEqual(WETH_WHALE);

    const { queryHash, dataQueryHash, dataQuery, computeQuery, callback } = await query.build();
    const builtDq = query.getBuiltQuery()?.dataQueryStruct;
    if (builtDq === undefined) {
      throw new Error("builtDq is undefined");
    }

    const query2 = (axiom.query as QueryV2).new();
    query2.setBuiltDataQuery(builtDq);
    query2.setComputeQuery(computeQueryReq);
    query2.setCallback(callbackQuery);
    const {
      queryHash: queryHash2,
      dataQueryHash: dataQueryHash2,
      dataQuery: dataQuery2,
      computeQuery: computeQuery2,
      callback: callback2,
    } = await query2.build();

    expect(queryHash).toEqual(queryHash2);
    expect(dataQueryHash).toEqual(dataQueryHash2);
    expect(dataQuery).toEqual(dataQuery2);
    expect(computeQuery).toEqual(computeQuery2);
    expect(callback).toEqual(callback2);
  });

  test("Set a built empty DataQuery", async () => {
    const computeQueryReq: AxiomV2ComputeQuery = {
      k: 14,
      vkey,
      computeProof,
    };
    const callbackQuery = {
      target: WETH_ADDR,
      extraData: ethers.solidityPacked(["address"], [WETH_WHALE]),
    };
    const options: AxiomV2QueryOptions = {
      maxFeePerGas: BigInt(100000000).toString(),
    };
    const query = (axiom.query as QueryV2).new(undefined, computeQueryReq, callbackQuery, options);
    query.setBuiltDataQuery({
      sourceChainId: "5",
      subqueries: [],
    });
    await query.build();
    const builtDq = query.getBuiltQuery()?.dataQueryStruct;
    if (builtDq === undefined) {
      throw new Error("builtDq is undefined");
    }
  });
});
