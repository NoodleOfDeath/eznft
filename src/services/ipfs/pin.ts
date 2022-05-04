import * as fs from 'fs-extra';
import * as path from 'path';
import PinataSDK, { PinataClient, PinataPinResponse } from '@pinata/sdk';
import { IIpfsAsset, IIpfsUploadService, ILoggableServiceProps, IpfsAssetCreate } from '../../types';
import { ABaseLoggableService } from '../service';

export interface IPinataUploadServiceProps extends ILoggableServiceProps {
  apiKey: string;
  secretApiKey: string;
}

export class PinataUploadService extends ABaseLoggableService<IPinataUploadServiceProps>
  implements IIpfsUploadService<IIpfsAsset, PinataPinResponse> {
  private client: PinataClient;

  public constructor(props: IPinataUploadServiceProps) {
    super(props);
    this.INFO(`Loading pinata client`);
    this.client = PinataSDK(props.apiKey, props.secretApiKey);
  }

  public upload(asset: IIpfsAsset): Promise<PinataPinResponse> {
    this.INFO(`Uploading asset: ${Object.entries(asset).map(entry => `(${entry[0]}, ${entry[1]})`)}`);
    return new Promise<PinataPinResponse>((resolve, reject) => {
      this.client
        .pinFileToIPFS(asset.stream, {
          pinataMetadata: asset.metadata,
          pinataOptions: asset.options,
        })
        .then(result => {
          this.INFO(
            `Successfully uploaded with response: ${Object.entries(result).map(entry => `(${entry[0]}, ${entry[1]})`)}`,
          );
          resolve(result);
        })
        .catch((error: Error) => reject(error));
    });
  }

  public uploadAll(source: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sourcePath = path.resolve(source);
      if (!fs.existsSync(sourcePath)) {
        reject(new Error(`Path "${sourcePath}" does not exists`));
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'images'))) {
        reject(new Error(`Source path "${sourcePath}" is missing an "images" directory.`));
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'json'))) {
        reject(new Error(`Source path "${sourcePath}" is missing an "json" directory.`));
        return;
      }
      const files = fs.readdirSync(path.join(sourcePath, 'images'));
      files.forEach(file => {
        this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'images', file) })).then(response => {
          const matches = /\w+(?=\.)/.exec(file);
          if (!matches || !matches[0]) return;
          const jsonFile = `${matches[0]}.json`;
          let json = JSON.parse(fs.readFileSync(path.join(sourcePath, 'json', jsonFile), { encoding: 'utf8' }));
          json.image = `ipfs://${response.IpfsHash}`;
          delete json.compiler;
          fs.writeFileSync(path.join(sourcePath, 'json', jsonFile), JSON.stringify(json));
          this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'json', jsonFile) })).then(response => {
            console.log(`Uploaded NFT to ipfs://${response.IpfsHash}`);
            console.log(`To mint with the CLI tool use "eznft.ts mint ipfs://${response.IpfsHash}"`);
          });
        });
      });
      console.log('DONE');
    });
  }

  public testAuthentication() {
    this.INFO(`Authenticating client`);
    this.client
      .testAuthentication()
      .then(result => {
        this.INFO(
          `Successfully authenticated with response: ${Object.entries(result).map(
            entry => `(${entry[0]}, ${entry[1]})`,
          )}`,
        );
      })
      .catch((error: Error) => console.error(error));
  }
}
