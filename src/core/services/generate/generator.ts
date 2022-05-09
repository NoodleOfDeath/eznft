import * as path from 'path';
import {
  EGeneratorServiceType,
  EServiceType,
  IGeneratorService,
  IGeneratorServiceProps,
  ILayerOptions,
} from '../../../types';
import { ABaseResumableService } from '../resumable';
import { HashLipsGeneratorService } from './hashlips';

export abstract class ABaseGeneratorService extends ABaseResumableService implements IGeneratorService {
  public readonly serviceType = EServiceType.GENERATOR_SERVICE;

  public size: number;
  public layers: string;
  public layerOrder: string[];
  public layerOptions: Record<string, ILayerOptions>;
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
    this.layerOrder = layerOrder || [];
    if (typeof layerOptions === 'string') {
      try {
        this.layerOptions = typeof layerOptions === 'string' ? JSON.parse(layerOptions) : {};
      } catch (e) {
        this.WARN('Layer options should be in a string or json format');
      }
    } else if (Array.isArray(layerOptions)) {
      this.layerOptions = (() => {
        const newOptions: typeof this.layerOptions = {};
        layerOptions.forEach(option => {
          const [key, value] = option.split('/');
          try {
            const parsedKeys = value.replace(/(\w+)(?=:)/g, ($0, $1) => `"${$1}"`);
            newOptions[key] = JSON.parse(/^\{\S*\}/.test(parsedKeys) ? parsedKeys : `{${parsedKeys}}`);
          } catch (e) {
            newOptions[key] = {};
          }
        });
        return newOptions;
      })();
    } else {
      this.layerOptions = layerOptions;
    }
    this.prefix = prefix;
    this.description = description;
    if (outputDir) this.outputDir = path.resolve(outputDir);
  }

  public abstract generate(): Promise<void>;
}

export interface IGeneratorServiceProviderProps extends IGeneratorServiceProps {
  serviceName?: string;
}

export abstract class GeneratorService {
  public static load(props: IGeneratorServiceProviderProps) {
    switch (props.serviceName) {
      case EGeneratorServiceType.HASHLIPS:
      default:
        return new HashLipsGeneratorService(props);
    }
  }
}
