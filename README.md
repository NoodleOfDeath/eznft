# eznft

[![npm](https://img.shields.io/npm/dm/eznft.svg?maxAge=600)](https://www.npmjs.com/package/eznft)
[![npm](https://img.shields.io/npm/l/eznft.svg?maxAge=600)](https://github.com/noodleofdeath/eznft/blob/main/LICENSE)

---

Yet another library for generating NFT artwork, uploading NFT assets and metadata to IPFS, deploying NFT smart contracts, and minting NFT collections

---

## Table of Contents

- [Quick Start](#quick-start)
  - [CLI Tool](#cli-tool)
    - [Installation](#installation-cli)
    - [Generate Artwork](#generate-artwork-cli)
    - [Upload to Pinata](#upload-to-pinata-cli)
    - Resume Interrupted Session
    - Deploy Smart Contract (TBC)
    - Mint NFT (TBC)
  - [NPM Module](#npm-module)
    - [Installation Module](#installation-module)
    - [Generate Artwork](#generate-artwork-module)
    - [Upload to Pinarta](#upload-to-pinata-module)
    - [Resume Interrupted Session](#resume-interrupted-session-cli)
    - Deploy Smart Contract (TBC)
    - Mint NFT (TBC)
- [Contribute](#contribute)
- [Support Us](#support-us)

## Quick Start

### CLI Tool

#### Installation (CLI)

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
$ eznft gen ~/my-nft-project/layers 10 --output ~/my-nft-project/output
...
DONE
```

#### Upload to Pinata (CLI)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

__Note:__ Pinata is the default upload service if the `--ipfs` flag is not specified.

```bash
$ eznft upload ~/my-nft-project/output --very-verbose
...
DONE
```

### Resume Interrupted Session (CLI)

```bash
$ eznft resume
multiple sessions exist that were interrupted.
either specfiy a session below, or clean the workspace with "eznft clean"

0 - [5/9/2022, 4:06 PM]
  eznft resume 1
  5 out of 7 tasks completed
1 - [5/9/2022, 4:05 PM]
  eznft up /Users/tmorgan/Desktop/nfts
  3 out of 10 tasks completed
$ eznft resume 0
[ 5/7 -  71%] Uploaded JSON file for "Test #4" to ipfs://QmejjYUqofjvWX7WTg74sPxL6gwQymwiJru9BaSASNCjcR
```

### NPM Module

#### Installation (Module)

```bash
npm i eznft
```

#### Generate Artwork (Module)

Generate 10 unique pieces of artwork using the [HashLips Art Engine](https://github.com/HashLips/hashlips_art_engine).

__Note:__ HashLips is the default generator if the `type` option is not specified.

```typescript
import { GeneratorService } from "eznft";
const generatorService = GeneratorService.load({
  // Number of unique NFTs to create.
  size: 10, 
  // Folder should contain an 'images' and 'json' folder
  layers: '~/my-nft-project/layers', 
  // Names folders in 'images', in order of bottom to top
  layerOrder: ['Background', 'Fur', 'Eyes', 'Eyewear', 'Accessory'], 
  // Where to ouput. default is `${process.cwd()}/.eznft/${service-session}/build`.
  outputDir: '~/my-nft-project/output', 
  // Prefix of each NFT generated in this collection.
  prefix: 'Pomsky Punks',
  // The collection description.
  description: 'The cutest NFT collection ever!', 
  // Options per layer specific to HashLips
  opt: {
    Background: {
      opacity: 0.5,
      displayName: "Background Color",
    },
    Fur: {
      displayName: "Fur Color",
    },
    Eyes: {
      displayName: "Eye Color",
    },
  },
  // Log everything to the console except DEBUG messages.
  logLevel: "most", // VERBOSE = LOG | INFO | WARN | ERROR,
  // Type of generator to use. Defaults to "hashlips"
  type: "hashlips",
});
generatorService.generate();
```

#### Upload to Pinata (Module)

Generate API keys for Pinata [here](https://app.pinata.cloud/keys) then
add `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` to your `.env` file. See [.env-example](.env-example).

__Note:__ Pinata is the default upload service if the `type` option is not specified.

```typescript
import { UploadService } from 'eznft';
const uploadService = UploadService.load({
  apiKey: process.env.PINATA_API_KEY,
  secretApiKey: process.env.PINATA_SECRET_API_KEY,
  // Log everything to the console except DEBUG messages.
  logLevel: "most", // VERBOSE = LOG | INFO | WARN | ERROR,
  // Type of upload to use. Defaults to "hashlips"
  type: "pinata",
});
uploadService.uploadAll('~/my-nft-project/output');
```

## Contribute

Feel free to make a pull request if you want to help me implement the rest of these features,
or tweet me on Twitter at [@nftofdeath](https://twitter.com/nftofdeath)

### Development

When developing (on UNIX kernel), you can use the bash script in the root git directory which points
to the CLI target in [`src/cli/eznft.ts`](https://github.com/NoodleOfDeath/eznft/blob/main/src/cli/eznft.ts).

```bash
./eznft
```

For Windows you will need to run `ts-node src/cli/eznft.ts`.

## Support Us

If you find this library useful for you, you can support it by donating any amount

`ETH/MATIC: 0x9FE2e80A2fEFE9d38C4689daB25e37f413C68C43`

`BTC: 3HNXnygb1HowTBbvhQrQ4vxekfQ2UM83sd`

`SHIB: 0xBb8f7EbF3D7f54BAcadece3dada9ab2358C90635`
