// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

error NotAdmin();
error ElectionNotExists();
error ElectionNotActive();
error ElectionAlreadyActive();
error ElectionAlreadyEnded();
error ElectionNotEnded();
error VoterNotRegistered();
error AlreadyVoted();
error InvalidCandidate();
error CandidatesLocked();
error VotersLocked();

contract Voating {
    event ElectionCreated(uint256 indexed electionId, string name);
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoterRegister(uint256 indexed electionId, address voter);
    event VoteCast(uint256 indexed electionId, address indexed voter);
    event ElectionEnded(uint256 indexed electionId);
    event ElectionStarted(uint256 indexed electionId);

    enum ElectionState {
        INITIATED,
        ACTIVE,
        ENDED
    }

    struct Election {
        string name;
        ElectionState state;
    }

    struct Candidate {
        string name;
        uint256 count;
    }

    address public admin;
    uint256 public electionCount;

    mapping(uint256 => Election) private elections;
    mapping(uint256 => Candidate[]) private candidates;
    mapping(uint256 => mapping(address => bool)) private registerVoters;
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier electionExists(uint256 electionId) {
        if (electionId >= electionCount) revert ElectionNotExists();
        _;
    }


    constructor() {
        admin = msg.sender;
    }

    function createElection(string calldata electionName) external onlyAdmin {
        elections[electionCount] = Election({
            name: electionName, 
            state: ElectionState.INITIATED
        });

        emit ElectionCreated(electionCount, electionName);
        electionCount++;
    }

    function addCandidates(uint256 electionId, string calldata candidateName) external onlyAdmin electionExists(electionId) {
        Election memory election = elections[electionId];

        if (election.state != ElectionState.INITIATED) revert CandidatesLocked();

        candidates[electionId].push(
            Candidate({name: candidateName, count: 0})
        );

        emit CandidateAdded(
            electionId, 
            candidates[electionId].length - 1, 
            candidateName
        );
    }

    function registerVoter(uint256 electionId, address voter) external onlyAdmin electionExists(electionId) {
        Election memory election = elections[electionId];

        if (election.state != ElectionState.INITIATED) revert VotersLocked();

        registerVoters[electionId][voter] = true;
        emit VoterRegister(electionId, voter);
    }

    function startElection(uint256 electionId) external onlyAdmin electionExists(electionId) {
        Election storage election = elections[electionId];

        if (election.state == ElectionState.ACTIVE) revert ElectionAlreadyActive();
        if (election.state == ElectionState.ENDED) revert ElectionAlreadyEnded();

        election.state = ElectionState.ACTIVE;

        emit ElectionStarted(electionId);
    }

    function endElection(uint256 electionId) external onlyAdmin electionExists(electionId) {
        Election storage election = elections[electionId];

        if (election.state == ElectionState.ENDED) revert ElectionAlreadyEnded();

        election.state = ElectionState.ENDED;

        emit ElectionEnded(electionId);
    }

    function vote(uint256 electionId, uint256 candidateId) external electionExists(electionId) {
        Election storage election = elections[electionId];

        if (election.state != ElectionState.ACTIVE) revert ElectionNotActive();
        if (!registerVoters[electionId][msg.sender]) revert VoterNotRegistered();
        if (hasVoted[electionId][msg.sender]) revert AlreadyVoted();
        if (candidateId >= candidates[electionId].length) revert InvalidCandidate();
        
        hasVoted[electionId][msg.sender] = true;
        candidates[electionId][candidateId].count++;

        emit VoteCast(electionId, msg.sender);
    }

    function getElection(uint256 electionId) external view electionExists(electionId) returns (string memory name, ElectionState state) {
        Election storage election = elections[electionId];
        return (election.name, election.state);    
    }

    function getCandidates(uint256 electionId) external view electionExists(electionId) returns (Candidate[] memory) {
       return candidates[electionId];
    }

    function hasUserVoted(uint256 electionId, address voter) external view electionExists(electionId) returns (bool) {
        return hasVoted[electionId][voter];
    }

    function isVoterRegister(uint256 electionId, address voter) external view electionExists(electionId) returns (bool) {
        return registerVoters[electionId][voter];
    }
}
