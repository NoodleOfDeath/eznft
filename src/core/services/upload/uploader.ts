import * as fs from 'fs-extra';
import * as path from 'path';
import {
  IIpfsHash,
  IAsset,
  AssetCreate,
  IUploadService,
  IUploadServiceProps,
  IUploadServiceProviderProps,
  EUploadServiceType,
  ETaskStatus,
  ITaskStatusChange,
  ISessionProps,
  EServiceType,
  IUploadOptions,
} from '../../../types';
import { ABaseResumableService } from '../resumable';
import { ServiceSession, SessionTask } from '../session';
import { PinataUploadService } from './pin';

export abstract class ABaseUploadService extends ABaseResumableService implements IUploadService {
  public readonly serviceType = EServiceType.UPLOAD_SERVICE;

  public readonly apiKey: string;
  public readonly secretApiKey: string;

  public constructor({
    logLevel,
    workspace,
    workingDirectory,
    session,
    sessionId,
    schedulerOptions,
    apiKey,
    secretApiKey,
  }: IUploadServiceProps) {
    // Divide the rate in half because each NFT is two API requests
    super({
      logLevel,
      workspace,
      workingDirectory,
      session,
      sessionId,
      schedulerOptions: schedulerOptions,
    });
    this.apiKey = apiKey;
    this.secretApiKey = secretApiKey;
  }

  public abstract upload(asset: IAsset): Promise<IIpfsHash>;

  private makeSessionTask(
    sourcePath: string,
    file: string,
    index: number,
    total: number,
    ignoreImages = false,
    uploadJson = false,
  ): SessionTask {
    const newTask = new SessionTask({
      id: file,
      service: this,
      session: this.session,
      status: ETaskStatus.QUEUED,
      payload: {
        sourcePath,
        file,
      },
      run: () => {
        return new Promise<ITaskStatusChange>(async (resolve, reject) => {
          await newTask.update({ status: ETaskStatus.RUNNING });
          const matches = /\w+(?=\.)/.exec(file);
          if (!matches || !matches[0]) {
            this.ERROR(`Unknown parsing error occured parsing the filename: "${file}"`, null, reject);
            return;
          }
          const jsonFile = `${matches[0]}.json`;
          let json = JSON.parse(fs.readFileSync(path.join(sourcePath, 'json', jsonFile), { encoding: 'utf8' }));

          const updateJsonFromIpfs = async (ipfsHash: IIpfsHash) => {
            await this.session.recordState();
            json.image = `ipfs://${ipfsHash}`;
            if (json.compiler) delete json.compiler;
            fs.writeFileSync(path.join(sourcePath, 'json', jsonFile), JSON.stringify(json, null, 2));
            this.LOG(
              `[${`${index + 1}/${total}`.padStart(2 * Math.log(total) + 1, ' ')} - ${`${Math.round(
                ((index + 1) / total) * 100,
              )}`.padStart(3, ' ')}%] Uploaded image file for "${json.name}" to ipfs://${ipfsHash}`,
            );
            if (uploadJson) {
              uploadJsonToIpfs();
            } else {
              await newTask.update({ status: ETaskStatus.SUCCESS, payload: { hash: ipfsHash } });
              resolve({
                status: ETaskStatus.SUCCESS,
                payload: ipfsHash,
              });
            }
          };

          const uploadJsonToIpfs = () => {
            this.upload(AssetCreate({ filePath: path.join(sourcePath, 'json', jsonFile) }))
              .then(async _ipfsHash => {
                this.LOG(
                  `[${`${index + (ignoreImages ? 1 : 2)}/${total}`.padStart(
                    2 * Math.log(total) + 1,
                    ' ',
                  )} - ${`${Math.round(((index + (ignoreImages ? 1 : 2)) / total) * 100)}`.padStart(
                    3,
                    ' ',
                  )}%] Uploaded JSON file for "${json.name}" to ipfs://${_ipfsHash}`,
                );
                await newTask.update({ status: ETaskStatus.SUCCESS, payload: { hash: _ipfsHash } });
                resolve({
                  status: ETaskStatus.SUCCESS,
                  payload: _ipfsHash,
                });
              })
              .catch(async (e: Error) => {
                this.ERROR(`Failed to upload json file for "${file}"`);
                await newTask.update({ status: ETaskStatus.FAILED });
                resolve({
                  status: ETaskStatus.FAILED,
                  payload: e.message,
                });
              });
          };

          if (!ignoreImages) {
            this.upload(AssetCreate({ filePath: path.join(sourcePath, 'images', file) })).then(updateJsonFromIpfs);
          } else if (uploadJson) {
            uploadJsonToIpfs();
          }
        });
      },
    });
    return newTask;
  }

