import * as path from 'path';
import {
  EGeneratorServiceType,
  GeneratorServiceType,
  IGeneratorService,
  IGeneratorServiceProps,
  ILayerOptions,
} from '../../../types';
import { ABaseResumableService } from '../resumable';
import { HashLipsGeneratorService } from './hashlips';

export abstract class ABaseGeneratorService extends ABaseResumableService implements IGeneratorService {
  public size: number;
  public layers: string;
  public layerOrder: string[];
  public layerOptions: Map<string, ILayerOptions>;
  public prefix?: string;
  public description?: string;
  public outputDir?: string;

  public constructor({
    logLevel,
    size,
    layers,
    layerOrder,
    layerOptions,
    prefix,
    description,
    outputDir,
  }: IGeneratorServiceProps) {
    super({ logLevel });
    this.size = size;
    this.layers = path.resolve(layers);
    this.layerOrder = layerOrder ?? [];
    this.layerOptions = layerOptions;
    this.prefix = prefix;
    this.description = description;
    if (outputDir) this.outputDir = path.resolve(outputDir);
  }

  public abstract generate(): Promise<void>;
  public abstract resume(): void;
}

export interface IGeneratorServiceProviderProps extends IGeneratorServiceProps {
  type?: GeneratorServiceType;
}

export class GeneratorServiceProvider extends ABaseGeneratorService {
  public get serviceName(): string {
    return this.service.serviceName;
  }

  private type: GeneratorServiceType | string;
  private service: IGeneratorService;

  public constructor({
    logLevel,
    size,
    layers,
    layerOrder,
    layerOptions,
    outputDir,
    prefix,
    description,
    type,
  }: IGeneratorServiceProviderProps) {
    super({ logLevel, size, layers, layerOrder, layerOptions, outputDir, prefix: prefix, description });
    this.type = type || EGeneratorServiceType.HASHLIPS;
    switch (this.type) {
      case EGeneratorServiceType.HASHLIPS:
      default:
        this.service = new HashLipsGeneratorService({ ...this });
    }
  }

  public generate(): Promise<void> {
    return this.service.generate();
  }

  public resume(): void {
    this.service.resume();
  }
}
