import { IDeployContractService } from '../../types';
import { ethers } from 'ethers';

export class NFTDeployContractService implements IDeployContractService {
  public async deploy() {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
  }
}
