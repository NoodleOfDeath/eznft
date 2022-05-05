import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import Bottleneck from 'bottleneck';
import {
  EIpfsUploadService,
  IIpfsHash,
  IIpfsAsset,
  IpfsAssetCreate,
  IUploadService,
  ILoggableServiceProps,
} from '../../types';
import { ABaseLoggableService } from '../service';
import { PinataUploadService } from './pin';

export interface IUploadServiceProps extends ILoggableServiceProps {
  apiKey: string;
  secretApiKey: string;
  rate?: number; // max requests per min. default should be 150.
}

export abstract class ABaseUploadService extends ABaseLoggableService implements IUploadService {
  public readonly apiKey: string;
  public readonly secretApiKey: string;
  public readonly rate: number;

  public constructor({ logLevel, apiKey, secretApiKey, rate }: IUploadServiceProps) {
    super({ logLevel });
    this.apiKey = apiKey;
    this.secretApiKey = secretApiKey;
    this.rate = rate || 150;
  }

  public abstract upload(asset: IIpfsAsset): Promise<IIpfsHash>;

  public uploadAll(source: string, output?: string): Promise<IIpfsHash[]> {
    return new Promise<any>(async (resolve, reject) => {
      const sourcePath = path.resolve(source);
      if (!fs.existsSync(sourcePath)) {
        reject(new Error(`Path "${sourcePath}" does not exists`));
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'images'))) {
        reject(new Error(`Source path "${sourcePath}" is missing an "images" directory.`));
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'json'))) {
        reject(new Error(`Source path "${sourcePath}" is missing a "json" directory.`));
        return;
      }
      const files = fs.readdirSync(path.join(sourcePath, 'images'));
      const limiter = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1000 / (this.rate / 60 / 2),
      });
      const runSchedule = async (): Promise<IIpfsHash[]> => {
        return Promise.all(
          files.map(async file => {
            return limiter
              .schedule(() => this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'images', file) })))
              .then(ipfsHash => {
                return new Promise<IIpfsHash>(_resolve => {
                  const matches = /\w+(?=\.)/.exec(file);
                  if (!matches || !matches[0]) return;
                  const jsonFile = `${matches[0]}.json`;
                  let json = JSON.parse(fs.readFileSync(path.join(sourcePath, 'json', jsonFile), { encoding: 'utf8' }));
                  json.image = `ipfs://${ipfsHash}`;
                  if (json.compiler) delete json.compiler;
                  fs.writeFileSync(path.join(sourcePath, 'json', jsonFile), JSON.stringify(json, null, 2));
                  this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'json', jsonFile) })).then(ipfsHash => {
                    console.log(`Uploaded NFT to ipfs://${ipfsHash}`);
                    console.log(`To mint with the CLI tool use "eznft mint ipfs://${ipfsHash}"`);
                    _resolve(ipfsHash);
                  });
                });
              });
          }),
        );
      };
      const hashes = await runSchedule();
      const outputDest = output || path.join(os.tmpdir(), 'hashes.json');
      fs.writeFileSync(outputDest, JSON.stringify({ hashes }, null, 2));
      console.log(`Uploaded ${hashes.length} of ${files.length} assets and saved hashes to "${outputDest}"`);
      console.log('DONE');
      resolve(hashes);
    });
  }
}

export interface IUploadServiceProviderProps extends IUploadServiceProps {
  type?: EIpfsUploadService | string;
}

export class UploadServiceProvider extends ABaseUploadService {
  private type: EIpfsUploadService | string;
  private service: IUploadService;

  public constructor({ logLevel, apiKey, secretApiKey, rate, type }: IUploadServiceProviderProps) {
    super({ logLevel, apiKey, secretApiKey, rate });
    this.type = type || EIpfsUploadService.Pinata;
    switch (this.type) {
      case EIpfsUploadService.Pinata:
      default:
        this.service = new PinataUploadService({ ...this });
    }
  }

  public upload(asset: IIpfsAsset): Promise<IIpfsHash> {
    return this.service.upload(asset);
  }

  public uploadAll(source: string, output?: string): Promise<IIpfsHash[]> {
    return this.service.uploadAll(source, output);
  }
}
