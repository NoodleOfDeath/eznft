#!/usr/bin/env ts-node

// Import modules
import 'dotenv/config';
import { ArgumentParser, RawDescriptionHelpFormatter } from 'argparse';
import * as colors from 'ansi-colors';
import { version, description } from './package.json';
import * as path from 'path';
import { exit } from 'process';
import { ELogLevel, HashLipsNftGenerator } from './src';

function usage() {
  parser.print_help();
  exit();
}

function addCommonArgs(parser: ArgumentParser) {
  parser.add_argument('-v', '--verbose', { action: 'store_true', help: 'display all console messages' });
  parser.add_argument('-vv', '--very-verbose', { action: 'store_true', help: 'display all console messages' });
}

const __this = path.basename(__filename);

class HelpFormatter extends RawDescriptionHelpFormatter {
  _split_lines(text: string, width: number) {
    return [].concat(...text.split('\n'));
  }
}

const parser = new ArgumentParser({
  description: [colors.yellowBright(`${__this} v${version}`), colors.cyanBright(description)].join('\n'),
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
  default: 'hashlips',
  help: 'engine to use for nft generation (default: %(default)s)',
  nargs: '?',
});
generateParser.add_argument('-s', '--size', {
  type: 'int',
  help: 'size of the collection to generate',
});
generateParser.add_argument('-l', '--layers', {
  help: 'directory containing the layers to generate artwork from',
});
generateParser.add_argument('-o', '--output', {
  help: 'directory to output generated images and metadata to',
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
uploadParser.add_argument('ipfs', {
  default: 'pinata',
  help: 'ipfs service to upload nft assets to (default: %(default)s)',
  nargs: '?',
});
addCommonArgs(uploadParser);

const args = parser.parse_args();
console.log(args);

const command = args.command as string;
const logLevel = (args.very_verbose as boolean) ? ELogLevel.VERBOSE : (args.verbose as boolean) ? ELogLevel.MOST : null;

if (/^d(ep|eploy)?$/i.test(command)) {
  // TODO: - Deploy
} else if (/^g(en|enerate)?$/i.test(command)) {
  // TODO: - Generate
  const engine = args.engine as string;
  const size = args.size as number;
  const layers = args.layers as string;
  const output = args.output as string;
  if (/^hashlips$/i.test(engine)) {
    const engine = new HashLipsNftGenerator({
      size: size,
      layers: layers,
      output: output,
      logLevel: logLevel,
    });
    engine.generate();
  }
} else if (/^m(int)?$/i.test(command)) {
  // TODO: - Mint
} else if (/^u(p|pload)?$/i.test(command)) {
  // TODO: - Upload
} else {
  usage();
}
