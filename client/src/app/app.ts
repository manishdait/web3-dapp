import { Component, inject, signal } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { TransactionService } from './services/transaction.service';
import { Election } from './model/election.model';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly walletService = inject(WalletService);
  private readonly transactionService = inject(TransactionService);

  elections = signal<Election[]>([]);

  constructor () {
    if (!this.walletService.hasWallet) {
      // todo: add a alert dialog box
      alert("No Wallet Detected");
    }

    this.transactionService.getElections()
      .then(v => {
        this.elections.set(v);
        console.log(this.elections());
      });
  }

  async connectWallet() {
    const connected = await this.walletService.connectWallet();
    console.log(connected);
  }

  async createElection() {
    this.transactionService.createElection(this.walletService.signer, "Test Election");
  }
}
