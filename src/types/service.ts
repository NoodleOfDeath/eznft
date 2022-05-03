/**
 * Log level bitmask
 */
export enum ELogLevel {
  INFO = 1 << 0,
  WARN = 1 << 1,
  ERROR = 1 << 2,
  MOST = WARN | ERROR,
  VERBOSE = INFO | WARN | ERROR,
  ALL = VERBOSE,
}

export function LogLevelName(level: ELogLevel): string {
  return {
    [ELogLevel.INFO]: 'INFO',
    [ELogLevel.WARN]: 'WARN',
    [ELogLevel.ERROR]: 'ERROR',
  }[level];
}

export interface ILoggableServiceProps {
  logLevel?: ELogLevel;
}

export interface ILoggableService {
  readonly logLevel: ELogLevel;
  INFO(message: string): void;
  WARN(message: string): void;
  ERROR(message: string): void;
}
