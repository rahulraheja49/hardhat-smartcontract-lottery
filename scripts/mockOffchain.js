const { ethers, network } = require("hardhat");
const { keccak256 } = require("@ethersproject/keccak256");
const { toUtf8Bytes } = require("@ethersproject/strings");

async function mockKeepers() {
  const raffle = await ethers.getContract("Raffle");
  const checkData = keccak256(toUtf8Bytes(""));
  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall(checkData);
  if (upkeepNeeded) {
    const tx = await raffle.performUpkeep(checkData);
    const txReceipt = await tx.wait(1);
    const requestId = txReceipt.logs[1].args.requestId;
    console.log(`ChainId: ${network.config.chainId}`);
    console.log(`Performed upkeep with RequestId: ${requestId}`);
    if (network.config.chainId == 31337) {
      await mockVrf(requestId, raffle);
    }
  } else {
    console.log("No upkeep needed!");
  }
}

async function mockVrf(requestId, raffle) {
  console.log("We on a local network? Ok let's pretend...");
  const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  const raffleAddress = await raffle.getAddress();
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffleAddress);
  console.log("Responded!");
  const recentWinner = await raffle.getRecentWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
