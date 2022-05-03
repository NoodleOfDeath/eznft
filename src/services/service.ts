import { ELogLevel, ILoggableService, ILoggableServiceProps, LogLevelName } from '../types';

export abstract class ABaseLoggableService<T extends ILoggableServiceProps> implements ILoggableService {
  public readonly logLevel: ELogLevel;

  public constructor(props: T) {
    this.logLevel = props.logLevel;
  }

  protected LOG(level: ELogLevel, message: string): void {
    if (this.logLevel && this.logLevel & level) console.log(`${LogLevelName(level).toUpperCase()}: ${message}`);
  }

  public INFO(message: string): void {
    this.LOG(ELogLevel.INFO, message);
  }

  public WARN(message: string): void {
    this.LOG(ELogLevel.WARN, message);
  }

  public ERROR(message: string): void {
    this.LOG(ELogLevel.ERROR, message);
  }
}
