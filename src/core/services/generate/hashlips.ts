import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { download, extract } from 'gitly';
import { ELogLevel, IGeneratorService } from '../../../types';
import { ABaseGeneratorService } from './generator';

export class HashLipsGeneratorService extends ABaseGeneratorService implements IGeneratorService {
  public readonly serviceName = HashLipsGeneratorService.name;
  private readonly repo = 'HashLips/hashlips_art_engine#v1.1.2_patch_v6';

  private get repoDir(): string {
    return this.outputDir || path.join(this.sessionDir, 'repo');
  }

  private get buildDir(): string {
    return this.outputDir || path.join(this.sessionDir, 'build');
  }

  public generate(): Promise<void> {
    this.session = this.workspace.session();
    return new Promise<void>((resolve, reject) => {
      this.downloadRepo(this.repoDir)
        .then(dest => {
          this.INFO(`Copied repo to: ${dest}`);
          this.INFO(`Overwriting layers directory`);
          const layers = fs
            .readdirSync(this.layers)
            .filter(layer => !/^\./.test(layer) && fs.readdirSync(path.join(this.layers, layer)).length > 0);
          fs.removeSync(path.join(dest, 'layers'));
          fs.copySync(this.layers, path.join(dest, 'layers'));
          this.INFO(`Updating project config`);
          let config = fs.readFileSync(path.join(dest, 'src', 'config.js'), { encoding: 'utf8' });
          config = config
            .replace(/const namePrefix .*?";/i, `const namePrefix = "${this.prefix}";`)
            .replace(/const description .*?";/i, `const description = "${this.description}";`)
            .replace(
              /const layerConfigurations[\s\S]*?];/i,
              `const layerConfigurations = [${JSON.stringify(
                {
                  growEditionSizeTo: this.size,
                  layersOrder: layers.map(layer => ({ name: layer })),
                },
                null,
                2,
              )}];`,
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
          resolve();
        })
        .catch((error: Error) => this.ERROR(error, null, reject));
    });
  }

  public resume(): void {}

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
