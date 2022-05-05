import PinataSDK, { PinataClient } from '@pinata/sdk';
import { IIpfsAsset, IIpfsHash } from '../../types';
import { ABaseUploadService, IUploadServiceProps } from './uploader';

export interface IPinataUploadServiceProps extends IUploadServiceProps {}

export class PinataUploadService extends ABaseUploadService {
  private client: PinataClient;

  public constructor({ logLevel, apiKey, secretApiKey }: IPinataUploadServiceProps) {
    super({ logLevel, apiKey, secretApiKey });
    this.client = PinataSDK(this.apiKey, this.secretApiKey);
  }

  public upload(asset: IIpfsAsset): Promise<IIpfsHash> {
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
        .catch((error: Error) => reject(error));
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
