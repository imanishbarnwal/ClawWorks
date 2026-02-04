const hre = require("hardhat");

async function main() {
    const [deployer, protocolTreasury] = await hre.ethers.getSigners();

    console.log("--- ClawWorks Agent-to-Agent Payment Simulation ---");

    // 1. Setup Deployments
    // --------------------
    console.log("\n1. Deploying Infrastructure...");

    // Deploy Token
    const MockAUSD = await hre.ethers.getContractFactory("MockAUSD");
    const ausd = await MockAUSD.deploy();
    await ausd.waitForDeployment();
    const ausdAddress = await ausd.getAddress();
    console.log(`- MockAUSD: ${ausdAddress}`);

    // Deploy Router (15% fee)
    const feeBps = 1500;
    const ProtocolFeeRouter = await hre.ethers.getContractFactory("ProtocolFeeRouter");
    const router = await ProtocolFeeRouter.deploy(ausdAddress, protocolTreasury.address, feeBps);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log(`- ProtocolFeeRouter: ${routerAddress} (Fee: 15%)`);

    // Deploy Agents
    const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");

    // Agent A (Hirer)
    const agentA_Treasury = await AgentTreasury.deploy(deployer.address);
    await agentA_Treasury.waitForDeployment();
    const agentA_Address = await agentA_Treasury.getAddress();
    console.log(`- Agent A (Hirer) Treasury: ${agentA_Address}`);

    // Agent B (Worker)
    const agentB_Treasury = await AgentTreasury.deploy(deployer.address);
    await agentB_Treasury.waitForDeployment();
    const agentB_Address = await agentB_Treasury.getAddress();
    console.log(`- Agent B (Worker) Treasury: ${agentB_Address}`);

    // 2. Funding
    // ==========
    console.log("\n2. Funding Agent A...");
    const paymentAmount = hre.ethers.parseEther("1000"); // 1000 AUSD
    await ausd.mint(agentA_Address, paymentAmount);
    console.log(`- Minted 1000 AUSD to Agent A`);

    // 3. Execution Flow
    // ===============
    console.log("\n3. Executing Payment Flow (Agent A hires Agent B)...");

    // Step A: Agent A approves Router to spend AUSD
    // We use the helper method on AgentTreasury
    await agentA_Treasury.approveToken(ausdAddress, routerAddress, paymentAmount);
    console.log("- Agent A approved Router to spend AUSD");

    // Step B: Agent A executes processPayment on Router
    // We need to encode the function call for the Treasury to execute
    const referenceId = "seo-task-001";

    // Create interface to encode data
    const routerInterface = ProtocolFeeRouter.interface;
    const calldata = routerInterface.encodeFunctionData("processPayment", [
        agentB_Address,
        paymentAmount,
        referenceId
    ]);

    // Execute transaction via Agent A's Treasury
    const tx = await agentA_Treasury.execute(routerAddress, 0, calldata);
    await tx.wait();
    console.log(`- Agent A called processPayment(recipient=${agentB_Address}, amount=1000, ref=${referenceId})`);

    // 4. Validation
    // =============
    console.log("\n4. Verifying Balances...");

    const feeAmount = (paymentAmount * BigInt(feeBps)) / 10000n; // 150
    const netAmount = paymentAmount - feeAmount; // 850

    const balanceA = await ausd.balanceOf(agentA_Address);
    const balanceB = await ausd.balanceOf(agentB_Address);
    const balanceProtocol = await ausd.balanceOf(protocolTreasury.address);

    console.log(`- Agent A Final Balance: ${hre.ethers.formatEther(balanceA)} AUSD (Expected: 0.0)`);
    console.log(`- Agent B Final Balance: ${hre.ethers.formatEther(balanceB)} AUSD (Expected: 850.0)`);
    console.log(`- Protocol Final Balance: ${hre.ethers.formatEther(balanceProtocol)} AUSD (Expected: 150.0)`);

    if (balanceB === netAmount && balanceProtocol === feeAmount) {
        console.log("\nSUCCESS: Payment flow exact match.");
    } else {
        console.log("\nFAILURE: Balances do not match expected values.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
