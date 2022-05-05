# eznft

[![npm](https://img.shields.io/npm/dm/eznft.svg?maxAge=600)](https://www.npmjs.com/package/eznft)
[![npm](https://img.shields.io/npm/l/eznft.svg?maxAge=600)](https://github.com/noodleofdeath/eznft/blob/main/LICENSE)

---

Yet another library for generating NFT artwork, uploading NFT assets and metadata to IPFS, deploying NFT smart contracts, and minting NFT collections

---

## Table of Contents

- [Quick Start](#quick-start)
  - [CLI Tool](#cli-tool)
    - [Generate Artwork](#generate-artwork-cli)
    - [Upload to Pinata](#upload-to-pinata-cli)
  - [NPM Module](#npm-module)
    - [Generate Artwork](#generate-artwork-npm)
    - [Upload to Pinarta](#upload-to-pinata-npm)
- [Contribute](#contribute)
- [Support Us](#support-us)

## Quick Start

### CLI Tool

Install `eznft` as a global NPM package to use it in the command line.

```bash
$ npm i -g eznft
$ eznft
usage: eznft [-h] [-v] {deploy,d,dep,generate,g,gen,mint,m,upload,u,up} ...
...
```

#### Generate Artwork (CLI)

Generate 10 unique pieces of artwork using the [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine).

__Note:__ HashLips is the default generator if the `--engine` flag is not specified.

```bash
$ eznft gen --layers ~/my-nft-project/layers --output ~/my-nft-project/output --size 10 --very-verbose
...
DONE
```

#### Upload to Pinata (CLI)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

__Note:__ Pinata is the default upload service if the `--ipfs` flag is not specified.

```bash
$ eznft upload --source ~/my-nft-project/output --very-verbose
...
DONE
```

### NPM Module

```bash
npm i eznft
```

#### Generate Artwork (NPM)

Generate 10 unique pieces of artwork using the [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine).

__Note:__ HashLips is the default generator if the `type` option is not specified.

```typescript
import { NftGeneratorProvider } from "eznft";
const generatorService = new NftGeneratorProvider({
  type: "hashlips",
  size: 10,
  layers: '~/my-nft-project/layers',
  output: '~/my-nft-project/output',
  logLevel: 7, // VERBOSE,
});
generatorService.generate();
```

#### Upload to Pinata (NPM)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

__Note:__ Pinata is the default upload service if the `type` option is not specified.

```typescript
import { UploadServiceProvider } from 'eznft';
const uploadService = new UploadServiceProvider({
  type: "pinata",
  apiKey: process.env.PINATA_API_KEY,
  secretApiKey: process.env.PINATA_SECRET_API_KEY,
  logLevels: 7, // VERBOSE
});
uploadService.uploadAll('~/my-nft-project/output');
```

## Contribute

Feel free to make a pull request if you want to help me implement the rest of these features,
or tweet me on Twitter at [@nftofdeath](https://twitter.com/nftofdeath)

## Support Us

If you find this library useful for you, you can support it by donating any amount

`ETH/MATIC: 0x9FE2e80A2fEFE9d38C4689daB25e37f413C68C43`

`BTC: 3HNXnygb1HowTBbvhQrQ4vxekfQ2UM83sd`

`SHIB: 0xBb8f7EbF3D7f54BAcadece3dada9ab2358C90635`
