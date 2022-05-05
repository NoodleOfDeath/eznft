import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { download, extract } from 'gitly';
import { INftGenerator } from '../../types';
import { ABaseNftGenerator } from './generator';

export class HashLipsNftGenerator extends ABaseNftGenerator implements INftGenerator {
  private readonly repo = 'HashLips/hashlips_art_engine#v1.1.2_patch_v6';

  private get repoDest(): string {
    return path.join(os.tmpdir(), `eznft-${new Date().valueOf()}`);
  }

  public generate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.downloadRepo(this.repoDest)
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
          config = config.replace(
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
          this.INFO(execSync('npm install && npm run build', { cwd: dest, encoding: 'utf8' }));
          this.INFO(`Copying assets to output directory ${this.output}`);
          if (fs.existsSync(this.output)) fs.removeSync(this.output);
          fs.mkdirSync(this.output, { recursive: true });
          fs.copySync(path.join(dest, 'build'), this.output);
          this.INFO(
            `Assets generated. To upload them to pinata with the CLI tool use "eznft upload --source ${this.output}"`,
          );
          console.log('DONE');
          resolve();
        })
        .catch((error: Error) => reject(error));
    });
  }

  private downloadRepo(dest: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (dest) {
        if (fs.existsSync(dest)) {
          resolve(dest);
          return;
        }
        fs.mkdirSync(dest);
      }
      download(this.repo)
        .then(archive => {
          this.INFO(`downloaded archive to ${archive}`);
          extract(archive, dest)
            .then(d => resolve(d))
            .catch((error: Error) => reject(error));
        })
        .catch((error: Error) => reject(error));
    });
  }
}
