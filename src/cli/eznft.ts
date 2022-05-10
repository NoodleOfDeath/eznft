#!/usr/bin/env node

// Import modules
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as path from 'path';
import { ArgumentParser, RawDescriptionHelpFormatter } from 'argparse';
import { version, description } from '../package.json';
import { ELogLevel, GeneratorService } from '..';
import { UploadService } from '../core/services/upload/uploader';
import {
  EGeneratorServiceType,
  EServiceType,
  ETaskStatus,
  EUploadServiceType,
  GeneratorServiceType,
  ILayerOptions,
  UploadServiceType,
} from '../types';
import { Project, Workspace } from '../core';

dotenv.config();

export default class CLI {
  public static main(): number {
    function usage() {
      parser.print_help();
      process.exit(-1);
    }

    function addVerbosityFlags(parser: ArgumentParser) {
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

    const __this = path.basename(__filename).replace(/\.[tj]s$/gi, '');

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
    addVerbosityFlags(initParser);

    const configParser = subparsers.add_parser('config', { help: 'list or set enzft configurations' });
    addVerbosityFlags(configParser);

    const resumeParser = subparsers.add_parser('resume', { help: 'resume a session that was interrupted' });
    resumeParser.add_argument('session', {
      type: 'int',
      default: null,
      help: 'the session to attempt resuming. required if there are multiple sessions that can be resumed.',
      nargs: '?',
    });
    addVerbosityFlags(resumeParser);

    subparsers.add_parser('clean', { help: 'cleans the current eznft workspace' });

    const generateParser = subparsers.add_parser('generate', { aliases: ['g', 'gen'], help: 'generate NFT artwork' });
    generateParser.add_argument('layers', {
      help: 'directory containing the layers to generate artwork from',
      nargs: '?',
    });
    generateParser.add_argument('size', {
      type: 'int',
      help: 'size of the collection to generate',
      nargs: '?',
    });
    generateParser.add_argument('-e', '--engine', {
      choices: [EGeneratorServiceType.HASHLIPS],
      default: EGeneratorServiceType.HASHLIPS,
      help: 'engine to use for nft generation (default: %(default)s)',
      nargs: '?',
    });
    generateParser.add_argument('--order', {
      help:
        'order to stack layers with the bottom one listed first separated by commans (i.e. "background, body, eyes, glasses")',
    });
    generateParser.add_argument('--opt', {
      help: `specify multiple options for each layer (i.e. ${chalk.grey(
        `--opt 'Background/opacity:0.5, displayName:"Background Color"' 'Fur/displayName: "Fur Color"'`,
      )})`,
      nargs: '*',
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
    addVerbosityFlags(generateParser);

    const uploadParser = subparsers.add_parser('upload', { aliases: ['u', 'up'], help: 'upload an NFT asset to IPFS' });
    uploadParser.add_argument('source', {
      help: 'source directory to upload NFT assets from',
      nargs: '?',
    });
    uploadParser.add_argument('-i', '--ipfs', {
      choices: [EUploadServiceType.PINATA],
      default: EUploadServiceType.PINATA,
      help: 'ipfs service to upload nft assets to (default: %(default)s)',
      nargs: '?',
    });
    addVerbosityFlags(uploadParser);

    // const deployParser = subparsers.add_parser('deploy', { aliases: ['d', 'dep'], help: 'deploy a smart contract' });
    // deployParser.add_argument('contract', {
    //   help: 'path of contract to deploy (.sol file)',
    // });
    // deployParser.add_argument('network', {
    //   default: 'ropsten',
    //   help: 'network to deploy contract to (default: %(default)s)',
    //   nargs: '?',
    // });
    // addCommonArgs(deployParser);

    // const mintParser = subparsers.add_parser('mint', { aliases: ['m'], help: 'mint an NFT asset' });
    // mintParser.add_argument('contract', {
    //   help: 'contract to mint with',
    // });
    // mintParser.add_argument('url', {
    //   help: 'ipfs url to mint. may be of the format "ipfs://<cid>" or just "<cid>"',
    // });
    // addCommonArgs(mintParser);

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

    const project = new Project({ logLevel });
    const workspace = new Workspace({ logLevel });

    if (/^init$/i.test(command)) {
      // INIT
      // TODO: INIT
      project.init();
    } else if (/^config$/i.test(command)) {
      // CONFIG
      // TODO: CONFIG
    } else if (/^clean$/i.test(command)) {
      // CLEAN
      workspace.clean();
    } else if (/^g(en|enerate)?$/i.test(command)) {
      // GENERATE
      const serviceName = (args.engine as GeneratorServiceType) || project.generate?.serviceName;
      const layers = (args.layers as string) || project.generate?.layers;
      if (!layers) {
        console.log(
          'ERROR: Could not find a required "layers" setting in the project config or passed as an argument.',
        );
        process.exit(-1);
      }
      const size = (args.size as number) || project.generate?.size;
      if (!size) {
        console.log('ERROR: Could not find a required "size" setting in the project config or passed as an argument.');
        process.exit(-1);
      }
      const layerOrder = ((args.order as string)?.split(/\s*,\s*/g) || project.generate?.layerOrder || []).reverse();
      const layerOptions = (args.opt || project.generate?.layerOptions || []) as
        | string
        | string[]
        | Record<string, ILayerOptions>;
      const prefix = (args.prefix as string) || project.generate?.prefix;
      const description = (args.description as string) || project.generate?.description;
      const outputDir = (args.outputDir as string) || project.generate?.outputDir;
      const generatorService = GeneratorService.load({
        serviceName,
        logLevel,
        layers,
        size,
        layerOrder,
        layerOptions,
        prefix,
        description,
        outputDir,
      });
      generatorService.generate();
    } else if (/^u(p|pload)?$/i.test(command)) {
      // UPLOAD
      const serviceName = (args.ipfs as UploadServiceType) || project.upload?.serviceName;
      const source = (args.source as string) || project.upload?.source;
      const apiKey = process.env[`${serviceName.toUpperCase()}_API_KEY`];
      const secretApiKey = process.env[`${serviceName.toUpperCase()}_SECRET_API_KEY`];
      const uploadService = UploadService.load({
        serviceName,
        logLevel,
        apiKey,
        secretApiKey,
      });
      uploadService.uploadAll(source);
    } else if (/^d(ep|eploy)?$/i.test(command)) {
      // DEPLOY
      // TODO: - Deploy
    } else if (/^m(int)?$/i.test(command)) {
      // MINT
      // TODO: - Mint
    } else if (/^resume$/i.test(command)) {
      // RESUME
      let sessionIndex = args.session as number;
      workspace.getSessions().then(sessions => {
        if (sessions.length === 0) {
          console.log(`No sessions to resume`);
        } else {
          if (sessions.length === 1) {
            sessionIndex = 0;
          }
          if (sessionIndex === null || sessionIndex === undefined) {
            console.log(
              [
                '',
                `multiple sessions exist that were interrupted.`,
                `either specfiy a session below, or clean the workspace with "${__this} clean"`,
                '',
              ].join('\n'),
            );
            sessions.forEach((session, i) => {
              const id = session.command?.splice(2).join(' ') || `${session.service}`;
              const date = new Date(session.started).toLocaleDateString(undefined, {
                hour: 'numeric',
                minute: 'numeric',
              });
              const completedTasks = session.tasks?.filter(task => task.status === ETaskStatus.SUCCESS) || [];
              const progress = `${completedTasks.length} out of ${session.tasks?.length || 0} tasks completed`;
              console.log([`${i} - [${date}]`, `\t${__this} ${id}`, `\t${progress}`].join('\n'));
            });
          } else {
            const session = sessions[sessionIndex];
            if (session.service.serviceType === EServiceType.GENERATOR_SERVICE) {
            } else if (session.service.serviceType === EServiceType.UPLOAD_SERVICE) {
              const service = UploadService.load({
                serviceName: session.service.serviceName,
                apiKey: process.env[`${session.service.serviceName.toUpperCase()}_API_KEY`],
                secretApiKey: process.env[`${session.service.serviceName.toUpperCase()}_SECRET_API_KEY`],
              });
              console.log(`Resuming session ${sessionIndex}`);
              try {
                service.resume(session).catch(e => console.error(e));
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      });
    } else {
      usage();
    }

    return 0;
  }
}

CLI.main();
