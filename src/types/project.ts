import { ILoggableProps } from './loggable';

export interface IProject {
  init(): Promise<boolean>;
}

export interface IProjectProps extends ILoggableProps {}
