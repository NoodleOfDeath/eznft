import * as fs from 'fs-extra';
import * as path from 'path';
import Bottleneck from 'bottleneck';
import {
  UploadServiceType,
  IIpfsHash,
  IAsset,
  AssetCreate,
  IUploadService,
  IUploadServiceProps,
  IUploadServiceProviderProps,
  EUploadServiceType,
} from '../../../types';
import { ABaseResumableService } from '../resumable';
import { PinataUploadService } from './pin';

export abstract class ABaseUploadService extends ABaseResumableService implements IUploadService {
  public readonly apiKey: string;
  public readonly secretApiKey: string;
  public readonly rate: number;

  public constructor({ logLevel, apiKey, secretApiKey, rate }: IUploadServiceProps) {
    super({ logLevel });
    this.apiKey = apiKey;
    this.secretApiKey = secretApiKey;
    this.rate = rate || 100;
  }

  public abstract upload(asset: IAsset): Promise<IIpfsHash>;

  public uploadAll(source: string): Promise<IIpfsHash[]> {
    this.session = this.workspace.session();
    return new Promise<any>(async (resolve, reject) => {
      const sourcePath = path.resolve(source);
      if (!fs.existsSync(sourcePath)) {
        this.ERROR(`Path "${sourcePath}" does not exists`, null, reject);
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'images'))) {
        this.ERROR(`Source path "${sourcePath}" is missing an "images" directory.`, null, reject);
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'json'))) {
        this.ERROR(`Source path "${sourcePath}" is missing a "json" directory.`, null, reject);
        return;
      }
      const files = fs.readdirSync(path.join(sourcePath, 'images'));
      const scheduler = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1000 / (this.rate / 60 / 2),
      });
      const runSchedule = async (): Promise<IIpfsHash[]> => {
        return Promise.all(
          files.map(async (file, i) => {
            return scheduler
              .schedule(() => this.upload(AssetCreate({ filePath: path.join(sourcePath, 'images', file) })))
              .then(ipfsHash => {
                return new Promise<IIpfsHash>(_resolve => {
                  const matches = /\w+(?=\.)/.exec(file);
                  if (!matches || !matches[0]) {
                    return;
                  }
                  const jsonFile = `${matches[0]}.json`;
                  let json = JSON.parse(fs.readFileSync(path.join(sourcePath, 'json', jsonFile), { encoding: 'utf8' }));
                  json.image = `ipfs://${ipfsHash}`;
                  if (json.compiler) delete json.compiler;
                  fs.writeFileSync(path.join(sourcePath, 'json', jsonFile), JSON.stringify(json, null, 2));
                  this.upload(AssetCreate({ filePath: path.join(sourcePath, 'json', jsonFile) })).then(ipfsHash => {
                    this.LOG(`[${i + 1}/${files.length}] Uploaded NFT to ipfs://${ipfsHash}`);
                    this.INFO(`To mint with the CLI tool use "eznft mint ipfs://${ipfsHash}"`);
                    _resolve(ipfsHash);
                  });
                });
              });
          }),
        );
      };
      const hashes = await runSchedule();
      const outputDest = path.join(this.sessionDir, 'hashes.json');
      fs.writeFileSync(outputDest, JSON.stringify({ hashes }, null, 2));
      this.LOG(`Uploaded ${hashes.length} of ${files.length} assets and saved hashes to "${outputDest}"`);
      this.LOG('DONE');
      resolve(hashes);
    });
  }

  abstract resume(): void;
}

export class UploadServiceProvider extends ABaseUploadService {
  public get serviceName(): string {
    return this.service.serviceName;
  }

  private type: UploadServiceType | string;
  private service: IUploadService;

  public constructor({ logLevel, apiKey, secretApiKey, rate, type }: IUploadServiceProviderProps) {
    super({ logLevel, apiKey, secretApiKey, rate });
    this.type = type || EUploadServiceType.PINATA;
    switch (this.type) {
      case EUploadServiceType.PINATA:
      default:
        this.service = new PinataUploadService({ ...this });
    }
  }

  public upload(asset: IAsset): Promise<IIpfsHash> {
    return this.service.upload(asset);
  }

  public uploadAll(source: string): Promise<IIpfsHash[]> {
    return this.service.uploadAll(source);
  }

  public resume(): void {
    this.service.resume();
  }
}
