import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { download, extract } from 'gitly';
import { name, version } from '../../../package.json';
import { ILoggableServiceProps, INftGenerator, INftGeneratorProps } from '../../types';
import { ABaseLoggableService } from '../service';

export interface IHashLipsNftGeneratorProps extends INftGeneratorProps, ILoggableServiceProps {}

export class HashLipsNftGenerator extends ABaseLoggableService<IHashLipsNftGeneratorProps> implements INftGenerator {
  public readonly size: number;
  public readonly layers: string;
  public readonly output: string;

  private readonly repo = 'HashLips/hashlips_art_engine#v1.1.2_patch_v6';

  private get repoDest(): string {
    return path.join(os.tmpdir(), `${name}-${version}-${new Date().valueOf()}`);
  }

  public constructor(props: IHashLipsNftGeneratorProps) {
    super(props);
    this.size = props.size;
    this.layers = path.resolve(props.layers);
    this.output = path.resolve(props.output);
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
