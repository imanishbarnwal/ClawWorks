const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockAUSD
    const MockAUSD = await hre.ethers.getContractFactory("MockAUSD");
    const ausd = await MockAUSD.deploy();
    await ausd.waitForDeployment();
    const ausdAddress = await ausd.getAddress();
    console.log("MockAUSD deployed to:", ausdAddress);

    // 2. Deploy ClawRouter
    // Fee = 15% (1500 bps)
    const protocolTreasury = deployer.address; // For now
    const feeBps = 1500;

    const ProtocolFeeRouter = await hre.ethers.getContractFactory("ProtocolFeeRouter");
    const router = await ProtocolFeeRouter.deploy(ausdAddress, protocolTreasury, feeBps);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("ProtocolFeeRouter deployed to:", routerAddress);

    // 3. Deploy a Sample Agent Treasury
    const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");
    const agentTreasury = await AgentTreasury.deploy(deployer.address);
    await agentTreasury.waitForDeployment();
    const treasuryAddress = await agentTreasury.getAddress();
    console.log("AgentTreasury (Sample) deployed to:", treasuryAddress);

    // 4. Setup for Demo
    // Mint AUSD to the AgentTreasury
    const mintAmount = hre.ethers.parseEther("1000");
    await ausd.mint(treasuryAddress, mintAmount);
    console.log("Minted 1000 AUSD to AgentTreasury");

    // Verify
    console.log("Deployment Complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
