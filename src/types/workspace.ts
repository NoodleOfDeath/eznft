import { ILoggableProps } from './loggable';

export interface IWorkspace {
  readonly workingDirectory: string;
  session(): ISession;
  clean(): Promise<boolean>;
}

export interface IWorkspaceProps extends ILoggableProps {
  workingDirectory?: string;
}

export interface ISession {
  readonly workspace: IWorkspace;
  readonly sessionNonce: string;
}

export interface ISessionProps extends ILoggableProps {
  workspace?: IWorkspace;
  sessionNonce?: string;
}
