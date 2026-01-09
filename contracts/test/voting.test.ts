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
    it('should set the internal parameter', async () => {
      const admin = await contract.admin();
      const expectedAdmin = signers[0].address;

      assert.equal(admin, expectedAdmin);
    });
  });

  describe('createElection()', async function () {
    it('should create an election with given name', async () => {
      await expect(contract.createElection('Test Election'))
        .to.emit(contract, 'ElectionCreated')
        .withArgs(0, 'Test Election');

      const election = await contract.getElection(0);
      expect(election.name).to.equal("Test Election");
      expect(election.isActive).to.equal(true);
      expect(election.isEnded).to.equal(false);
    });

    it('should raise error on creating election if not admin', async () => {
      await expect(contract.connect(signers[1]).createElection('Test Election'))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('addCandidates()', async function () {
    beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should add candidate for valid elction', async () => {
      await expect(contract.addCandidates(0, 'Jhon'))
        .to.emit(contract, 'CandidateAdded')
        .withArgs(0, 0, 'Jhon');

      const candidates = await contract.getCandidates(0);
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].name, 'Jhon');
    });

    it('should raise error when candiated added to ended election', async () => {
      await contract.endElection(0);
      await expect(contract.addCandidates(0, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'CandidatesLocked');
    });

    it('should raise error when candiated added with invalid election id', async () => {
      await expect(contract.addCandidates(1, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error when candiated added by not admin', async () => {
      await expect(contract.connect(signers[1]).addCandidates(0, 'Jhon'))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('registerVoter()', async function() {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should register the voter', async () => {
      await expect(contract.registerVoter(0, signers[1].address))
        .to.emit(contract, "VoterRegister")
        .withArgs(0, signers[1].address);
      
      assert.equal(await contract.isVoterRegister(0, signers[1].address), true);
    });

    it('should raise error when register voter with invalid election id', async () => {
      await expect(contract.registerVoter(1, signers[0].address))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error when register voter by not admin', async () => {
      await expect(contract.connect(signers[1]).registerVoter(0, signers[1].address))
        .to.be.revertedWithCustomError(contract, 'NotAdmin');
    });
  });

  describe('endElection()', async function () {
    this.beforeEach(async () => {
      await contract.createElection('Test Election');
    });

    it('should end an election', async () => {
      await expect(contract.endElection(0))
        .to.emit(contract, "ElectionEnded")
        .withArgs(0);

      const election = await contract.getElection(0);
      assert.equal(election.name, 'Test Election');
      assert.equal(election.isActive, false);
      assert.equal(election.isEnded, true);
    });

    it('should raise error when election ended id election already ended', async () => {
      await contract.endElection(0);

      await expect(contract.endElection(0))
        .to.be.revertedWithCustomError(contract, 'ElectionAlreadyEnded');
    });

    it('should raise error when end election with invalid election id', async () => {
      await expect(contract.endElection(1))
        .to.be.revertedWithCustomError(contract, 'ElectionNotExists');
    });

    it('should raise error when election ended by not admin', async () => {
      await expect(contract.connect(signers[1]).endElection(0))
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
      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.emit(contract, "VoteCast")
        .withArgs(0, signers[1].address);
      
      assert.equal(await contract.hasUserVoted(0, signers[1].address), true);

      const candidates = await contract.getCandidates(0);
      assert.equal(candidates[0].count, BigInt(1));
      assert.equal(candidates[1].count, BigInt(0));
    });

    it('should raise error if voter already cast vote', async () => {
      await contract.connect(signers[1]).vote(0, 0);
      assert.equal(await contract.hasUserVoted(0, signers[1].address), true);

      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "AlreadyVoted");
    });

    it('should raise error on vote if election ended', async () => {
      await contract.endElection(0);

      await expect(contract.connect(signers[1]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "ElectionNotActive");
    });

    it('should raise error on vote if voter not register', async () => {
      await expect(contract.connect(signers[2]).vote(0, 0))
        .to.be.revertedWithCustomError(contract, "VoterNotRegistered");
    });
    
    it('should raise error on vote if invalid candidate', async () => {
      await expect(contract.connect(signers[1]).vote(0, 2))
        .to.be.revertedWithCustomError(contract, "InvalidCandidate");
    });

   it('should raise error on vote if invalid election', async () => {
      await expect(contract.connect(signers[1]).vote(1, 0))
        .to.be.revertedWithCustomError(contract, "ElectionNotExists");
    });
  });
});