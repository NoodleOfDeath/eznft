import { ILoggableProps } from './loggable';

export interface IWorkspace {
  readonly workingDirectory: string;
  clean(): Promise<boolean>;
}

export interface IWorkspaceProps extends ILoggableProps {
  workingDirectory?: string;
}
