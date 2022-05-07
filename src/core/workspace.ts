import * as fs from 'fs-extra';
import * as path from 'path';
import { ISession, ISessionProps, IWorkspace, IWorkspaceProps } from '../types';
import { ABaseLoggable } from './loggable';

export class Workspace extends ABaseLoggable implements IWorkspace {
  public readonly workingDirectory: string;

  public logIdentifier = Workspace.name;

  public static get default(): Workspace {
    return new Workspace({});
  }

  public constructor({ logLevel, workingDirectory }: IWorkspaceProps) {
    super({ logLevel });
    this.workingDirectory = path.resolve(workingDirectory || path.join(process.cwd(), '.eznft'));
  }

  public session(): Session {
    const session = new Session({ logLevel: this.logLevel, workspace: this });
    return session;
  }

  public clean(): Promise<boolean> {
    try {
      if (fs.existsSync(this.workingDirectory)) fs.rmSync(this.workingDirectory, { recursive: true });
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }
}

export class Session extends ABaseLoggable implements ISession {
  public readonly workspace: IWorkspace;
  public readonly sessionNonce: string;

  public logIdentifier = Session.name;

  public constructor({ logLevel, workspace, sessionNonce }: ISessionProps) {
    super({ logLevel });
    this.workspace = workspace || new Workspace({});
    this.sessionNonce = sessionNonce || `${Date.now()}`;
  }
}
