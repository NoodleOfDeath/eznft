export type IIpfsMetadata = Record<string, string | number>;
export type IIpfsUploadOptions = Record<string, string | number>;

export interface IIpfsAsset {
  stream: ReadableStream;
  metadata?: IIpfsMetadata;
  options?: IIpfsUploadOptions;
}

export interface INft extends IIpfsAsset {}

export interface IIpfsUploader<T extends IIpfsAsset, R> {
  upload(asset: T): Promise<R>;
}
