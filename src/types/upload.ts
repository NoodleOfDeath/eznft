import * as fs from 'fs-extra';
import * as path from 'path';

export type IIpfsHash = string;
export type IIpfsMetadata = Record<string, string | number>;
export type IIpfsUploadOptions = Record<string, string | number>;

export interface IIpfsAsset {
  stream: fs.ReadStream;
  metadata?: IIpfsMetadata;
  options?: IIpfsUploadOptions;
}

export interface IIpfsAssetProps {
  filePath: string;
  metadataPath?: string;
}
export function IpfsAssetCreate({ filePath, metadataPath }: IIpfsAssetProps): IIpfsAsset {
  return {
    stream: fs.createReadStream(path.resolve(filePath)),
    metadata: metadataPath
      ? (JSON.parse(fs.readFileSync(path.resolve(metadataPath), { encoding: 'utf8' })) as IIpfsMetadata)
      : undefined,
  };
}

export interface INft extends IIpfsAsset {}

export enum EIpfsUploadService {
  Pinata = 'pinata',
}

export interface IUploadService {
  readonly apiKey: string;
  readonly secretApiKey: string;
  readonly rate: number;
  upload(asset: IIpfsAsset): Promise<IIpfsHash>;
  uploadAll(source: string, output?: string): Promise<IIpfsHash[]>;
}
