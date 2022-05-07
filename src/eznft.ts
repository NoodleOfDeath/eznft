#!/usr/bin/env node

// Import modules
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as path from 'path';
import { ArgumentParser, RawDescriptionHelpFormatter } from 'argparse';
import { version, description } from './package.json';
import { ELogLevel, GeneratorServiceProvider } from '.';
import { UploadServiceProvider } from './core/services/upload/uploader';
import { EGeneratorServiceType, EUploadServiceType, GeneratorServiceType, UploadServiceType } from './types';
import { Project, Workspace } from './core';

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
      parser.add_argument('-q', '--quiet', { action: 'store_true', help: 'display console messages discreetly' });
      parser.add_argument('-vq', '--very-quiet', {
        action: 'store_true',
        help: 'display console messages very discreetly',
      });
      parser.add_argument('-v', '--verbose', { action: 'store_true', help: 'display most console messages' });
      parser.add_argument('-vv', '--very-verbose', {
        action: 'store_true',
        help: 'display all console messages including debug messages',
      });
    }

    const __this = path.basename(__filename, '.js');

    class HelpFormatter extends RawDescriptionHelpFormatter {
      _split_lines(text: string) {
        return text.split('\n');
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

    const initParser = subparsers.add_parser('init', {
      help: 'initialize a new nft project in the current working directory',
    });
    addCommonArgs(initParser);

    const configParser = subparsers.add_parser('config', { help: 'list or set enzft configurations' });
    addCommonArgs(configParser);

    subparsers.add_parser('clean', { help: 'cleans the current eznft workspace' });

    const generateParser = subparsers.add_parser('generate', { aliases: ['g', 'gen'], help: 'generate NFT artwork' });
    generateParser.add_argument('-e', '--engine', {
      choices: [EGeneratorServiceType.HASHLIPS],
      default: EGeneratorServiceType.HASHLIPS,
      help: 'engine to use for nft generation (default: %(default)s)',
      nargs: '?',
    });
    generateParser.add_argument('-l', '--layers', {
      help: 'directory containing the layers to generate artwork from',
      required: true,
    });
    generateParser.add_argument('-s', '--size', {
      type: 'int',
      help: 'size of the collection to generate',
      required: true,
    });
    generateParser.add_argument('-p', '--prefix', {
      default: 'No Prefix',
      help: `name of the prefix to use for each NFT name generated (i.e. ${chalk.yellowBright(
        `PomksyPunks`,
      )} #140) (default: %(default)s)`,
    });
    generateParser.add_argument('-d', '--description', {
      default: 'No description',
      help: 'description of the collection (default: %(default)s)',
    });
    generateParser.add_argument('-o', '--outputDir', {
      help: 'directory to output generated images and metadata to',
    });
    addCommonArgs(generateParser);

    const uploadParser = subparsers.add_parser('upload', { aliases: ['u', 'up'], help: 'upload an NFT asset to IPFS' });
    uploadParser.add_argument('resume', {
      help: 'resume a paused or interrupted upload session',
      nargs: '?',
    });
    uploadParser.add_argument('-i', '--ipfs', {
      choices: [EUploadServiceType.PINATA],
      default: EUploadServiceType.PINATA,
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

    const mintParser = subparsers.add_parser('mint', { aliases: ['m'], help: 'mint an NFT asset' });
    mintParser.add_argument('contract', {
      help: 'contract to mint with',
    });
    mintParser.add_argument('url', {
      help: 'ipfs url to mint. may be of the format "ipfs://<cid>" or just "<cid>"',
    });
    addCommonArgs(mintParser);

    args = parser.parse_args();

    const command = args.command as string;
    const logLevel = (args.very_verbose as boolean)
      ? ELogLevel.ALL
      : (args.verbose as boolean)
      ? ELogLevel.VERBOSE
      : (args.very_quiet as boolean)
      ? null
      : (args.quiet as boolean)
      ? ELogLevel.LOG
      : ELogLevel.ESSENTIAL;

    if (/^init$/i.test(command)) {
      // INIT
      // TODO: INIT
      Project.default.init();
    } else if (/^config$/i.test(command)) {
      // CONFIG
      // TODO: CONFIG
    } else if (/^clean$/i.test(command)) {
      // CLEAN
      Workspace.default.clean();
    } else if (/^g(en|enerate)?$/i.test(command)) {
      // GENERATE
      const serviceType = args.engine as GeneratorServiceType;
      const size = args.size as number;
      const layers = args.layers as string;
      const prefix = args.prefix as string;
      const description = args.description as string;
      const outputDir = args.outputDir as string;
      const generatorService = new GeneratorServiceProvider({
        logLevel,
        size,
        layers,
        prefix,
        description,
        outputDir,
        type: serviceType,
      });
      generatorService.generate();
    } else if (/^d(ep|eploy)?$/i.test(command)) {
      // DEPLOY
      // TODO: - Deploy
    } else if (/^m(int)?$/i.test(command)) {
      // MINT
      // TODO: - Mint
    } else if (/^u(p|pload)?$/i.test(command)) {
      // UPLOAD
      const serviceType = args.ipfs as UploadServiceType;
      const source = args.source as string;
      const apiKey = process.env[`${serviceType.toUpperCase()}_API_KEY`] || args.api_key;
      const secretApiKey = process.env[`${serviceType.toUpperCase()}_SECRET_API_KEY`] || args.secret_api_key;
      const uploadService = new UploadServiceProvider({
        logLevel,
        apiKey,
        secretApiKey,
        type: serviceType,
      });
      uploadService.uploadAll(source);
    } else {
      usage();
    }

    return 0;
  }
}

CLI.main();
