# web3-voating-dapp

A simple Web3 Voting Dapp built for learning purposes using **Solidity**, **Hardhat**, and **Angular**. This project demonstrates how use hardhat and angular to interact with solidity contract.

## Features
- Create elections
- Add candidates
- Register voters
- Cast votes (one vote per wallet)
- End elections
- View election results
- Basic Angular UI connected to smart contracts

## Running the Project Locally

### Prerequisites
- Node.js
- Bun
- MetaMask browser extension

### Clone Project
```bash
git clone https://github.com/manishdait/web3-voating-dapp
```
### Start Local Blockchain and Deploy Contract
```bash
cd contracts
bun install

# Start Local Blockchain
bunx hardhat node

# Deploy contract
bunx hardhat run scripts/deploy.ts --network hardhat
```

### Run the Frontend
```bash
cd client
bun install
bun start
```
Open browser at: `http://localhost:4200`

### Connect MetaMask
- Add Hardhat network to MetaMask
- Import a test account using private key from Hardhat node output
- Connect wallet to the app

### Run Smart Contract Tests
```bash
bunx hardhat test
```
