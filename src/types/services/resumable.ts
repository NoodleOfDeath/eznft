import { IWorkspace } from '../workspace';
import { IService, IServiceProps } from './service';
import { ISession, ISessionProps, ISessionSchedulerOptions, ITask, ITaskStatusChange } from './session';

export interface IResumableService extends IService {
  readonly workspace: IWorkspace;
  session?: ISession;
  schedulerOptions: ISessionSchedulerOptions;
  start(tasks?: ITask[]): Promise<ITaskStatusChange[]>;
  resume(session?: ISessionProps): Promise<ITaskStatusChange[]>;
  stop(): Promise<void>;
}

export interface IResumableServiceProps extends IServiceProps {
  workspace?: IWorkspace;
  workingDirectory?: string;
  session?: ISession;
  sessionId?: string;
  schedulerOptions?: ISessionSchedulerOptions;
}
