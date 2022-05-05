#!/usr/bin/env node

// Import modules
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as path from 'path';
import { ArgumentParser, RawDescriptionHelpFormatter } from 'argparse';
import { version, description } from './package.json';
import { ELogLevel, ENftGeneratorService, NftGeneratorProvider } from '.';
import { UploadServiceProvider } from './services/upload/uploader';
import { EIpfsUploadService } from './types';

dotenv.config();

export default class CLI {
  public static main(): number {
    function exit(status: number = 0, message: string = '') {
      parser.exit(status, message);
    }

    function usage() {
      parser.print_help();
      exit();
    }

    function addCommonArgs(parser: ArgumentParser) {
      parser.add_argument('-v', '--verbose', { action: 'store_true', help: 'display all console messages' });
      parser.add_argument('-vv', '--very-verbose', { action: 'store_true', help: 'display all console messages' });
    }

    const __this = path.basename(__filename, '.js');

    class HelpFormatter extends RawDescriptionHelpFormatter {
      _split_lines(text: string, width: number) {
        return [].concat(...text.split('\n'));
      }
    }

    let args: any = {};
    const parser = new ArgumentParser({
      description: [chalk.yellowBright(`${__this} v${version}`), chalk.cyanBright(description)].join('\n'),
      formatter_class: HelpFormatter,
    });
    parser.add_argument('-v', '--version', { action: 'version', version });

    const subparsers = parser.add_subparsers({
      dest: 'command',
    });

    const deployParser = subparsers.add_parser('deploy', { aliases: ['d', 'dep'], help: 'deploy a smart contract' });
    deployParser.add_argument('contract', {
      help: 'path of contract to deploy (.sol file)',
    });
    deployParser.add_argument('network', {
      default: 'ropsten',
      help: 'network to deploy contract to (default: %(default)s)',
      nargs: '?',
    });
    addCommonArgs(deployParser);

    const generateParser = subparsers.add_parser('generate', { aliases: ['g', 'gen'], help: 'generate NFT artwork' });
    generateParser.add_argument('-e', '--engine', {
      choices: [ENftGeneratorService.HashLips],
      default: 'hashlips',
      help: 'engine to use for nft generation (default: %(default)s)',
      nargs: '?',
    });
    generateParser.add_argument('-l', '--layers', {
      help: 'directory containing the layers to generate artwork from',
      required: true,
    });
    generateParser.add_argument('-o', '--output', {
      help: 'directory to output generated images and metadata to',
      required: true,
    });
    generateParser.add_argument('-s', '--size', {
      type: 'int',
      help: 'size of the collection to generate',
      required: true,
    });
    generateParser.add_argument('-c', '--collection', {
      help: 'name of the collection',
      required: true,
    });
    generateParser.add_argument('-d', '--description', {
      help: 'description of the collection',
      required: true,
    });
    addCommonArgs(generateParser);

    const mintParser = subparsers.add_parser('mint', { aliases: ['m'], help: 'mint an NFT asset' });
    mintParser.add_argument('contract', {
      help: 'contract to mint with',
    });
    mintParser.add_argument('url', {
      help: 'ipfs url to mint. may be of the format "ipfs://<cid>" or just "<cid>"',
    });
    addCommonArgs(mintParser);

    const uploadParser = subparsers.add_parser('upload', { aliases: ['u', 'up'], help: 'upload an NFT asset to IPFS' });
    uploadParser.add_argument('-i', '--ipfs', {
      choices: [EIpfsUploadService.Pinata],
      default: 'pinata',
      help: 'ipfs service to upload nft assets to (default: %(default)s)',
      nargs: '?',
    });
    uploadParser.add_argument('-s', '--source', {
      help: 'source directory to upload NFT assets from',
      required: true,
    });
    uploadParser.add_argument('--api-key', {
      help: `ipfs api key (default: <IPFS>_API_KEY)`,
    });
    uploadParser.add_argument('--secret-api-key', {
      help: `ipfs secret api key (default: <IPFS>_SECRET_API_KEY)`,
    });
    addCommonArgs(uploadParser);

    args = parser.parse_args();

    const command = args.command as string;
    const logLevel = (args.very_verbose as boolean)
      ? ELogLevel.VERBOSE
      : (args.verbose as boolean)
      ? ELogLevel.MOST
      : null;

    if (/^d(ep|eploy)?$/i.test(command)) {
      // TODO: - Deploy
    } else if (/^g(en|enerate)?$/i.test(command)) {
      const engine = args.engine as string;
      const size = args.size as number;
      const layers = args.layers as string;
      const output = args.output as string;
      const collection = args.collection as string;
      const description = args.description as string;
      const generatorService = new NftGeneratorProvider({
        type: engine,
        size,
        layers,
        output,
        logLevel,
        collection,
        description,
      });
      generatorService.generate();
    } else if (/^m(int)?$/i.test(command)) {
      // TODO: - Mint
    } else if (/^u(p|pload)?$/i.test(command)) {
      const ipfs = args.ipfs as string;
      const source = args.source as string;
      const apiKey = process.env[`${ipfs.toUpperCase()}_API_KEY`] || args.api_key;
      const secretApiKey = process.env[`${ipfs.toUpperCase()}_SECRET_API_KEY`] || args.secret_api_key;
      const uploadService = new UploadServiceProvider({
        type: ipfs,
        apiKey,
        secretApiKey,
        logLevel,
      });
      uploadService.uploadAll(source);
    } else {
      usage();
    }

    return 0;
  }
}

CLI.main();
