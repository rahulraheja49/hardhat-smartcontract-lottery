const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      let raffle, raffleEntranceFee, deployer;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live chainlink keepers and chainlink vrf, we get a random winner", async function () {
          const startingTimestamp = await raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();

          console.log("Entering raffle");
          const txResponse = await raffle.enterRaffle({
            value: raffleEntranceFee,
          });
          const txReceipt = await txResponse.wait(6);
          console.log("Time to wait");
          const winnerStartingBalance = await ethers.provider.getBalance(
            accounts[0],
          );

          expect(txReceipt).to.emit(raffle, "WinnerPicked");

          // await new Promise(async (resolve, reject) => {
          //   raffle.once("WinnerPicked", async () => {
          console.log("WinnerPicked event fired");
          try {
            const recentWinner = await raffle.getRecentWinner();
            const raffleState = await raffle.getRaffleState();
            const winnerEndingBalance = await ethers.provider.getBalance(
              accounts[0],
            );
            const endingTimeStamp = await raffle.getLatestTimeStamp();

            await expect(raffle.getPlayer(0)).to.be.reverted;
            assert.equal(recentWinner.toString(), accounts[0].address);
            assert.equal(raffleState, 0);
            assert.equal(
              winnerEndingBalance.toString(),
              (winnerStartingBalance + raffleEntranceFee).toString(),
            );
            assert(endingTimeStamp > startingTimestamp);
            // resolve();
          } catch (error) {
            console.log(error);
            // reject(error);
          }
          //   });
          // });
        });
      });
    });
