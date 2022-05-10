import Bottleneck from 'bottleneck';
import * as fs from 'fs-extra';
import path from 'path';
import {
  ITask,
  ISession,
  ISessionProps,
  IWorkspace,
  IWorkspaceProps,
  ISessionSchedulerOptions,
  ITaskStatusChange,
  IService,
  ETaskStatus,
  ITaskProps,
} from '../../types';
import { ABaseLoggable } from '../loggable';
import { Workspace } from '../workspace';

export class SessionTask implements ITask {
  public readonly id: string;
  status?: ETaskStatus;
  service: IService;
  session: ISession;
  lastUpdate?: number;
  payload?: any;
  run: () => Promise<ITaskStatusChange>;

  public constructor({ id, status, service, session, lastUpdate, payload, run }: ITaskProps) {
    this.id = id || `${Date.now()}`;
    this.status = status;
    this.service = service;
    this.session = session;
    this.lastUpdate = lastUpdate;
    this.payload = payload;
    this.run = run || (() => Promise.reject(''));
  }

  update({ status, payload }: ITaskStatusChange): Promise<boolean> {
    this.status = status;
    this.payload = payload;
    this.lastUpdate = Date.now();
    return this.session.recordState();
  }
}

export class ServiceSession extends ABaseLoggable implements ISession {
  public readonly version = '1.0';
  public readonly id: string;
  public readonly command?: string[];
  public readonly service: IService;
  public readonly workspace: IWorkspace;
  public readonly schedulerOptions: ISessionSchedulerOptions;
  public started: number;
  public tasks: ITask[];

  public readonly logIdentifier = ServiceSession.name;

  public get directory(): string {
    const dir = path.join(
      this.workspace.workingDirectory,
      'sessions',
      `${this.service.serviceName}-${this.id || Date.now()}`,
    );
    return dir;
  }

  private get archivedDir(): string {
    const dir = path.join(
      this.workspace.workingDirectory,
      'sessions',
      '.archive',
      `${this.service.serviceName}-${this.id || Date.now()}`,
    );
    return dir;
  }

  private scheduler: Bottleneck;

  public constructor({
    logLevel,
    id,
    command,
    service,
    workspace,
    workingDirectory,
    schedulerOptions,
    started,
    tasks,
  }: ISessionProps & IWorkspaceProps) {
    super({ logLevel });
    this.id = id || `${Date.now()}`;
    this.command = command;
    this.service = service;
    this.workspace = workspace || new Workspace({ workingDirectory });
    this.schedulerOptions = schedulerOptions;
    this.started = started;
    this.tasks = tasks || [];
    this.scheduler = new Bottleneck({
      maxConcurrent: schedulerOptions?.maxConcurrent || 1,
      minTime: schedulerOptions?.minTime || schedulerOptions?.rate ? 1000 / (schedulerOptions.rate / 60) : 0,
    });
  }

  addTask(...task: ITask[]): void {
    throw new Error('Method not implemented.');
  }

  public start(tasks?: ITask[]): Promise<ITaskStatusChange[]> {
    if (tasks) this.tasks = tasks;
    this.started = Date.now();
    if (!fs.existsSync(this.directory)) fs.mkdirSync(this.directory, { recursive: true });
    const unfinishedTasks = tasks.filter(task => task.status !== ETaskStatus.SUCCESS);
    return Promise.all(
      unfinishedTasks.map(async task => {
        return this.scheduler.schedule(() => {
          return task.run();
        });
      }),
    );
  }

  public stop(): Promise<void> {
    return Promise.resolve();
  }

  public recordState(): Promise<boolean> {
    try {
      fs.writeFileSync(
        path.join(this.directory, 'session.json'),
        JSON.stringify(
          {
            version: this.version,
            id: this.id,
            command: process.argv,
            started: this.started,
            service: {
              serviceType: this.service.serviceType,
              serviceName: this.service.serviceName,
            },
            workingDirectory: this.workspace.workingDirectory,
            schedulerOptions: this.schedulerOptions,
            tasks: this.tasks.map(task => ({
              id: task.id,
              status: task.status,
              lastUpdate: task.lastUpdate,
              payload: task.payload ? task.payload : undefined,
            })),
          },
          null,
          2,
        ),
      );
      return Promise.resolve(true);
    } catch (e) {
      this.ERROR(`Encountered issue recording state: "${e.message}"`);
      return Promise.resolve(false);
    }
  }

  public archive(): Promise<string> {
    if (!fs.existsSync(this.directory)) return Promise.reject('');
    fs.copySync(this.directory, this.archivedDir);
    fs.removeSync(this.directory);
    return Promise.resolve(this.archivedDir);
  }

  public unarchive(): Promise<string> {
    if (!fs.existsSync(this.archivedDir)) return Promise.reject('');
    fs.copySync(this.archivedDir, this.directory);
    fs.removeSync(this.archivedDir);
    return Promise.resolve(this.directory);
  }
}
