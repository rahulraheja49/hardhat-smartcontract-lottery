const { ethers, network, artifacts } = require("hardhat");
const fs = require("fs");
const { FormatTypes } = require("@ethersproject/abi");

const FRONT_END_ADDRESSES_FILE =
  "../nextjs-smartcontract-lottery/constants/contractAddresses.json";
const FRONT_END_ABI_FILE = "../nextjs-smartcontract-lottery/constants/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end...");
    updateContractAddresses();
    updateAbi();
  }
};

async function updateAbi() {
  const raffleArtifact = await artifacts.readArtifact("Raffle");
  fs.writeFileSync(FRONT_END_ABI_FILE, JSON.stringify(raffleArtifact.abi));
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId.toString();
  const raffleAddress = await raffle.getAddress();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"),
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffleAddress)) {
      currentAddresses[chainId].push(raffleAddress);
    }
  } else {
    currentAddresses[chainId] = [raffleAddress];
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
