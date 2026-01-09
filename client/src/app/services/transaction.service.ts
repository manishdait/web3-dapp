import { Injectable } from "@angular/core";
import { JsonRpcProvider, JsonRpcSigner } from "ethers";

import { Voating, Voating__factory } from '../../../../contracts/types/ethers-contracts/index';
import { Election } from "../model/election.model";
import { Candidates } from "../model/candidates.model";

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly rpcProvider = new JsonRpcProvider('http://127.0.0.1:8545')
  private readonly contract: Voating | null = null;

  constructor () {
    this.contract = Voating__factory.connect("0x5FbDB2315678afecb367f032d93F642f64180aa3", this.rpcProvider);
  }

  async getElections() {
    const count: number = Number(await this.contract!.connect(this.rpcProvider).electionCount());
    const elections: Election[] = [];

    for (let i = 0; i < count; i++) {
      const election = await this.contract!.connect(this.rpcProvider).getElection(i);
      const fetchCanidates = await this.contract!.connect(this.rpcProvider).getCandidates(i);

      const candidates: Candidates[] = [];
      
      for (let j = 0; j < fetchCanidates.length; j++) {
        const candidate = fetchCanidates[j];
        
        candidates.push({
          id: j,
          name: candidate.name,
          voteCount: Number(candidate.count)
        });
      }

      elections.push({
        id: i,
        name: election.name,
        isActive: election.isActive,
        isEnded: election.isEnded,
        candidates: candidates
      });
    }

    return elections;
  }

  async createElection(provider: JsonRpcSigner, electionName: string) {
    console.log("caliing");
    
    await this.contract!.connect(provider).createElection(electionName);
    console.log("done");
    
  }
}