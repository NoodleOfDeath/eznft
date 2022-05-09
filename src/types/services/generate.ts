import { IResumableService, IResumableServiceProps } from './resumable';

export type ILayerOptions = Record<string, string | number | boolean>;

export enum EGeneratorServiceType {
  HASHLIPS = 'HASHLIPS',
}
export type GeneratorServiceType = keyof typeof EGeneratorServiceType;

export interface IGeneratorService extends IResumableService {
  readonly size: number;
  readonly layers: string;
  readonly layerOrder: string[];
  readonly layerOptions: Record<string, ILayerOptions>;
  readonly prefix?: string;
  readonly description?: string;
  readonly outputDir?: string;
  generate(): Promise<void>;
}

export type GeneratorServiceLayerOptionsType = string | string[] | Record<string, ILayerOptions>;
export interface IGeneratorServiceProps extends IResumableServiceProps {
  size: number;
  layers: string;
  layerOrder?: string[];
  layerOptions?: GeneratorServiceLayerOptionsType;
  prefix?: string;
  description?: string;
  outputDir?: string;
}
