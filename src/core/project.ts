import { IProject, IProjectProps } from 'src/types';
import { ABaseLoggable } from './loggable';

export class Project extends ABaseLoggable implements IProject {
  public get logIdentifier(): string {
    return 'Project';
  }

  public static get default(): IProject {
    return new Project({});
  }

  public constructor({ logLevel }: IProjectProps) {
    super({ logLevel });
  }

  public init(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
