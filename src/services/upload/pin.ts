import * as fs from 'fs-extra';
import * as path from 'path';
import PinataSDK, { PinataClient, PinataPinResponse } from '@pinata/sdk';
import { IIpfsAsset, IpfsAssetCreate } from '../../types';
import { ABaseUploadService, IUploadServiceProps } from './uploader';

export interface IPinataUploadServiceProps extends IUploadServiceProps {}

export class PinataUploadService extends ABaseUploadService<IIpfsAsset> {
  private client: PinataClient;

  public constructor({ logLevel, apiKey, secretApiKey }: IPinataUploadServiceProps) {
    super({ logLevel, apiKey, secretApiKey });
    this.client = PinataSDK(this.apiKey, this.secretApiKey);
  }

  public upload(asset: IIpfsAsset): Promise<any> {
    this.INFO(`Uploading asset: ${Object.entries(asset).map(entry => `(${entry[0]}, ${entry[1]})`)}`);
    return new Promise<any>((resolve, reject) => {
      this.client
        .pinFileToIPFS(asset.stream, {
          pinataMetadata: asset.metadata,
          pinataOptions: asset.options,
        })
        .then(result => {
          this.INFO(
            `Successfully uploaded with response: ${Object.entries(result).map(entry => `(${entry[0]}, ${entry[1]})`)}`,
          );
          resolve([result]);
        })
        .catch((error: Error) => reject(error));
    });
  }

  public uploadAll(source: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
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
        this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'images', file) })).then(resp => {
          const response = resp as PinataPinResponse;
          if (!response) return;
          const matches = /\w+(?=\.)/.exec(file);
          if (!matches || !matches[0]) return;
          const jsonFile = `${matches[0]}.json`;
          let json = JSON.parse(fs.readFileSync(path.join(sourcePath, 'json', jsonFile), { encoding: 'utf8' }));
          json.image = `ipfs://${response.IpfsHash}`;
          delete json.compiler;
          fs.writeFileSync(path.join(sourcePath, 'json', jsonFile), JSON.stringify(json));
          this.upload(IpfsAssetCreate({ filePath: path.join(sourcePath, 'json', jsonFile) })).then(resp => {
            const response = resp as PinataPinResponse;
            if (!response) return;
            console.log(`Uploaded NFT to ipfs://${response.IpfsHash}`);
            console.log(`To mint with the CLI tool use "eznft.ts mint ipfs://${response.IpfsHash}"`);
          });
        });
      });
      console.log('DONE');
      resolve(true);
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