  public uploadAssets(source: string, options?: IUploadOptions): Promise<IIpfsHash[]> {
    return new Promise<any>(async (resolve, reject) => {
      const sourcePath = path.resolve(source);
      if (!fs.existsSync(sourcePath)) {
        this.ERROR(`Path "${sourcePath}" does not exists`, null, reject);
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'images'))) {
        this.ERROR(`Source path "${sourcePath}" is missing an "images" directory.`, null, reject);
        return;
      } else if (!fs.existsSync(path.join(sourcePath, 'json'))) {
        this.ERROR(`Source path "${sourcePath}" is missing a "json" directory.`, null, reject);
        return;
      }
      const files = fs.readdirSync(path.join(sourcePath, 'images'));
      const deltaRate = options?.uploadJson ? 50 : 100;
      let rate = this.schedulerOptions?.rate || deltaRate;
      if (rate > deltaRate) {
        this.schedulerOptions.rate = deltaRate;
      }
      this.session = this.generateSession();
      this.start(
        files.map((file, i) =>
          this.makeSessionTask(
            sourcePath,
            file,
            i * (!options?.ignoreImages && options?.uploadJson ? 2 : 1),
            (options?.ignoreImages ? 0 : files.length) + (options?.uploadJson ? files.length : 0),
            options?.ignoreImages,
            options?.uploadJson,
          ),
        ),
      ).then(statuses => {
        return this.cleanup(statuses, resolve);
      });
    });
  }

  private cleanup(
    statuses: ITaskStatusChange[],
    resolve: (value: ITaskStatusChange[] | PromiseLike<ITaskStatusChange[]>) => void,
  ) {
    this.session.archive();
    const successes = statuses.filter(s => s.status === ETaskStatus.SUCCESS);
    this.LOG(`Uploaded ${successes.length} of ${statuses.length} assets`);
    fs.writeFileSync(path.join(process.cwd(), 'hashes.json'), JSON.stringify(statuses, null, 2));
    this.LOG('DONE');
    this.stop();
    resolve(statuses);
  }

  public resume(sessionProps: ISessionProps): Promise<ITaskStatusChange[]> {
    return new Promise<ITaskStatusChange[]>(async resolve => {
      this.session = new ServiceSession(sessionProps);
      const subtasks = (this.session.tasks || []).filter(task => task.status !== ETaskStatus.SUCCESS);
      let i = 0;
      const tasks = this.session.tasks.map(task => {
        if (!(task instanceof SessionTask)) {
          const sourcePath = task.payload?.sourcePath;
          const file = task.payload?.file;
          if (!sourcePath || !file) {
            this.ERROR('OH NO!');
          }
          if (task.status === ETaskStatus.SUCCESS) {
            return new SessionTask(task);
          }
          return this.makeSessionTask(sourcePath, file, i++, subtasks.length);
        }
        return task;
      });
      return this.start(tasks)
        .then(statuses => this.cleanup(statuses, resolve))
        .catch(e => console.log(e));
    });
  }
}

export abstract class UploadService {
  public static load(props: IUploadServiceProviderProps) {
    switch (props.serviceName) {
      case EUploadServiceType.PINATA:
      default:
        return new PinataUploadService(props);
    }
  }
}
