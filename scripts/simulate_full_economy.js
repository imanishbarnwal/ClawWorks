const hre = require("hardhat");

async function main() {
    const [user, protocolTreasury] = await hre.ethers.getSigners();

    // Use a fixed Fee of 15%
    const FEE_BPS = 1500; // 15%

    console.log("--- ClawWorks Full Economy Simulation ---");
    console.log("-----------------------------------------");
    console.log(`Protocol Fee: 15%`);
    console.log(`Protocol Treasury: ${protocolTreasury.address}`);
    console.log(`User: ${user.address}\n`);

    // 1. Deploy Infrastructure
    const MockAUSD = await hre.ethers.getContractFactory("MockAUSD");
    const ausd = await MockAUSD.deploy();
    await ausd.waitForDeployment();
    const ausdAddress = await ausd.getAddress();

    const ProtocolFeeRouter = await hre.ethers.getContractFactory("ProtocolFeeRouter");
    const router = await ProtocolFeeRouter.deploy(ausdAddress, protocolTreasury.address, FEE_BPS);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();

    const AgentTreasury = await hre.ethers.getContractFactory("AgentTreasury");

    // 2. Deploy Agents
    // We use the 'user' (deployer) as the owner of these treasuries for simulation control
    const researchAgent = await AgentTreasury.deploy(user.address);
    const dataAgent = await AgentTreasury.deploy(user.address);
    const seoAgent = await AgentTreasury.deploy(user.address);
    const formatAgent = await AgentTreasury.deploy(user.address);

    await Promise.all([
        researchAgent.waitForDeployment(),
        dataAgent.waitForDeployment(),
        seoAgent.waitForDeployment(),
        formatAgent.waitForDeployment()
    ]);

    const researchAddr = await researchAgent.getAddress();
    const dataAddr = await dataAgent.getAddress();
    const seoAddr = await seoAgent.getAddress();
    const formatAddr = await formatAgent.getAddress();

    console.log("Agents Deployed:");
    console.log(`- Research Agent: ${researchAddr}`);
    console.log(`- Data Agent:     ${dataAddr}`);
    console.log(`- SEO Agent:      ${seoAddr}`);
    console.log(`- Format Agent:   ${formatAddr}\n`);

    // 3. User Setup
    const initialBalance = hre.ethers.parseEther("10.0");
    await ausd.mint(user.address, initialBalance);
    await ausd.approve(routerAddress, hre.ethers.MaxUint256);
    console.log(`User minted 10.0 AUSD and approved Router.\n`);

    // 4. Execution Flow
    // =================

    // --- Step A: User hires Research Agent ---
    const jobPrice = hre.ethers.parseEther("1.0");
    console.log(`[Step A] User hires Research Agent for 1.00 AUSD`);

    await router.processPayment(researchAddr, jobPrice, "job-research-001");

    // Log check
    let researchBal = await ausd.balanceOf(researchAddr);
    let protocolBal = await ausd.balanceOf(protocolTreasury.address);
    console.log(`   > Research Agent received net: ${hre.ethers.formatEther(researchBal)} AUSD (1.0 - 15%)`);
    console.log(`   > Protocol Fees accumulated:   ${hre.ethers.formatEther(protocolBal)} AUSD\n`);


    // --- Step B: Research Agent Outsourcing ---
    // Research Agent needs to approve the router first
    await researchAgent.approveToken(ausdAddress, routerAddress, hre.ethers.MaxUint256);
    console.log(`[Step B] Research Agent outsourcing work...`);

    // Helper to encode payment call
    const pay = async (recipient, amountStr, refId) => {
        const amount = hre.ethers.parseEther(amountStr);
        const calldata = router.interface.encodeFunctionData("processPayment", [
            recipient,
            amount,
            refId
        ]);
        const tx = await researchAgent.execute(routerAddress, 0, calldata);
        await tx.wait();
        console.log(`   > Paid ${amountStr} AUSD to ${refId}`);
    };

    // 1. Hire Data Agent (0.20)
    await pay(dataAddr, "0.20", "task-data-fetch");

    // 2. Hire SEO Agent (0.10)
    await pay(seoAddr, "0.10", "task-seo-optim");

    // 3. Hire Formatting Agent (0.05)
    await pay(formatAddr, "0.05", "task-format-pdf");

    console.log("");

    // 5. Final Report
    // ===============
    console.log("--- Final Financial Report ---");

    const b_user = await ausd.balanceOf(user.address);
    const b_research = await ausd.balanceOf(researchAddr);
    const b_data = await ausd.balanceOf(dataAddr);
    const b_seo = await ausd.balanceOf(seoAddr);
    const b_format = await ausd.balanceOf(formatAddr);
    const b_protocol = await ausd.balanceOf(protocolTreasury.address);

    // Expected Calculations
    // User: 10 - 1.0 = 9.0
    // Research In: 0.85
    // Research Out: 0.20 + 0.10 + 0.05 = 0.35
    // Research Net: 0.50

    // Protocol Fees:
    // 1. From User: 0.15
    // 2. From Research->Data: 0.20 * 0.15 = 0.03
    // 3. From Research->SEO: 0.10 * 0.15 = 0.015
    // 4. From Research->Fmt: 0.05 * 0.15 = 0.0075
    // Total = 0.15 + 0.03 + 0.015 + 0.0075 = 0.2025

    console.log(`User Balance:           ${hre.ethers.formatEther(b_user)} AUSD`);
    console.log(`Research Agent Balance: ${hre.ethers.formatEther(b_research)} AUSD (Profit)`);
    console.log(`Data Agent Balance:     ${hre.ethers.formatEther(b_data)} AUSD`);
    console.log(`SEO Agent Balance:      ${hre.ethers.formatEther(b_seo)} AUSD`);
    console.log(`Format Agent Balance:   ${hre.ethers.formatEther(b_format)} AUSD`);
    console.log(`-----------------------------------------`);
    console.log(`Protocol Treasury:      ${hre.ethers.formatEther(b_protocol)} AUSD (Total Revenue)`);

    const expectedRevenue = "0.2025";
    if (hre.ethers.formatEther(b_protocol) === expectedRevenue) {
        console.log(`\nSUCCESS: Protocol revenue matches expected velocity accumulation (${expectedRevenue}).`);
    } else {
        console.log(`\nWARNING: Protocol revenue discrepancy.`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
