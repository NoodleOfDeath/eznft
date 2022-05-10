import { IGeneratorServiceProviderProps } from '../core';
import { ILoggableProps } from './loggable';
import { IUploadServiceProviderProps } from './services';
import { IFSContained, IFSContainedProps } from './workspace';

export interface IProject extends IFSContained {
  readonly version: string;
  readonly name: string;
  readonly prefix: string;
  readonly description: string;
  readonly generate?: IGeneratorServiceProviderProps;
  readonly upload?: IUploadServiceProviderProps;
  init(): Promise<boolean>;
}

export interface IProjectProps extends ILoggableProps, IFSContainedProps {
  version?: string;
  name?: string;
  prefix?: string;
  description?: string;
  generate?: IGeneratorServiceProviderProps;
  upload?: IUploadServiceProviderProps;
}
