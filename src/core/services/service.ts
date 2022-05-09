import { IService, ELogLevel, EServiceType } from '../../types';
import { ABaseLoggable } from '../loggable';

export abstract class ABaseLoggableService extends ABaseLoggable implements IService {
  public readonly logLevel: ELogLevel;
  public abstract readonly serviceType: EServiceType;
  public abstract readonly serviceName: string;
  public get logIdentifier(): string {
    return this.serviceName;
  }
}
