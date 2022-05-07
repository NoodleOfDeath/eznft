import { IResumableService, IResumableServiceProps } from './resumable';

export enum EGeneratorServiceType {
  HASHLIPS = 'HASHLIPS',
}
export type GeneratorServiceType = keyof typeof EGeneratorServiceType;

export interface IGeneratorService extends IResumableService {
  readonly size: number;
  readonly layers: string;
  readonly prefix?: string;
  readonly description?: string;
  readonly outputDir?: string;
  generate(): Promise<void>;
}

export interface IGeneratorServiceProps extends IResumableServiceProps {
  size: number;
  layers: string;
  prefix?: string;
  description?: string;
  outputDir?: string;
}
