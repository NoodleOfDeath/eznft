import {
  IResumableService,
  IResumableServiceProps,
  ISession,
  ISessionProps,
  ISessionSchedulerOptions,
  ITask,
  ITaskStatusChange,
  IWorkspace,
} from '../../types';
import { Workspace } from '../workspace';
import { ABaseLoggableService } from './service';
import { ServiceSession, SessionTask } from './session';

export abstract class ABaseResumableService extends ABaseLoggableService implements IResumableService {
  public readonly workspace: IWorkspace;
  public session?: ISession;
  public schedulerOptions: ISessionSchedulerOptions;

  public get sessionDir(): string {
    if (!this.session) this.session = this.generateSession();
    return this.session.directory;
  }

  public constructor({
    logLevel,
    workspace,
    workingDirectory,
    session,
    sessionId,
    schedulerOptions,
  }: IResumableServiceProps) {
    super({ logLevel });
    this.workspace = workspace || new Workspace({ workingDirectory });
    this.session =
      session || sessionId ? this.generateSession({ id: sessionId, workspace, schedulerOptions }) : undefined;
    this.schedulerOptions = schedulerOptions;
  }

  public start(tasks?: ITask[]): Promise<ITaskStatusChange[]> {
    if (!this.session) this.session = this.generateSession();
    return this.session.start(tasks);
  }

  public resume(sessionProps: ISessionProps): Promise<ITaskStatusChange[]> {
    this.session = new ServiceSession(sessionProps);
    this.session.tasks = this.session.tasks.map(task => {
      if (!(task instanceof SessionTask)) {
        return new SessionTask(task);
      }
      return task;
    });
    return this.session.start();
  }

  public stop(): Promise<void> {
    return this.session?.stop() || Promise.resolve();
  }

  protected generateSession(sessionProps?: ISessionProps): ISession {
    const session = new ServiceSession({
      logLevel: sessionProps?.logLevel || this.logLevel,
      service: sessionProps?.service || this,
      workspace: sessionProps?.workspace || this.workspace,
      schedulerOptions: sessionProps?.schedulerOptions || this.schedulerOptions,
    });
    this.DEBUG(
      `Generating session for service ${this.serviceName} with nonce ${session.id} in ${this.workspace.workingDirectory}`,
    );
    return session;
  }
}
