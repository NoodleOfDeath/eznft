import PinataSDK, { PinataClient } from '@pinata/sdk';
import { IAsset, IIpfsHash, IUploadServiceProps } from '../../../types';
import { ABaseUploadService } from './uploader';

export interface IPinataUploadServiceProps extends IUploadServiceProps {}

export class PinataUploadService extends ABaseUploadService {
  public readonly serviceName = 'PINATA';

  private client: PinataClient;

  public constructor({ logLevel, apiKey, secretApiKey }: IPinataUploadServiceProps) {
    super({ logLevel, apiKey, secretApiKey });
    this.client = PinataSDK(this.apiKey, this.secretApiKey);
  }

  public upload(asset: IAsset): Promise<IIpfsHash> {
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
          resolve(result.IpfsHash);
        })
        .catch((error: Error) => this.ERROR(error, null, reject));
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
