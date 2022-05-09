import * as fs from 'fs-extra';
import * as path from 'path';
import { IResumableService, IResumableServiceProps } from './resumable';

export type IIpfsHash = string;
export type IAssetMetadata = Record<string, string | number>;
export type IUploadOptions = Record<string, string | number>;

export interface IAsset {
  stream: fs.ReadStream;
  metadata?: IAssetMetadata;
  options?: IUploadOptions;
}

export interface IAssetProps {
  filePath: string;
  metadataPath?: string;
}

export function AssetCreate({ filePath, metadataPath }: IAssetProps): IAsset {
  return {
    stream: fs.createReadStream(path.resolve(filePath)),
    metadata: metadataPath
      ? (JSON.parse(fs.readFileSync(path.resolve(metadataPath), { encoding: 'utf8' })) as IAssetMetadata)
      : undefined,
  };
}

export interface IUploadService extends IResumableService {
  readonly apiKey: string;
  readonly secretApiKey: string;
  upload(asset: IAsset): Promise<IIpfsHash>;
  uploadAll(source: string): Promise<IIpfsHash[]>;
}

export interface IUploadServiceProps extends IResumableServiceProps {
  apiKey: string;
  secretApiKey: string;
}

export enum EUploadServiceType {
  PINATA = 'PINATA',
}
export type UploadServiceType = keyof typeof EUploadServiceType;

export interface IUploadServiceProviderProps extends IUploadServiceProps {
  serviceName?: string;
}
