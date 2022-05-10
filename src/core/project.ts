import * as fs from 'fs-extra';
import * as path from 'path';
import { IProject, IProjectProps, IUploadServiceProviderProps } from '../types';
import { ABaseLoggable } from './loggable';
import { version as cliVersion } from '../package.json';
import { IGeneratorServiceProviderProps } from './services';

export class Project extends ABaseLoggable implements IProject {
  public logIdentifier: string = Project.name;

  public readonly workingDirectory: string;
  public version: string;
  public name: string;
  public prefix: string;
  public description: string;
  public generate?: IGeneratorServiceProviderProps;
  public upload?: IUploadServiceProviderProps;

  public constructor({
    logLevel,
    workingDirectory,
    version,
    name,
    prefix,
    description,
    generate,
    upload,
  }: IProjectProps) {
    super({ logLevel });
    this.workingDirectory = path.resolve(workingDirectory || process.cwd());
    try {
      const props = JSON.parse(
        fs.readFileSync(path.join(this.workingDirectory, 'eznft.proj.json'), { encoding: 'utf8' }),
      );
      this.version = props.version || version || cliVersion;
      this.name = props.name || name || 'Collection name';
      this.prefix = props.version.prefix || prefix || 'Prefix to go before each edition';
      this.description = props.description || description || 'Collection description';
      this.generate = props.generate || generate || { serviceName: 'hashlips' };
      this.upload = props.upload ||
        upload || {
          serviceName: 'pinata',
          apiKey: '',
          secretApiKey: '',
        };
    } catch (e) {
      this.version = version || cliVersion;
      this.name = name || 'Collection name';
      this.prefix = prefix || 'Prefix to go before each edition';
      this.description = description || 'Collection description';
      this.generate = generate || { serviceName: 'hashlips' };
      this.upload = upload || {
        serviceName: 'pinata',
        apiKey: '',
        secretApiKey: '',
      };
    }
  }

  public init(): Promise<boolean> {
    const projectFile = path.join(this.workingDirectory, 'eznft.proj.json');
    fs.writeFileSync(projectFile, JSON.stringify(this, null, 2));
    return Promise.resolve(true);
  }
}
