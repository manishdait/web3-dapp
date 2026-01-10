import { Component, inject, signal } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly transactionService = inject(TransactionService);
  private readonly walletService = inject(WalletService);

  isAdmin = signal(false);
  electionForm = signal(false);
  processing = signal(false);

  connectingWallet = signal(false);
  address = signal<string|null>(null);

  constructor () {
    if (!this.walletService.hasWallet) {
      // todo: add a alert dialog box
      alert("No Wallet Detected");
    }
  }

  async connectWallet() {
    this.connectingWallet.set(true);

    try {
      const connected = await this.walletService.connectWallet();
      if (connected) {
        this.isAdmin.set(this.walletService.isAdmin);  
        this.address.set(this.walletService.address);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.connectingWallet.set(false);
    } 
  }

  async createElectionTx(electionName: string) {
    this.processing.set(true);

    try {
      await this.transactionService.createElection(electionName, this.walletService.signer);
    } catch (e) {
      console.error(e);
    } finally {
      this.processing.set(false);
      this.toggleElectionForm();
    }
  }

  toggleElectionForm() {
    this.electionForm.update(toggle => !toggle);
  }
}
