import * as path from 'path';
import { ENftGeneratorService, INftGenerator, INftGeneratorProps } from '../../types';
import { ABaseLoggableService } from '../service';
import { HashLipsNftGenerator } from './hashlips';

export abstract class ABaseNftGenerator extends ABaseLoggableService implements INftGenerator {
  size: number;
  layers: string;
  output: string;

  public constructor({ logLevel, size, layers, output }: INftGeneratorProps) {
    super({ logLevel });
    this.size = size;
    this.layers = path.resolve(layers);
    this.output = path.resolve(output);
  }

  public abstract generate(): Promise<void>;
}

export interface INftGeneratorProviderProps extends INftGeneratorProps {
  type?: ENftGeneratorService | string;
}

export class NftGeneratorProvider extends ABaseNftGenerator {
  private type: ENftGeneratorService | string;
  private service: INftGenerator;

  public constructor({ logLevel, size, layers, output, type }: INftGeneratorProviderProps) {
    super({ logLevel, size, layers, output });
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
