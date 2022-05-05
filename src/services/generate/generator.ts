import * as path from 'path';
import { ENftGeneratorService, INftGenerator, INftGeneratorProps } from '../../types';
import { ABaseLoggableService } from '../service';
import { HashLipsNftGenerator } from './hashlips';

export abstract class ABaseNftGenerator extends ABaseLoggableService implements INftGenerator {
  public size: number;
  public layers: string;
  public output: string;
  public collection: string;
  public description: string;

  public constructor({ logLevel, size, layers, output, collection, description }: INftGeneratorProps) {
    super({ logLevel });
    this.size = size;
    this.layers = path.resolve(layers);
    this.output = path.resolve(output);
    this.collection = collection;
    this.description = description;
  }

  public abstract generate(): Promise<void>;
}

export interface INftGeneratorProviderProps extends INftGeneratorProps {
  type?: ENftGeneratorService | string;
}

export class NftGeneratorProvider extends ABaseNftGenerator {
  private type: ENftGeneratorService | string;
  private service: INftGenerator;

  public constructor({ logLevel, size, layers, output, collection, description, type }: INftGeneratorProviderProps) {
    super({ logLevel, size, layers, output, collection, description });
    this.type = type || ENftGeneratorService.HashLips;
    switch (this.type) {
      case ENftGeneratorService.HashLips:
      default:
        this.service = new HashLipsNftGenerator({ ...this });
    }
  }

  generate(): Promise<void> {
    return this.service.generate();
  }
}
