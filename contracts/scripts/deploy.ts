import { network } from "hardhat";

const { ethers } = await network.connect()

async function main() {
  const contractFactory = await ethers.getContractFactory('Voating');
  const contract = await contractFactory.deploy();
  const address = await contract.getAddress();

  console.log(`Contract deploy at ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => process.exit(1))