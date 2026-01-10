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
  loading = signal(true);
  processing = signal(false);
  voating = signal(false);

  shadows = new Array(5);

  constructor () {
    this.walletService.connect.subscribe(() => {
      if (this.walletService.address !== null) {
        this.transactionService.isVoterRegister(this.electionId, this.walletService.address)
          .then(data => this.hasRegister.set(data));

        this.transactionService.canVote(this.electionId, this.walletService.address)
          .then(data => this.canVote.set(data));
      }
    });

    this.loading.set(true);
    this.transactionService.getElection(this.electionId)
      .then(data => {
        this.election.set(data);
        this.loading.set(false);
      })
      .catch(error => {
        console.error(error);
        this.loading.set(false);
      });
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
    this.processing.set(true);
    try {
      await this.transactionService.registerCandidate(this.electionId, candidateName, this.walletService.signer);
    } catch (e) {
      console.error(e);
    } finally {
      this.processing.set(false);
      this.toggleCandidateForm();
    }
  }

  async registerVoterTx(voterAddress: string) {
    this.processing.set(true);

    try {
      await this.transactionService.registerVoter(this.electionId, voterAddress, this.walletService.signer);
    } catch (e) {
      console.error(e);
    } finally {
      this.processing.set(false);
      this.toggleVoterForm();
    }
  }

  async startElectionTx() {
    this.processing.set(true);
    try {
      await this.transactionService.startElection(this.electionId, this.walletService.signer);
    } catch (e) {
      console.error(e);
    } finally {
      this.processing.set(false);
    }
  }

  async castVoteTx(candidateId: number) {
    this.voating.set(true);
    try {
      await this.transactionService.castVote(this.electionId, candidateId, this.walletService.signer);
    } catch (e) {
      console.error(e);
    } finally {
      this.voating.set(false);
    }
  }

  async endElectionTx() {
    this.processing.set(true);
    try {
      await this.transactionService.endElection(this.electionId, this.walletService.signer);
      } catch (e) {
      console.error(e);
    } finally {
      this.processing.set(false);
    }
  }
}