import { network } from 'hardhat';
import { assert, expect } from 'chai';

import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import type { Voating, Voating__factory } from '../types/ethers-contracts/index.js';

describe('Voating', async function () {
  let signers: HardhatEthersSigner[];
  let contract: Voating;

  this.beforeEach(async () => {
    const { ethers } = await network.connect();
    signers = await ethers.getSigners();

    const contractFactory: Voating__factory = await ethers.getContractFactory('Voating', signers[0]);
    contract = await contractFactory.deploy();
  });

  describe('constructor()', async function () {
    it('should set the constuctor param admin for the contract', async () => {
      const admin = await contract.admin();
      const expectedAdmin = signers[0].address;

      assert.equal(admin, expectedAdmin);
    });
  });

  describe('createElection()', async function () {
    it('should create an election with given name if call by admin', async () => {
      await expect(contract.createElection('Test Election'))
        .to.emit(contract, 'ElectionCreated')
        .withArgs(0, 'Test Election');

      const election = await contract.getElection(0);
      expect(election.name).to.equal("Test Election");
      expect(election.state).to.equal(BigInt(0))
    });

    it('should raise error on create election if not call by admin', async () => {
      await expect(contract.connect(signers[1]).createElection('Test Election'))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('addCandidates()', async function () {
    beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should add candidate if election state is initiated', async () => {
      await expect(contract.addCandidates(0, 'Jhon'))
        .to.emit(contract, 'CandidateAdded')
        .withArgs(0, 0, 'Jhon');

      const candidates = await contract.getCandidates(0);
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].name, 'Jhon');
    });

    it('should raise error on add candidate if election state is active', async () => {
      await contract.startElection(0);

      await expect(contract.addCandidates(0, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'CandidatesLocked');
    });

    it('should raise error on add candidate if election state is ended', async () => {
      await contract.endElection(0);

      await expect(contract.addCandidates(0, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'CandidatesLocked');
    });

    it('should raise error on add candiate for an invalid election id', async () => {
      await expect(contract.addCandidates(1, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error on add candiate if call by non admin', async () => {
      await expect(contract.connect(signers[1]).addCandidates(0, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('registerVoter()', async function() {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should register the voter if election state is initiated', async () => {
      await expect(contract.registerVoter(0, signers[1].address))
        .to.emit(contract, "VoterRegister")
        .withArgs(0, signers[1].address);
      
      assert.equal(await contract.isVoterRegister(0, signers[1].address), true);
    });

    it('should raise error on register voter if election state is active', async () => {
      await contract.startElection(0);

      await expect(contract.registerVoter(0, signers[0].address))
        .to.be.revertedWithCustomError(contract, 'VotersLocked');
    });

    it('should raise error on register voter if election state is ended', async () => {
      await contract.endElection(0);

      await expect(contract.registerVoter(0, signers[0].address))
        .to.be.revertedWithCustomError(contract, 'VotersLocked');
    });

    it('should raise error on register voter for an invalid election id', async () => {
      await expect(contract.registerVoter(1, signers[0].address))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error on register voter if call by non admin', async () => {
      await expect(contract.connect(signers[1]).registerVoter(0, signers[1].address))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('endElection()', async function () {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should end an election if election is not already ended', async () => {
      await expect(contract.endElection(0))
        .to.emit(contract, "ElectionEnded")
        .withArgs(0);

      const election = await contract.getElection(0);
      assert.equal(election.name, 'Test Election');
      assert.equal(election.state, BigInt(2))
    });

    it('should raise error on  end election if election already ended', async () => {
      await contract.endElection(0);

      await expect(contract.endElection(0))
        .to.be.revertedWithCustomError(contract, 'ElectionAlreadyEnded');
    });

    it('should raise error on end election for an invalid election id', async () => {
      await expect(contract.endElection(1))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error on end election if call by non admin', async () => {
      await expect(contract.connect(signers[1]).endElection(0))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('startElection()', async function () {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should start an election if election is not stated or ended already', async () => {
      await expect(contract.startElection(0))
        .to.emit(contract, "ElectionStarted")
        .withArgs(0);

      const election = await contract.getElection(0);
      assert.equal(election.name, 'Test Election');
      assert.equal(election.state, BigInt(1))
    });

    it('should raise error on start election if election already started', async () => {
      await contract.startElection(0);

      await expect(contract.startElection(0))
        .to.be.revertedWithCustomError(contract, 'ElectionAlreadyActive');
    });

    it('should raise error on start election if election has been ended', async () => {
      await contract.endElection(0);

      await expect(contract.startElection(0))
        .to.be.revertedWithCustomError(contract, 'ElectionAlreadyEnded');
    });

    it('should raise error on start election for an invalid election id', async () => {
      await expect(contract.startElection(1))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error on start election if call by non admin', async () => {
      await expect(contract.connect(signers[1]).startElection(0))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('vote()', async function () {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
      await contract.addCandidates(0, 'Jhon');
      await contract.addCandidates(0, 'Tim');
      await contract.registerVoter(0, signers[1].address);
    });

    it('should vote and increase count for candidate', async () => {
      await contract.startElection(0);
      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.emit(contract, "VoteCast")
        .withArgs(0, signers[1].address);
      
      assert.equal(await contract.hasUserVoted(0, signers[1].address), true);

      const candidates = await contract.getCandidates(0);
      assert.equal(candidates[0].count, BigInt(1));
      assert.equal(candidates[1].count, BigInt(0));
    });

    it('should raise error if voter already cast vote', async () => {
      await contract.startElection(0);
      await contract.connect(signers[1]).vote(0, 0);
      assert.equal(await contract.hasUserVoted(0, signers[1].address), true);

      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "AlreadyVoted");
    });

    it('should raise error on vote if election not started', async () => {
      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "ElectionNotActive");
    });

    it('should raise error on vote if election has been ended', async () => {
      await contract.startElection(0);
      await contract.endElection(0);

      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "ElectionNotActive");
    });

    it('should raise error on vote if voter has not register', async () => {
      await contract.startElection(0);
      await expect(contract.connect(signers[2]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "VoterNotRegistered");
    });
    
    it('should raise error on vote for an invalid candidate', async () => {
      await contract.startElection(0);
      await expect(contract.connect(signers[1]).vote(0, 2))
        .to.be.revertedWithCustomError(contract, "InvalidCandidate");
    });

   it('should raise error on vote for an invalid election', async () => {
    await contract.startElection(0);
      await expect(contract.connect(signers[1]).vote(1, 0))
        .to.be.revertedWithCustomError(contract, "ElectionNotExists");
    });
  });
});