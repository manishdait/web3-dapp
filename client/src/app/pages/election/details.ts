import { Component, inject, signal } from "@angular/core";
import { TransactionService } from "../../services/transaction.service";
import { ActivatedRoute } from "@angular/router";
import { Election } from "../../model/election.model";
import { App } from "../../app";
import { WalletService } from "../../services/wallet.service";

@Component({
  selector: 'app-election',
  imports: [],
  templateUrl: './details.html'
})
export class Details {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly walletService = inject(WalletService);
  private readonly transactionService = inject(TransactionService);

  private readonly appComponent = inject(App);

  electionId: number = this.activeRoute.snapshot.params['id'];
  election = signal<Election | null>(null);

  candidateForm = signal(false);

  constructor () {
    this.transactionService.getElection(this.electionId)
      .then(data => this.election.set(data));
  }

  isAdmin() {
    return this.appComponent.isAdmin();
  }

  toggleCandidateForm() {
    this.candidateForm.update(toggle => !toggle);
  }

  async registerCandidateTx(candidateName: string) {
    this.transactionService.registerCandidate(this.electionId, candidateName, this.walletService.signer);
  }
}