import { AxiomSdkCore, AxiomSdkCoreConfig, QueryV2, ReceiptField, TxField, buildReceiptSubquery, buildTxSubquery } from "../../../src";

describe("Config Limit Manager", () => {
  const txHashes128 = [
    "0x4db3409f8fd6ad120ef6e3714fb341d47bc8d49cac63280c7e4f9b39e5b0b8c3",
    "0xa766ddd8f6bc8ad0a254e7074106f3c374142633512059f54fa3eb619f8bf627",
    "0xdbc4ad1c40f58d8a3abf0dd237111e93b40192f2a0cd23ea5dffd8d8b687a113",
    "0x2ee0b9fce233fbde1ab24ce33290e6ef50af94a785c62236ae4262609cb3442d",
    "0xe1915f21e47c90e33eae1be7a69d99a154769c46a68cc711131da4bdbb6b2aad",
    "0x70905905858f7e9674fbb3dd1331e022c961871a3b5b80b75927ba12f74eac7d",
    "0xd22ddbaf47137388d4a620373210946a2ccf09f8f06f39f9f6ad7c7ca888209a",
    "0xc2229a3016f44d44e137dc0e8a0886126d27dfcca35ddcf369797f082792022d",
    "0x5cbca950a85a08e435c0318fb9bed65c0f1344701c6615e44034039091838fe5",
    "0x32789c15d8e6702e66fcd0065c1a450cfdad0bca1d3ec37f2761a03e6c8eadae",
    "0xac7b91561c5bdf743c34a70a83a5021bb833b1d429673e21fa1960b92e4a0b93",
    "0x2df935a4a199ccc4dd3807462dbb1fc3f6ba038cc1782d38a6028e20db954ed2",
    "0xb863a4177041aedf726de723080b001c31243ffe751418a54a04e6b0157b79b7",
    "0x4120d87266a7e6d61f359edd0d6daf0e35d003f34be1940eb8c27bece11c6f11",
    "0x77e6782f3323addcccf17049c8953cd4c5f9ba5fcb74ffdc484e5641c4edcd14",
    "0xc1fff10556ea3e6d696ab319454473dc439e8d6a5b97a03676bddd6014465bc5",
    "0x517892313697fae425a0c4a89d464da90729abf44c99d37e4936202374d21a5f",
    "0xa864ffea41ed16c99970d54b7928b0daa3bfcc0fe9ef4ac211cf0e118125bd9f",
    "0xcfbd0acf0aa9ddc66f0d24eb33140943d5e6493992a889453c410b813097d1e1",
    "0xec990f92d9043345373c362005e8922ef7f07427d61d9d64ae2f2ed44714596d",
    "0x801fc13c1cc5d5c85d9e8e83901a59eb39eebe7a7171869405c91c396a49dddd",
    "0xd0e9041b8727e66e0be678d2e909c2be94714210cfd12cf3c4beacc8e362c103",
    "0xbca4c0ae397b80c8492a1f389e5bd52f4c045a33837daf819349baffad4e9cdd",
    "0xc65ee3091a0fe2297f98e91574cb0404cc580b81e91cd85b267e2e2568cd0983",
    "0x388cde76a7d36eba14b0b98cccf0612ad1bea337901723977c39211b734ab030",
    "0x61288c4109f0325aa68678e2f9f61b96b23d63c77b97de65263b638b527f9f99",
    "0x81657da7cd05f3d4d9be6ce749bdd89b8b55d6bac89018531caab5a05e18af52",
    "0x9ee2f5bec39680429a28059feeceda6c640748e7d6156fe0470853a8067cbaf9",
    "0xcd78cadf6e84cb6e029b4c25b85067c20b40d6bd48fe54dfea7a759a4984b51a",
    "0x6e920c097e5bad11778620dc4c08ec04bb83c2ce2467868183cc8c095854a0de",
    "0xdf87297eed994bf6e8eef30e89a2e899fd4775bbac7731e300a75b1296eec0bc",
    "0x95bd1012f75975852fa40069c89f78fb92fc1b8b82a9fc9441c0560ab10e3ce2",
    "0xfeb5ed3d258457eeca0bffd9215b9ddbf5b8acef5a86f3345ae6549a63e4a685",
    "0xd5b7a60f0aad3b2eb53f5fa33a7eebb23da2a3ed3bd16b4455a9f1e7f0d2ffda",
    "0x2dcd0f2f97172014ad88b584b01de3aa1483a8dcd69ba4b3753b262c526227e1",
    "0x5d43ff55995755c6398ebc96f8ae41f00c14ada0b1d56a46ae7a22c93d6af1e2",
    "0x243c2f64eaa18197a1179dd72a337ed350eb7aeef4f7937919b879cb778274b6",
    "0x4f9c3cd5618b49bda2d726d29b355528ca0c48a05862b8f16cec8e27063c9517",
    "0xd2a86e1ef232ffa7b7c32195b79e2f27080d92dada8dfea157ec4fbb3c56b54c",
    "0x650924c0d522c6feb5a48589489d1eb19c2bded73b2691c7001c919410b84f61",
    "0xe4b0a271495700545e624eccf0ca0b9d7d3a8e280bd965f9c3a44e5485621060",
    "0xdd4139b47559ffbf3474f750eec80922bfac9e7c44e0ac0d4ee80f1f665aad96",
    "0x343b43164a660121628c24623a86659fcb1140b646b725b2b886a65dabe9d1ad",
    "0xb5058c6ac0a311b82a3d51de760d7bf91a24869c2712dd96682a74de19f36d4a",
    "0x1fe758ee2e1f2bb6ab1b774c2d30367b0cffbf5f13749a2f0e1342b0d726c27b",
    "0x9e3fedd9a2361777c42d773b0f6880885e4e64575815b2cb838289bf14e053ad",
    "0x7576c4c3728b559965a9ab147bda89ef763b5b13565e45288991f4747c9833ad",
    "0xfdbe497d729639a84ac86ff508018cfef4b5d7ccc1b3ec409dbe2fea9414ee03",
    "0xaad567001fa96380bb187f97e2dfa35d1a0cb020b6b3bc000d81623fcef13353",
    "0xb4dbb9a18641f4aa272228c3c8281915b442d03a114f30e9344254b32dd9d08c",
    "0x10e3ba6d299ed03b690fec942504c53d6e8a5340422d94315f67eb9d54b8ad36",
    "0x41cac7557eb01485774148de87340fd2c58dac5fca9ef3434c880b70f10cd117",
    "0x6aa02b8872d5a7bec8544381e4ab9d9cddf556fa233273b880ac0cd1d47f7e8a",
    "0xd421129773ecef874ec34a9dd1cc819845cd24e4cda92f7c746f38726cf9c221",
    "0x2ed248f05550563e2a6538080554b474fb9a0f2536e5724734ebdeaffd074b96",
    "0x236977deae55ece5576a2af479dba290ff687ddcddeb5eba0060e9cd5dcb5167",
    "0x0781d26ba87b19b8644ed43cab0a91c092119067319f49460bf1d93f98668791",
    "0x7d872ef9114956a13dae56de170d5403336ff7d1ddfb52241de29a0e8f75da1a",
    "0xbe81b7cadcc17429d3a61f91894271821c951425e4cb7303abed3bae6c9d6376",
    "0x2e6f4d6e2d82e026ff2eb1e118e8f4b2f6c780667bf2ca47b38df04081a82140",
    "0xd6e6a638a8b7d3b400170c9d29e872625b7c09cbbc5de82e9e3361628c6d1ace",
    "0x1af8f5f51ea9bc393f5065a0db424165474a95db42402116ee3d37042e5d681f",
    "0xbbc8a6531648a08e19121d91cab92aa22edcfa7b0691f5e59dee3a1344b3bf85",
    "0xe65b6a4c77ae2bcdcfca6a276de7fd60fae0061c635f456488cf39cb13cc06d6",
    "0x8bd3093c647e733328293acb1d98cc2d26289e1642b3c37aa45123a0af64aa03",
    "0x9ba971cbbe1acde8b2702d859beffeb376fc941d08d4284030e5353219df42b1",
    "0x14b08bf0ff8d0500a594a13b127b567891e2328c65a2ff8efe0c75478a73b54c",
    "0x97b85c0c46416f4ff0f223c90a3f9fd12db5229062d1de4dd7e8a5bcf23b5185",
    "0x002dfdc78384ba6fe65155e339b9b4e26ccf04f3c06fe9dd8e16804a75c26f96",
    "0x81c69fb96466b74c04362d66a1912e9bcc4caaf054444917dcd440464f45f086",
    "0x2905c4f42dcc6b029536a30101e0fd4cc0d243a817c6908a84c5f98263f4ae8a",
    "0x784910e4c4270ecbffacd62014651d04e7b3543d2c2c0e775f24662e101b032e",
    "0x4c4460bf5590b911a83fa89776e588b4834955d8b9c097b05ca1e27e660b22ec",
    "0xcc8023ac1f98f674ba0ae7d858479d96c035000654a022285fb3b96de345799e",
    "0x9fd943641713fce52253c6739721a91aa2ea362ad4c3c118c0ca8a25d696e526",
    "0x6ba1d80608a9305bbbb56b9f46bffca318db2c8cf2de874e1e3d802f82ecf77e",
    "0xb5b854735690d63f4d416d42638c6bbbdf8b9097d4745943a251a153e78a8e66",
    "0x6c8889e4c72707a36d964756f50bc2a9b52c743aacb0b0a6fc1834eb1c185e4f",
    "0xaf2ad4fa229d377805ed9fa63662b92cfb18f2ed07d91f9ffd21639dbde4667c",
    "0xb22e8f4f1c8b726624f248b0950d3b88836c0961eb3217421a829dd07fc31433",
    "0x54425dcf7f38d1b72b939d6482125ec7f09aff62a54102118255108db581fc0d",
    "0x43bfce8d038dc6562809e11cbc13f5839556a48a7d29304798fd8bbb0384111d",
    "0x17227640224e10fa02b813ba5553a00520678fc12066b7aa244230edea812cb3",
    "0x9fee02ef43d669d2261d640a85439ca5af48a2583eb71180f9d6c903ce791aa1",
    "0x2d4c9a9d0074a8b5156a8b8ec8538c4d87530fd145520c6ead0bba61cae31fd1",
    "0x8649b5ba304908ad36300228eab4bc3c4a006a923699ac60ec990977ec94a6ea",
    "0xce2bb81d8a4199be13dd30cd47616128d888d042592aab9adc0d24811c2569a0",
    "0x8d39159c14de55564a5055f8252965304d943bda828b8b2abdbf766ec7b69886",
    "0xac2a7559b3926c4a85552dc1a07a5a2d19f33202fc92f131acae7a3173ab3c5f",
    "0x66fcd836c97a1b70555a9e9604b06595b6b7626533917987383d81cbd2997057",
    "0xc1c425b10de4803ea4e6dd5631ae0735db6cc7036359693ff81bcc77e4c56d1b",
    "0x313639e550885a627da7bf81f4fe2819d6a39f85234a46f305ba4017c17d3a4b",
    "0xbd80f306550040b3afa3da8773b5658d51c3eacb5f40f75748c946a7a2904354",
    "0x679e7c9f852f21b16f759d41c5daa3cdbed8de9e63c083072137d8ff431798b8",
    "0xd9c765a69dbc7d3aa976d03957f118b248ecb464d9dcc29d0b311461de2312da",
    "0x4f28f9cfabc3db845fe629920612d0b9bd6d0c47e89eefc12cc63ee6c0e4e1c5",
    "0x8fefc627ab45baf599b88199369d54188ef447ca4afc5c391b5ac72392710753",
    "0xe213b61eb9bbb84ecfded04ff69752387ac5950f0f0ec526315d0685c6075c3e",
    "0x30ef8f01068b76e3fab2b75fe3d0d8e7ab68b7861402372a4c45aac7800236f6",
    "0x27cd2a0c2c588b6ad2dc66097a78c61d4719e2e72a1779bde1a8ca6f1f5308f3",
    "0xdb6b3a04070ebffb58d8ddfe3b9fe41855d00069abc380dff5b4289598c59f55",
    "0xf892c0a3e37963787eee5d73b3feddcc8fa3d5a4e5102f2a730ad138e0047ac2",
    "0x0466ef98f76f2654bd98d08f946e963548c8d88989a18d673620dbbdc4ec0815",
    "0x289d72465b1e79f2d33f45f29940b4b2b025f721b93504cbc0e3a5182ac0ed45",
    "0x53086fb602c8f48d31298ff10e01e9bad7c916bc7553dfe705a536005412fa59",
    "0x967f1dfb6ad78cb1d6caee45f66d41f979051be30f384cc699e913ac155a7168",
    "0x665387388ab6515e454bc34295452c036bd66c5afe5da77a587e621048a8ef5d",
    "0x421da07fb438c04086cb359c5be4bd0373216f7f5f841885aef799b95cef5962",
    "0xed92256966e3f71146724951a8fc818db721e4648de4d59281e1ed2f5b4eb132",
    "0x083018a9ac2264d2f9f3894e61b08a7f80fd2bddd394a107a5f46ea8f81edf2e",
    "0x5f18ec0c6a0de99b2199f2b814e637201abdbe25ccac2a570a5415afe69ee609",
    "0x7f786099cf160d39e3a8efb877f0097f56b14d03be53471fafe0a2ae14b282a4",
    "0x44d7796db2114bd0cfdf7f4bcf6cd879e59baad36bafedef165de1e201a8dff1",
    "0x2067159ec6b2eecdff5afaaff0f3a95ac2a186dee66af822fc41071679d71053",
    "0xda0400f6541d9afa92132fb56083a71cfe041de1bf6fc972a9385c88b8d52d16",
    "0x750c75ba8fdb5e32b3435d64c18d07e0097e4ddd07dc44358e39219178dfc2fb",
    "0xdc5497ddc10c446e62b4d6f62655ea8d4146f81ed78a5c216cde54f856e5e88d",
    "0xc92e73a7d066e00d919054d884e4a9a94f427305d38cd66e7155e8793f772d18",
    "0x65780b9128009875ec26468222a197efaedc784df8bd8fdcd39e252ab99218aa",
    "0xf14f93a270704c71f0a49c150e564baeea77e55d60c9e2ba27c871e7ca6b3fbf",
    "0xdd0904c8360368c08bb41d460cc7e3c12e3df488f925f47f3ced8bcba285fa2c",
    "0xc7c99179a330f71e1e79bb1be5753df733cc86a45cfdbf32256ee165caa3a2a9",
    "0xf830798d76819a5b0354e7ce57a12ef10e3ed5c200225af3be5b8803d445d407",
    "0xa9945755d93de0703a6039445648e0117bd088169acc8d761f69c02a189ea6f8",
    "0xdb569651655ee9d9706fb9ce54438ccdef0f52f0604eed75ca4ddd1d1a7a5449",
    "0x2be80ef9b7f8c378a10e33c7094e8207140584bb04e70f666f000c4ef1148ada",
    "0xabc7a8fe5bc82a34b49f64d4a64b4446f5d344f5a18ae3c59e90bf20c03b3f5d",
    "0x0bac75b6278420e0178f1e53f283336acf31a9bf96cb61eedacbfc4a803d6307",
  ];

  const txHashesLarge = [
    "0x59ada23f6dc651da3d1455763f265418cd66865b3c2f78e55922507bf6301227", // CREATE2 call  
    "0x883640fbfce3710fabc0662a7e33d912450fa44130866a46a861538885c32b84"
  ];

  const txHashesMax = [
    "0x8eea148cadd73701e89672796c720dd6ba93f95a061dc5d78f65fbee31e30205", // contract creation
    "0xd6cba43527b52089c3a7850202dc32e02b9bfe3f1fc5dadf274456405af824c3", 
    "0x59ada23f6dc651da3d1455763f265418cd66865b3c2f78e55922507bf6301227",
    "0x393ee30e1fe45753c3b7bfa197b639d8f89f64f2a0cda6145c67358aeaf0fac0",
    "0x5bd3638af64a0c3c3ffb423807ef42bd5f4d92b4b95dc5bff350e81a50bd8749",
  ];

  const rcHashesMedium = [
    "0xa9a64e0b67b389c31db3db1479e39808aa801f2c9140b397691bb041d5389cfe", // 80 log, 1024b each
    "0xacc68842cfca9111f402334d5f8b971843857d990d2b65240945692842030468",
    "0xf9fca94f31a41ac7f705f964f53af679d8bd89ec0b25e82fdbfb2a2b4db536ff",
    "0x7ab4446fd83a42e24a71ab7eee873d7571d6336ad9e63bc23e80093ea88c0af0",
    "0x13c8504ebc6dd981518f5d88901968b52b8545698a43348dcafb80c0611eb4dc",
    "0xe521c225670f2b0faa88ec07cb975f6d8fc717a50b994b6d5eaffeacc01b0a14",
    "0xf498e607eaa6d3416d1c05085f254e0db60828daa98539d01484d643419f2d89",
    "0xb900666ce02c2223ab4f7842f14f76197e61677bf9d6562a1239a938fa9987ff",
  ];

  const rcHashesLarge = [
    "0x46c9ec7358bd51bf19425ad0a464c3a4056fc956f89082f5611c886617d5d1a0", // 1184b log
    "0xa35374016c4d80e1a48532f976b32d2645d7003a5b871b1557aaff3363ca45af", // 1120b log
    "0x0a61363b6a033d4ddf842f4765ea729a4ac54e761398404618bd139a5f1ca0a7", // 1120b log
    "0xb1919e75917103e1d2f23c54cb7e60decea6a10c28e871a7d463dce455faf263", // 1056b log
    "0x80b19a2f01456357682c9131d237dfb915f9d3e888962f3f828df439d8e550d2", // 80 log, 2048b each
  ];

  const rcHashesMax = [
    "",
  ];

  const rcHashesOverMax = [
    "0x4c4d02b5a0b9bd697b648983242a6ac3f7bb74f69c8e5204c5a089577c65c4c6", // 400 log, >1024b
    "0x80b19a2f01456357682c9131d237dfb915f9d3e888962f3f828df439d8e550d2", // 80 log, >2048b log
  ];

  const config: AxiomSdkCoreConfig = {
    providerUri: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    chainId: 1,
    version: "v2",
  };
  const axiom = new AxiomSdkCore(config);

  // test("default config: 128 tx", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < txHashes128.length; i++) {
  //     const subquery = buildTxSubquery(txHashes128[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(subquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  // }, 120000);

  // test("default config: 128 rc", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < txHashes128.length; i++) {
  //     const subquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //     query.appendDataSubquery(subquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  // }, 120000);

  // test("default config: 64 tx, 64 rc", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < txHashes128.length / 2; i++) {
  //     const txSubquery = buildTxSubquery(txHashes128[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //     const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(128);
  // }, 120000);

  // test("default config (fail): 65 tx, 64 rc", async () => {
  //   const testFn = () => {
  //     const query = (axiom.query as QueryV2).new();
  //     for (let i = 0; i < txHashes128.length / 2; i++) {
  //       const txSubquery = buildTxSubquery(txHashes128[i]).field(TxField.MaxFeePerGas);
  //       query.appendDataSubquery(txSubquery);
  //       const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //       query.appendDataSubquery(rcSubquery);
  //     }
  //     const txSubquery = buildTxSubquery(txHashes128[65]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //   }
  //   expect(testFn).toThrow();
  // }, 120000);

  // test("large config: 1 lg tx, 15 small tx", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   const lgTxSubquery = buildTxSubquery(txHashesLarge[0]).field(TxField.MaxFeePerGas);
  //   query.appendDataSubquery(lgTxSubquery);
  //   for (let i = 0; i < 15; i++) {
  //     const txSubquery = buildTxSubquery(txHashes128[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(16);
  // }, 120000);

  // test("large config: 1 lg rc, 15 small rc", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   const lgReceiptSubquery = buildReceiptSubquery(rcHashesLarge[0]).field(ReceiptField.Status);
  //   query.appendDataSubquery(lgReceiptSubquery);
  //   for (let i = 0; i < 15; i++) {
  //     const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(16);
  // }, 120000);

  // test("large config: 1 lg tx, 16 small rc", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < 1; i++) {
  //     const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //   }
  //   for (let i = 0; i < 16; i++) {
  //     const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(17);
  // }, 120000);

  // test("large config (fail): 17 tx", async () => {
  //   const testFn = async () => {
  //     const query = (axiom.query as QueryV2).new();
  //     for (let i = 0; i < 1; i++) {
  //       const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
  //       query.appendDataSubquery(txSubquery);
  //     }
  //     for (let i = 0; i < 16; i++) {
  //       const txSubquery = buildTxSubquery(txHashes128[i]).field(TxField.MaxFeePerGas);
  //       query.appendDataSubquery(txSubquery);
  //     }
  //     await query.build(true);
  //   };
  //   expect(testFn).rejects.toThrow();
  // }, 120000);

  // test("large config (fail): 4 lg rc, 16 small rc", async () => {
  //   const testFn = async () => {
  //     const query = (axiom.query as QueryV2).new();
  //     for (let i = 0; i < 4; i++) {
  //       const rcSubquery = buildReceiptSubquery(rcHashesLarge[i]).field(ReceiptField.Status);
  //       query.appendDataSubquery(rcSubquery);
  //     }
  //     for (let i = 0; i < 16; i++) {
  //       const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //       query.appendDataSubquery(rcSubquery);
  //     }
  //     await query.build(true);
  //   };
  //   expect(testFn).rejects.toThrow();
  // }, 120000);

  // test("large config (fail): 1 lg tx, 17 small rc", async () => {
  //   const testFn = async () => {
  //     const query = (axiom.query as QueryV2).new();
  //     for (let i = 0; i < 1; i++) {
  //       const txSubquery = buildTxSubquery(txHashesLarge[i]).field(TxField.MaxFeePerGas);
  //       query.appendDataSubquery(txSubquery);
  //     }
  //     for (let i = 0; i < 17; i++) {
  //       const rcSubquery = buildReceiptSubquery(txHashes128[i]).field(ReceiptField.Status);
  //       query.appendDataSubquery(rcSubquery);
  //     }
  //     await query.build(true);
  //   };
  //   expect(testFn).rejects.toThrow();
  // }, 120000);
  
  // test("max config: 4 max tx", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < 4; i++) {
  //     const txSubquery = buildTxSubquery(txHashesMax[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(4);
  // }, 120000);

  // test("max config: 4 max tx, 1 max rc", async () => {
  //   const query = (axiom.query as QueryV2).new();
  //   for (let i = 0; i < 4; i++) {
  //     const txSubquery = buildTxSubquery(txHashesMax[i]).field(TxField.MaxFeePerGas);
  //     query.appendDataSubquery(txSubquery);
  //   }
  //   for (let i = 0; i < 1; i++) {
  //     const rcSubquery = buildReceiptSubquery(rcHashesLarge[i]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //   }
  //   const built = await query.build(true);
  //   expect(built.dataQueryStruct.subqueries.length).toEqual(5);
  // }, 120000);

  test("max config (fail): 5 max tx", async () => {
    const testFn = async () => {
      const query = (axiom.query as QueryV2).new();
      for (let i = 0; i < 5; i++) {
        const txSubquery = buildTxSubquery(txHashesMax[i]).field(TxField.MaxFeePerGas);
        query.appendDataSubquery(txSubquery);
      }
      await query.build(true);
    };
    expect(await testFn).rejects.toThrow();
  }, 120000);

  test("max config (fail): 2 max rc", async () => {

  }, 120000);

  // test("max config (fail): oversize 1 max rc (max config log data len)", async () => {
  //   const testFn = async () => {
  //     const query = (axiom.query as QueryV2).new();
  //     const rcSubquery = buildReceiptSubquery(rcHashesOverMax[0]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //     const built = await query.build(true);
  //   }
  //   expect(testFn).rejects.toThrow();
  // }, 120000);

  // test("max config (fail): oversize 1 max rc (large config log data len)", async () => {
  //   const testFn = async () => {
  //     const query = (axiom.query as QueryV2).new();
  //     const rcSubquery = buildReceiptSubquery(rcHashesOverMax[1]).field(ReceiptField.Status);
  //     query.appendDataSubquery(rcSubquery);
  //     const built = await query.build(true);
  //   }
  //   expect(testFn).rejects.toThrow();
  // }, 120000);
});