import { ILoggable, ILoggableProps } from '../loggable';

export interface IService extends ILoggable {
  readonly serviceName: string;
}

export interface IServiceProps extends ILoggableProps {}
