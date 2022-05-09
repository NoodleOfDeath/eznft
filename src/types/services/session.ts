import Bottleneck from 'bottleneck';
import { ILoggableProps } from '../loggable';
import { IWorkspace } from '../workspace';
import { IService } from './service';

export interface ITask {
  id: string;
  status?: ETaskStatus;
  service: IService;
  session: ISession;
  lastUpdate?: number;
  payload?: any;
  run: () => Promise<ITaskStatusChange>;
  setStatus(status: ETaskStatus): Promise<boolean>;
}

export interface ITaskProps {
  id?: string;
  status?: ETaskStatus;
  service?: IService;
  session?: ISession;
  lastUpdate?: number;
  payload?: any;
  run?: () => Promise<ITaskStatusChange>;
}

export enum ETaskStatus {
  QUEUED,
  RUNNING,
  SUCCESS,
  FAILED,
}

export interface ITaskStatusChange {
  status: ETaskStatus;
  payload?: any;
}

export interface ISession {
  readonly version: string;
  readonly id: string;
  readonly command?: string[];
  readonly service: IService;
  readonly workspace: IWorkspace;
  readonly directory: string;
  started: number;
  tasks: ITask[];
  addTask(...task: ITask[]): void;
  start(tasks?: ITask[]): Promise<ITaskStatusChange[]>;
  recordState(): Promise<boolean>;
  archive(): Promise<string>;
  unarchive(): Promise<string>;
  stop(): Promise<void>;
}

export interface ISessionSchedulerOptions extends Bottleneck.ConstructorOptions {
  rate?: number; // default is 150 requests per min
}

export interface ISessionProps extends ILoggableProps {
  id?: string;
  command?: string[];
  service?: IService;
  workspace?: IWorkspace;
  schedulerOptions?: ISessionSchedulerOptions;
  started?: number;
  tasks?: ITask[];
}
