const {ethers} = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  const betnft = await ethers.deployContract('BetNFT');
  await betnft.waitForDeployment();

  console.log('BetNFT deployed to:', betnft.target);
  console.log('Deployer address:', deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})