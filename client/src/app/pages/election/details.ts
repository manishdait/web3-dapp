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
  voterForm = signal(false);

  hasRegister = signal(false);
  canVote = signal(false);

  address = signal(this.walletService.address);

  constructor () {
    this.walletService.connect.subscribe(() => {
      if (this.walletService.address !== null) {
        this.transactionService.isVoterRegister(this.electionId, this.walletService.address)
          .then(data => this.hasRegister.set(data));

        this.transactionService.canVote(this.electionId, this.walletService.address)
          .then(data => this.canVote.set(data));
      }
    });

    this.transactionService.getElection(this.electionId)
      .then(data => this.election.set(data));
    
    
  }

  isAdmin() {
    return this.appComponent.isAdmin();
  }

  toggleCandidateForm() {
    this.candidateForm.update(toggle => !toggle);
  }

  toggleVoterForm() {
    this.voterForm.update(toggle => !toggle);
  }

  async registerCandidateTx(candidateName: string) {
    this.transactionService.registerCandidate(this.electionId, candidateName, this.walletService.signer);
  }

  async registerVoterTx(voterAddress: string) {
    this.transactionService.registerVoter(this.electionId, voterAddress, this.walletService.signer);
  }

  async startElectionTx() {
    this.transactionService.startElection(this.electionId, this.walletService.signer);
  }

  async castVoteTx(candidateId: number) {
    this.transactionService.castVote(this.electionId, candidateId, this.walletService.signer);
  }

  async endElectionTx() {
    this.transactionService.endElection(this.electionId, this.walletService.signer);
  }
}