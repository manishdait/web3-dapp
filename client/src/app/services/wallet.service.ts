import { Injectable } from "@angular/core";
import { BrowserProvider, JsonRpcSigner } from 'ethers';


declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  hasWallet: boolean = false;
  address: string | null = null;

  private browserProvider: BrowserProvider | null = null;
  private rpcSigner: JsonRpcSigner | null = null;

  constructor () {
    if (window.ethereum || window.ethereum !== undefined) {
      this.hasWallet = true;
    }
  }

  async connectWallet(): Promise<boolean> {
    if (!window.ethereum || window.ethereum === undefined) {
      return false
    }

    try {
      await window.ethereum.request({method: 'eth_requestAccounts'});

      this.browserProvider = new BrowserProvider(window.ethereum);
      this.rpcSigner = await this.browserProvider.getSigner();

      this.address = await this.signer.getAddress();

      return true;
    } catch (error) {
      return false;
    }
  }

  get provider(): BrowserProvider {
    if (this.browserProvider == null) {
      throw Error('Wallect not connected, not provider found.');
    }

    return this.browserProvider;
  }

  get signer(): JsonRpcSigner {
    if (this.rpcSigner == null) {
      throw Error('Wallect not connected, not provider found.');
    }

    return this.rpcSigner;
  } 
}