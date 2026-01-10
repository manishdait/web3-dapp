import { Injectable } from "@angular/core";
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { TransactionService } from "./transaction.service";


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
  isAdmin: boolean = false;
  address: string | null = null;

  private browserProvider: BrowserProvider | null = null;
  private rpcSigner: JsonRpcSigner | null = null;

  constructor (public transactionService: TransactionService) {
    console.log("WalletService");
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
      
      const admin = await this.transactionService.getAdmin();
      this.isAdmin = admin === this.address;

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
      throw Error('Wallect not connected, not signer found.');
    }

    return this.rpcSigner;
  } 
}