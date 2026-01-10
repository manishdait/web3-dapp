import { Component, inject, signal } from "@angular/core";
import { TransactionService } from "../../services/transaction.service";
import { App } from "../../app";
import { Election } from "../../model/election.model";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home {
  private readonly transactionService = inject(TransactionService);
  private readonly appComponent = inject(App)

  elections = signal<Election[]>([]);
  processing = signal(false);

  shadows = new Array(5);

  constructor () {
    this.processing.set(true)
    this.transactionService.getElections()
      .then(data => {  
        this.elections.set(data);
        this.processing.set(false);
      })
      .catch(error => {
        console.error(error);
        this.processing.set(false);
      });
  }

  isAdmin() {
    return this.appComponent.isAdmin();
  }

  toggleElectionForm() {
    this.appComponent.toggleElectionForm();
  }
}