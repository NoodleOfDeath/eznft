import { ISession, IWorkspace } from '../workspace';
import { IService, IServiceProps } from './service';

export interface IResumableService extends IService {
  readonly workspace: IWorkspace;
  session?: ISession;
  resume(): void;
}

export interface IResumableServiceProps extends IServiceProps {
  workspace?: IWorkspace;
  workingDirectory?: string;
}
