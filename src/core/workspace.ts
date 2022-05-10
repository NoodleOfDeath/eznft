import * as fs from 'fs-extra';
import * as path from 'path';
import { ISession, IWorkspace, IWorkspaceProps } from '../types';
import { ABaseLoggable } from './loggable';
import { ServiceSession } from './services/session';

export class Workspace extends ABaseLoggable implements IWorkspace {
  public readonly logIdentifier = Workspace.name;

  public readonly workingDirectory: string;

  public get sessionsDirectory(): string {
    return path.join(this.workingDirectory, 'sessions');
  }
  public get archivesDirectory(): string {
    return path.join(this.workingDirectory, 'sessions/.archive');
  }

  private sessionFile = 'session.json';

  public constructor({ logLevel, workingDirectory }: IWorkspaceProps) {
    super({ logLevel });
    this.workingDirectory = path.resolve(workingDirectory || path.join(process.cwd(), '.eznft'));
  }

  public clean(): Promise<boolean> {
    try {
      if (fs.existsSync(this.archivesDirectory)) fs.rmSync(this.workingDirectory, { recursive: true });
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  public getSessions(): Promise<ISession[]> {
    return Promise.all(
      fs
        .readdirSync(this.sessionsDirectory)
        .filter(session => {
          const sessionPath = path.join(this.sessionsDirectory, session);
          if (!fs.existsSync(sessionPath)) return false;
          const lstat = fs.lstatSync(sessionPath);
          if (!lstat.isDirectory()) return false;
          if (!fs.existsSync(path.join(sessionPath, this.sessionFile))) return false;
          return !/^\.archive$/i.test(session);
        })
        .map(session => {
          const json = JSON.parse(
            fs.readFileSync(path.join(this.sessionsDirectory, session, this.sessionFile), {
              encoding: 'utf8',
            }),
          );
          return new ServiceSession(json);
        })
        .sort((a, b) => b.started - a.started),
    );
  }
}
