import fs from 'fs';
import os from 'os';
import path from 'path';
import { name, version } from '../../../package.json';
import { INftGenerator } from '../../types';
import { download, extract } from 'gitly';

export class HashLipsNftGenerator implements INftGenerator {
  private readonly repo = 'HashLips/hashlips_art_engine#v1.1.2';
  private dest: string;

  public constructor(props: { dest?: string }) {
    this.dest = props.dest || path.join(os.tmpdir(), `${name}-${version}`);
  }

  public generate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.downloadRepo().then(() => {
        console.log(fs.readdirSync(this.dest));
      });
    });
  }

  private downloadRepo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (fs.existsSync(this.dest)) {
        resolve();
        return;
      }
      download(this.repo)
        .then(archive => {
          extract(archive, this.dest)
            .then(_ => resolve())
            .catch((error: Error) => reject(error));
        })
        .catch((error: Error) => reject(error));
    });
  }
}
