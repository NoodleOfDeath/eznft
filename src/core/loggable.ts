import {
  ELogLevel,
  ILoggable,
  ILoggableFormatOptions,
  ILoggableProps,
  LogLevelColors,
  LogLevelMask,
  LogLevelName,
} from '../types';

export abstract class ABaseLoggable implements ILoggable {
  public readonly logLevel: ELogLevel;
  public abstract readonly logIdentifier: string;

  public constructor({ logLevel }: ILoggableProps) {
    this.logLevel = typeof logLevel === 'string' ? LogLevelMask(logLevel) : logLevel;
  }

  protected formatted(level: ELogLevel, message: string, options?: ILoggableFormatOptions): string | null {
    if (this.logLevel && this.logLevel & level) {
      const colors = LogLevelColors(level);
      const logTagColors = colors.logTag ?? ((text: string) => text);
      const logTagBlock = !(this.logLevel <= ELogLevel.LOG)
        ? logTagColors(`${LogLevelName(level).toUpperCase()} `.padStart(7, ' ')) + ' '
        : '';
      const sourceTagColors = colors.sourceTag ?? colors.text ?? ((text: string) => text);
      const sourceBlock =
        this.logLevel & ELogLevel.DEBUG
          ? sourceTagColors(`[${this.logIdentifier} ${new Date().toLocaleTimeString()}]:`) + ' '
          : '';
      const messageBlockColors = (options?.piped ? colors.piped : colors.text) ?? ((text: string) => text);
      const messageBlock = messageBlockColors(message);
      return `${logTagBlock}${sourceBlock}${messageBlock}`;
    }
    return null;
  }

  public LOG(message: string, options?: ILoggableFormatOptions): void {
    const log = this.formatted(ELogLevel.LOG, message, options);
    if (log) console.log(log);
  }

  public DEBUG(message: string, options?: ILoggableFormatOptions): void {
    const log = this.formatted(ELogLevel.DEBUG, message, options);
    if (log) console.log(log);
  }

  public INFO(message: string, options?: ILoggableFormatOptions): void {
    const log = this.formatted(ELogLevel.INFO, message, options);
    if (log) console.log(log);
  }

  public WARN(message: string, options?: ILoggableFormatOptions): void {
    const log = this.formatted(ELogLevel.WARN, message, options);
    if (log) console.log(log);
  }

  public ERROR(message: string | Error, options?: ILoggableFormatOptions, reject?: (reason?: any) => void): void {
    const log = this.formatted(ELogLevel.ERROR, typeof message === 'string' ? message : message.message, options);
    if (log) console.log(log);
    if (reject) reject(log ? new Error(log) : undefined);
  }
}
