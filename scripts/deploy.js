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

    // 3. Deploy Agent Treasuries
    const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");

    // Research Agent
    const researchAgent = await AgentTreasury.deploy(deployer.address);
    await researchAgent.waitForDeployment();
    const researchAddr = await researchAgent.getAddress();
    console.log("Research Agent Treasury:", researchAddr);

    // Data Agent
    const dataAgent = await AgentTreasury.deploy(deployer.address);
    await dataAgent.waitForDeployment();
    const dataAddr = await dataAgent.getAddress();
    console.log("Data Agent Treasury:    ", dataAddr);

    // SEO Agent
    const seoAgent = await AgentTreasury.deploy(deployer.address);
    await seoAgent.waitForDeployment();
    const seoAddr = await seoAgent.getAddress();
    console.log("SEO Agent Treasury:     ", seoAddr);

    // Formatting Agent
    const formattingAgent = await AgentTreasury.deploy(deployer.address);
    await formattingAgent.waitForDeployment();
    const formatAddr = await formattingAgent.getAddress();
    console.log("Formatting Agent Treasury:", formatAddr);

    // 4. Setup for Demo
    // Mint 1000 AUSD ONLY to Research Agent (The Orchestrator)
    const mintAmount = hre.ethers.parseEther("1000");
    await ausd.mint(researchAddr, mintAmount);
    console.log("Minted 1000 AUSD to Research Agent Treasury");

    // Verify
    console.log("Deployment Complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
