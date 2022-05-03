#!/usr/bin/env ts-node

// Import modules
import 'dotenv/config';
import { ArgumentParser, RawDescriptionHelpFormatter } from 'argparse';
import * as colors from 'ansi-colors';
import { version, description } from './package.json';
import * as path from 'path';
import { exit } from 'process';

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

const subparsers = parser.add_subparsers();

const deployParser = subparsers.add_parser('deploy');
deployParser.add_argument('contract', {
  help: 'path of contract to deploy (.sol file)',
});
deployParser.add_argument('network', {
  default: 'ropsten',
  help: 'network to deploy contract to (default: %(default)s)',
});

const generateParser = subparsers.add_parser('generate');
generateParser.add_argument('engine', {
  default: 'hashlips',
  help: 'engine to use for nft generation (default: %(default)s)',
});
generateParser.add_argument('layers', {
  help: 'directory of the layers to generate from',
});

const mintParser = subparsers.add_parser('mint');
mintParser.add_argument('contract', {
  help: 'contract to mint with',
});
mintParser.add_argument('url', {
  help: 'ipfs url to mint. may be of the format "ipfs://<cid>" or just "<cid>"',
});

const uploadParser = subparsers.add_parser('upload');
uploadParser.add_argument('ipfs', {
  default: 'pinata',
  help: 'ipfs service to upload nft assets to (default: %(default)s)',
});

parser.add_argument('-v', '--version', { action: 'version', version });

const args = parser.parse_args();
console.log(args);

function usage() {
  parser.print_help();
  exit();
}

usage();
