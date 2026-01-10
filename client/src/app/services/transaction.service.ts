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

  async getAdmin(): Promise<string> {
    return await this.contract!.connect(this.rpcProvider).admin()
  }

  async getElections(): Promise<Election[]> {
    const count: number = Number(await this.contract!.connect(this.rpcProvider).electionCount());
    const elections: Election[] = [];

    for (let i = 0; i < count; i++) {
      const election = await this.contract!.connect(this.rpcProvider).getElection(i);
      const candidates: Candidates[] =await this.getCandidates(i);
      
      elections.push({
        id: i,
        name: election.name,
        state: Number(election.state),
        candidates: candidates
      });
    }

    return elections;
  }

  async getCandidates(candidateId: number): Promise<Candidates[]> {
    const fetchCanidates = await this.contract!.connect(this.rpcProvider).getCandidates(candidateId);
    const candidates: Candidates[] = [];

    for (let j = 0; j < fetchCanidates.length; j++) {
      const candidate = fetchCanidates[j];
        
      candidates.push({
        id: j,
        name: candidate.name,
        voteCount: Number(candidate.count)
      });
    }

    return candidates;
  }

  async createElection(electionName: string, signer: JsonRpcSigner) {
    await this.contract!.connect(signer).createElection(electionName);
  }

  async getElection(electionId: number): Promise<Election> {
    const fetchElection = await this.contract!.getElection(electionId);
    const candidates = await this.getCandidates(electionId);

    return {
      id: electionId,
      name: fetchElection.name,
      state: Number(fetchElection.state),
      candidates: candidates
    }
  }

  async registerCandidate(electionId: number, candidateName: string, signer: JsonRpcSigner) {
    await this.contract!.connect(signer).addCandidates(electionId, candidateName);
  }
}