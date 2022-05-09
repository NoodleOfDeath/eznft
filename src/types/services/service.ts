import { ILoggable, ILoggableProps } from '../loggable';
export enum EServiceType {
  GENERATOR_SERVICE = 'GENERATOR_SERVICE',
  UPLOAD_SERVICE = 'UPLOAD_SERVICE',
}

export interface IService extends ILoggable {
  readonly serviceType: EServiceType;
  readonly serviceName: string;
}

export interface IServiceProps extends ILoggableProps {
  serviceType?: EServiceType;
  serviceName?: string;
}
