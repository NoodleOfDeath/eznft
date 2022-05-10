import { ILoggableProps } from './loggable';

export interface IFSContained {
  readonly workingDirectory: string;
}

export interface IFSContainedProps {
  workingDirectory?: string;
}

export interface IWorkspace extends IFSContained {
  readonly sessionsDirectory: string;
  readonly archivesDirectory: string;
  clean(): Promise<boolean>;
}

export interface IWorkspaceProps extends ILoggableProps, IFSContainedProps {}
