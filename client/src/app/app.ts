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

  constructor () {
    if (!this.walletService.hasWallet) {
      // todo: add a alert dialog box
      alert("No Wallet Detected");
    }
  }

  async connectWallet() {
    const connected = await this.walletService.connectWallet();
    
    if (connected) {
      this.isAdmin.set(this.walletService.isAdmin);
    }
  }

  async createElectionTx(electionName: string) {
    this.transactionService.createElection(electionName, this.walletService.signer);
  }

  toggleElectionForm() {
    this.electionForm.update(toggle => !toggle);
  }
}
