import chalk, { Chalk } from 'chalk';
/**
 * Log level bitmask
 */
export enum ELogLevel {
  DEBUG = 1 << 0,
  INFO = 1 << 1,
  LOG = 1 << 2,
  WARN = 1 << 3,
  ERROR = 1 << 4,
  ESSENTIAL = LOG | WARN | ERROR,
  VERBOSE = INFO | LOG | WARN | ERROR,
  MOST = VERBOSE, // alias for VERBOSE
  ALL = DEBUG | INFO | LOG | WARN | ERROR,
}

export type LogLevel = keyof typeof ELogLevel;

export function LogLevelName(level: ELogLevel): LogLevel {
  return {
    [ELogLevel.DEBUG]: 'DEBUG',
    [ELogLevel.LOG]: 'LOG',
    [ELogLevel.INFO]: 'INFO',
    [ELogLevel.WARN]: 'WARN',
    [ELogLevel.ERROR]: 'ERROR',
  }[level] as LogLevel;
}

export function LogLevelMask(level: LogLevel): ELogLevel {
  return ELogLevel[level];
}

export interface ILogColors {
  logTag?: Chalk;
  sourceTag?: Chalk;
  text?: Chalk;
  piped?: Chalk;
}

export function LogLevelColors(level: ELogLevel): ILogColors {
  return {
    [ELogLevel.DEBUG]: { logTag: chalk.black.bgGreen, text: chalk.green, piped: chalk.gray },
    [ELogLevel.LOG]: { logTag: chalk.black.bgWhite, text: chalk.white, piped: chalk.gray },
    [ELogLevel.INFO]: { logTag: chalk.black.bgWhiteBright, text: chalk.whiteBright, piped: chalk.gray },
    [ELogLevel.WARN]: { logTag: chalk.black.bgYellowBright, text: chalk.yellowBright, piped: chalk.gray },
    [ELogLevel.ERROR]: { logTag: chalk.whiteBright.bgRedBright, text: chalk.redBright, piped: chalk.gray },
  }[level];
}

export interface ILoggable {
  readonly logLevel: ELogLevel;
  readonly logIdentifier: string;
  DEBUG(message: string, options?: ILoggableFormatOptions): void;
  LOG(message: string, options?: ILoggableFormatOptions): void;
  INFO(message: string, options?: ILoggableFormatOptions): void;
  WARN(message: string, options?: ILoggableFormatOptions): void;
  ERROR(message: string | Error, options?: ILoggableFormatOptions, reject?: (reason?: any) => void): void;
}

export interface ILoggableProps {
  logLevel?: ELogLevel | LogLevel;
}

export interface ILoggableFormatOptions {
  piped?: boolean;
}
