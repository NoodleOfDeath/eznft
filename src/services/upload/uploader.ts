import { IIpfsAsset, IUploadService, ILoggableServiceProps, EIpfsUploadService } from '../../types';
import { ABaseLoggableService } from '../service';
import { PinataUploadService } from './pin';

export interface IUploadServiceProps extends ILoggableServiceProps {
  apiKey: string;
  secretApiKey: string;
}

export abstract class ABaseUploadService<Asset extends IIpfsAsset> extends ABaseLoggableService
  implements IUploadService<Asset> {
  public readonly apiKey: string;
  public readonly secretApiKey: string;

  public constructor({ logLevel, apiKey, secretApiKey }: IUploadServiceProps) {
    super({ logLevel });
    this.apiKey = apiKey;
    this.secretApiKey = secretApiKey;
  }

  public abstract upload(asset: Asset): Promise<any>;
  public abstract uploadAll(source: string): Promise<any>;
}

export interface IUploadServiceProviderProps extends IUploadServiceProps {
  type?: EIpfsUploadService | string;
}

export class UploadServiceProvider<Asset extends IIpfsAsset> extends ABaseUploadService<Asset> {
  private type: EIpfsUploadService | string;
  private service: IUploadService<Asset>;

  public constructor({ logLevel, apiKey, secretApiKey, type }: IUploadServiceProviderProps) {
    super({ logLevel, apiKey, secretApiKey });
    this.type = type || EIpfsUploadService.Pinata;
    switch (this.type) {
      case EIpfsUploadService.Pinata:
      default:
        this.service = new PinataUploadService({ ...this });
    }
  }

  public upload(asset: Asset): Promise<any> {
    return this.service.upload(asset);
  }

  public uploadAll(source: string): Promise<any> {
    return this.service.uploadAll(source);
  }
}
