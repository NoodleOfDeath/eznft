import { IIpfsAsset, IIpfsUploader } from '../../types';
import PinataSDK, { PinataClient, PinataPinResponse } from '@pinata/sdk';

export class PinataUploader<T extends IIpfsAsset> implements IIpfsUploader<T, PinataPinResponse> {
  private client: PinataClient;

  public constructor(props: { apiKey: string; apiSecretKey: string }) {
    this.client = PinataSDK(props.apiKey, props.apiSecretKey);
    this.authenticate();
  }

  public upload(asset: T): Promise<PinataPinResponse> {
    return new Promise<PinataPinResponse>((resolve, reject) => {
      this.client
        .pinFileToIPFS(asset.stream, {
          pinataMetadata: asset.metadata,
          pinataOptions: asset.options,
        })
        .then(result => {
          resolve(result);
        })
        .catch((error: Error) => reject(error));
    });
  }

  private authenticate() {
    this.client
      .testAuthentication()
      .then(result => {
        console.log(result);
      })
      .catch((error: Error) => console.log(error));
  }
}
