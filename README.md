# ez-nft

[![npm](https://img.shields.io/npm/dm/ez-nft.svg?maxAge=600)](https://www.npmjs.com/package/ez-nft)
[![npm](https://img.shields.io/npm/l/ez-nft.svg?maxAge=600)](https://github.com/noodleofdeath/ez-nft/blob/main/LICENSE)

---

Yet another library for generating NFT artwork, uploading NFT assets and metadata to IPFS, deploying NFT smart contracts, and minting NFT collections

---

## Table of Contents

- [Quick Start](#quick-start)
  - [CLI Tool](#cli-tool)
    - [Generate Artwork](#generate-artwork-cli)
    - [Upload to Pinata](#upload-to-pinata-cli)
  - [NPM Package](#npm-package)
    - [Generate Artwork](#generate-artwork-npm)
    - [Upload to Pinarta](#upload-to-pinata-npm)
- [Contribute](#contribute)
- [Support Us](#support-us)

## Quick Start

### CLI Tool

```bash
$ git clone https://github.com/noodleofdeath/ez-nft
$ cd ez-nft
$ npm install
$ ./eznft.ts
usage: eznft.ts [-h] [-v] {deploy,d,dep,generate,g,gen,mint,m,upload,u,up} ...

eznft.ts v0.0.1
Yet another library for generating NFT artwork, uploading NFT assets and metadata to IPFS, deploying NFT smart contracts, and minting NFT collections

positional arguments:
  {deploy,d,dep,generate,g,gen,mint,m,upload,u,up}
    deploy (d, dep)     deploy a smart contract
    generate (g, gen)   generate NFT artwork
    mint (m)            mint an NFT asset
    upload (u, up)      upload an NFT asset to IPFS

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
```

#### Generate Artwork (CLI)

Generate 10 unique pieces of artwork using the [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine).

```bash
$ ./eznft.ts gen --layers ~/my-nft-project/layers --output ~/my-nft-project/output --size 10 --very-verbose
INFO: downloaded archive to /Users/tmorgan/.gitly/github/HashLips/hashlips_art_engine/v1.1.2_patch_v6.tar.gz
INFO: Copied repo to: /var/folders/k5/p95sjcmx26z4yz53frn6fskr0000gp/T/ez-nft-0.0.1-1651622515498
INFO: Overwriting layers directory
INFO: Updating project config
INFO: Project config updated
...
Created edition: 1, with DNA: 859736671919e20ed48dbb0f3521b700f838a889
Created edition: 2, with DNA: e0bad3898f2e79d6772dba03dab7dd0480b11ef6
Created edition: 3, with DNA: 421f45fee98666dc9adaa7a623248dd3c9d47d42
Created edition: 4, with DNA: dbc49d670aabe8617230cd244069d0154e4fcb2b
Created edition: 5, with DNA: 5fad8f1c171d518f8bfbf6ec5c6e8c52dea2cfaf
Created edition: 6, with DNA: 97377c9f00df8c41339c37a2d4fc0b562f020d6a
Created edition: 7, with DNA: 882c2efd91611cffacf48abc618215831df367a6
Created edition: 8, with DNA: 6457c9294887610685f703c5bb50eaa7100a8f10
Created edition: 9, with DNA: b2bafedf091f41633d98c34c498bd8cd3fe75260
Created edition: 10, with DNA: b0002582d163bca8b1297ba77db06636e4951560

INFO: Copying assets to output directory ~/my-nft-project/output
INFO: Assets generated. To upload them to pinata with the CLI tool use "eznft.ts upload --source ~/my-nft-project/output"
DONE
```

#### Upload to Pinata (CLI)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

```bash
$ ./eznft.ts upload --source ~/my-nft-project/output --very-verbose
INFO: Loading pinata client
...
Uploaded NFT to ipfs://QmY8MgWHANEXhCN3cit7XTYBFnWKU5Uqbgmto9dJg1knC4
To mint with the CLI tool use "eznft.ts mint ipfs://QmY8MgWHANEXhCN3cit7XTYBFnWKU5Uqbgmto9dJg1knC4"
Uploaded NFT to ipfs://QmXbjdTjmuPTi1JyicTsGRXQ4abBaZejExbzBfdPUZ1tzK
To mint with the CLI tool use "eznft.ts mint ipfs://QmXbjdTjmuPTi1JyicTsGRXQ4abBaZejExbzBfdPUZ1tzK"
Uploaded NFT to ipfs://QmdEVQbx3SET8DPQedtHxHVgWyqRvYZSAC1aHSP435hApq
To mint with the CLI tool use "eznft.ts mint ipfs://QmdEVQbx3SET8DPQedtHxHVgWyqRvYZSAC1aHSP435hApq"
Uploaded NFT to ipfs://QmRzhEr5Kkap3uxxRhwsZFAQqpfBquEW6ZWh6MFyHvCi6c
To mint with the CLI tool use "eznft.ts mint ipfs://QmRzhEr5Kkap3uxxRhwsZFAQqpfBquEW6ZWh6MFyHvCi6c"
Uploaded NFT to ipfs://QmedTYyBL8j1EPZARTkM6bwFHsAFytfS2FWFkm3PSRhLpg
To mint with the CLI tool use "eznft.ts mint ipfs://QmedTYyBL8j1EPZARTkM6bwFHsAFytfS2FWFkm3PSRhLpg"
Uploaded NFT to ipfs://QmbZ1eqWCZ2EGZ1KCntx7TaCAMRANmpaXU5LbnFnZaBrs5
To mint with the CLI tool use "eznft.ts mint ipfs://QmbZ1eqWCZ2EGZ1KCntx7TaCAMRANmpaXU5LbnFnZaBrs5"
Uploaded NFT to ipfs://QmZKQs6LNex7gBeYmDSAsfBsL5om735vs9d9kfnyLTjKvy
To mint with the CLI tool use "eznft.ts mint ipfs://QmZKQs6LNex7gBeYmDSAsfBsL5om735vs9d9kfnyLTjKvy"
Uploaded NFT to ipfs://QmPCFFW3dBrLE3enqVcwZcDthV4uvAEmPHqacFfppJKv2a
To mint with the CLI tool use "eznft.ts mint ipfs://QmPCFFW3dBrLE3enqVcwZcDthV4uvAEmPHqacFfppJKv2a"
DONE
```

### NPM Package

```bash
npm i ez-nft
```

#### Generate Artwork (NPM)

Generate 10 unique pieces of artwork using the [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine).

```typescript
import { HashLipsNftGenerator } from 'ez-nft';
const generatorService = new HashLipsNftGenerator({
  size: 10,
  layers: '~/my-nft-project/layers',
  output: '~/my-nft-project/output',
  logLevel: 7, // ELogLevel.VERBOSE
});
generatorService.generate();
```

#### Upload to Pinata (NPM)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

```typescript
import { PinataUploadService } from 'ez-nft';
const uploadService = new PinataUploadService(logLevel: 7); // VERBOSE
uploadService.uploadAll('~/my-nft-project/output');
```

## Contribute

Feel free to make a pull request if you want to help me implement the rest of these features,
or tweet me on Twitter at [@nftofdeath](https://twitter.com/nftofdeath)

## Support Us

## Support us

If you find this library useful for you, you can support it by donating any amount

`ETH/MATIC: 0x9FE2e80A2fEFE9d38C4689daB25e37f413C68C43`

`BTC: 3HNXnygb1HowTBbvhQrQ4vxekfQ2UM83sd`

`SHIB: 0xBb8f7EbF3D7f54BAcadece3dada9ab2358C90635`
