import * as path from 'path';
import { ILoggableProps, IResumableService, IResumableServiceProps, ISession, IWorkspace } from '../../types';
import { Workspace } from '../workspace';
import { ABaseLoggableService } from './service';

export abstract class ABaseResumableService extends ABaseLoggableService implements IResumableService {
  public readonly workspace: IWorkspace;
  public session?: ISession;

  public get sessionDir(): string {
    if (!this.session) {
      this.WARN('There is no current session for this service.');
    }
    return path.join(
      this.workspace.workingDirectory,
      `${this.serviceName}-${this.session?.sessionNonce || Date.now()}`,
    );
  }

  public constructor({ logLevel, workspace, workingDirectory }: IResumableServiceProps & ILoggableProps) {
    super({ logLevel });
    this.workspace = workspace || new Workspace({ workingDirectory });
  }

  public abstract resume(): void;
}
