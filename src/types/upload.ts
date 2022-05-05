import * as fs from 'fs-extra';
import * as path from 'path';

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
export function IpfsAssetCreate(props: IIpfsAssetProps): IIpfsAsset {
  return {
    stream: fs.createReadStream(path.resolve(props.filePath)),
    metadata: props.metadataPath
      ? (JSON.parse(fs.readFileSync(path.resolve(props.metadataPath), { encoding: 'utf8' })) as IIpfsMetadata)
      : undefined,
  };
}

export interface INft extends IIpfsAsset {}

export enum EIpfsUploadService {
  Pinata = 'pinata',
}

export interface IUploadService<Asset extends IIpfsAsset> {
  upload(asset: Asset): Promise<any[]>;
  uploadAll(source: string): Promise<any[]>;
}
