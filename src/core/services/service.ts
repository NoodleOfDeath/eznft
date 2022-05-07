import { IService, ELogLevel } from '../../types';
import { ABaseLoggable } from '../loggable';

export abstract class ABaseLoggableService extends ABaseLoggable implements IService {
  public readonly logLevel: ELogLevel;
  public abstract readonly serviceName: string;
  public get logIdentifier(): string {
    return this.serviceName;
  }
}
