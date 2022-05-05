import { ILoggableServiceProps } from './service';

export interface INftLayerOptions {
  blend?: string;
  opacity?: number;
}

export interface INftLayer {
  name: string;
  options?: INftLayerOptions;
}

export interface INftLayersPackage {
  path: string;
  layers: INftLayer[];
}

export interface INftGeneratorProps extends ILoggableServiceProps {
  size: number;
  layers: string;
  output: string;
  collection: string;
  description: string;
}

export interface INftGenerator {
  readonly size: number;
  readonly layers: string;
  readonly output: string;
  generate(): Promise<void>;
}

export enum ENftGeneratorService {
  HashLips = 'hashlips',
}
