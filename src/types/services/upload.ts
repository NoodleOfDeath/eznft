import * as fs from 'fs-extra';
import * as path from 'path';
import { IResumableService, IResumableServiceProps } from './resumable';

export type IIpfsHash = string;

export interface IAsset {
  stream: fs.ReadStream;
}

export interface IAssetProps {
  filePath: string;
}

export function AssetCreate({ filePath }: IAssetProps): IAsset {
  return {
    stream: fs.createReadStream(path.resolve(filePath)),
  };
}

export interface IUploadService extends IResumableService {
  readonly apiKey: string;
  readonly secretApiKey: string;
  upload(asset: IAsset): Promise<IIpfsHash>;
  uploadAssets(source: string, options?: IUploadOptions): Promise<IIpfsHash[]>;
}

export interface IUploadServiceProps extends IResumableServiceProps {
  apiKey: string;
  secretApiKey: string;
}

export enum EUploadServiceType {
  PINATA = 'PINATA',
}
export type KUploadServiceType = keyof typeof EUploadServiceType;

export interface IUploadServiceProviderProps extends IUploadServiceProps {
  serviceName?: string;
  source?: string;
}

export type IUploadOptions = { [key in KUploadOptions]?: boolean };
export type KUploadOptions = 'ignoreImages' | 'uploadJson';
