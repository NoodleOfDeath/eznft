import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { download, extract } from 'gitly';
import { ELogLevel, IGeneratorService, ILayerOptions } from '../../../types';
import { ABaseGeneratorService } from './generator';

export interface IHashLipsGeneratorServiceLayerOptions extends ILayerOptions {
  bypassDNA?: boolean;
  blend?: string;
  opacity?: number;
  displayName?: string;
}

export class HashLipsGeneratorService extends ABaseGeneratorService implements IGeneratorService {
  public readonly serviceName = 'HASHLIPS';
  private readonly repo = 'HashLips/hashlips_art_engine#v1.1.2_patch_v6';

  private get repoDir(): string {
    return this.outputDir || path.join(this.sessionDir, 'repo');
  }

  private get buildDir(): string {
    return this.outputDir || path.join(this.sessionDir, 'build');
  }

  public generate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.downloadRepo(this.repoDir)
        .then(dest => {
          this.INFO(`Copied repo to: ${dest}`);
          this.INFO(`Overwriting layers directory`);
          this.DEBUG(`Ignoring layer directories that contain no files.`);
          const layers = fs.readdirSync(this.layers).filter(layer => {
            const isDirectory = fs.lstatSync(path.join(this.layers, layer)).isDirectory();
            if (!isDirectory) {
              this.DEBUG(`Ignoring file "${layer}"`);
              return false;
            } else {
              const isEmpty = fs.readdirSync(path.join(this.layers, layer)).length === 0;
              const valid = isDirectory && !isEmpty;
              if (!valid) this.DEBUG(`Ignoring empty layer directory "${layer}"`);
              return valid;
            }
          });
          Object.keys(this.layerOptions).forEach(option => {
            if (!layers.includes(option)) {
              this.WARN(
                [
                  `Specified options for a layer that does not appear to exist with the subdirectory name "${option}" in "${this.layers}"`,
                  `But there does exist ${layers
                    .filter(layer => new RegExp(option, 'ig').test(layer))
                    .map(layer => `"${layer}"`)
                    .join(', ')}`,
                ].join('\n'.padEnd(9, ' ')),
              );
            }
          });
          const layerMap = [...layers]
            .sort((a, b) => this.layerOrder.indexOf(b) - this.layerOrder.indexOf(a))
            .map(layer => {
              let options = this.layerOptions[layer];
              if (!options) {
                this.DEBUG(`Layer ${layer} has no options specified.`);
                options = {};
              }
              return { name: layer, options: options };
            });
          this.DEBUG(`Generated sorted layer map: ${layerMap.map(entry => `${entry.name}`).join(', ')}`);
          fs.removeSync(path.join(dest, 'layers'));
          fs.copySync(this.layers, path.join(dest, 'layers'));
          this.INFO(`Updating project config`);
          let config = fs.readFileSync(path.join(dest, 'src', 'config.js'), { encoding: 'utf8' });
          this.DEBUG(`Updating name prefix to ${this.prefix}`);
          config = config.replace(/const namePrefix .*?";/i, `const namePrefix = "${this.prefix}";`);
          this.DEBUG(`Updating collection description to ${this.description}`);
          config = config.replace(/const description .*?";/i, `const description = "${this.description}";`);
          const layerConfig = {
            growEditionSizeTo: this.size,
            layersOrder: layerMap,
          };
          this.DEBUG(`Updating layer configurations to:\n${JSON.stringify(layerConfig, null, 2)}`);
          config = config.replace(
            /const layerConfigurations[\s\S]*?];/i,
            `const layerConfigurations = [${JSON.stringify(layerConfig, null, 2)}];`,
          );
          fs.writeFileSync(path.join(dest, 'src', 'config.js'), config);
          this.INFO(`Project config updated`);
          this.INFO(`Running NPM install`);
          (
            execSync('npm install', {
              cwd: dest,
              encoding: 'utf8',
              stdio: this.logLevel & ELogLevel.DEBUG ? 'inherit' : 'pipe',
            }) || ''
          )
            .split('\n')
            .forEach(line => {
              if (this.logLevel & ELogLevel.DEBUG) this.DEBUG(line, { piped: true });
            });
          this.INFO(`Running NPM build`);
          (
            execSync('npm run build', {
              cwd: dest,
              encoding: 'utf8',
              stdio: this.logLevel & ELogLevel.DEBUG ? 'inherit' : 'pipe',
            }) || ''
          )
            .split('\n')
            .filter(line => this.logLevel & ELogLevel.DEBUG || /^Created/i.test(line))
            .forEach(line => {
              if (this.logLevel & ELogLevel.DEBUG) this.DEBUG(line, { piped: true });
              else this.LOG(line, { piped: true });
            });
          this.INFO(`Copying assets to output directory ${this.buildDir}`);
          if (fs.existsSync(this.buildDir)) fs.removeSync(this.buildDir);
          fs.mkdirSync(this.buildDir, { recursive: true });
          fs.copySync(path.join(dest, 'build'), this.buildDir);
          this.INFO(
            `Assets generated. To upload them to pinata with the CLI tool use "eznft upload --source ${this.buildDir}"`,
          );
          this.LOG('DONE');
          this.stop();
          resolve();
        })
        .catch((error: Error) => this.ERROR(error, null, reject));
    });
  }

  private downloadRepo(dest: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (dest) {
        if (fs.existsSync(dest)) {
          resolve(dest);
          return;
        }
        fs.mkdirSync(dest, { recursive: true });
      }
      download(this.repo)
        .then(archive => {
          this.INFO(`Downloaded archive to ${archive}`);
          extract(archive, dest)
            .then(d => resolve(d))
            .catch((error: Error) => this.ERROR(error, null, reject));
        })
        .catch((error: Error) => this.ERROR(error, null, reject));
    });
  }
}
