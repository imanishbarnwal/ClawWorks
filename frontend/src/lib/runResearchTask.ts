import { ethers } from 'ethers';
import { AGENT_REGISTRY } from './registry';
import { PROTOCOL_ROUTER_ADDRESS, ROUTER_ABI, ERC20_ABI } from './contracts';
import { connectWallet } from './wallet';

const AGENT_TREASURY_ABI = [
    "function execute(address target, uint256 value, bytes calldata data) external returns (bytes)",
    "function approveToken(address token, address spender, uint256 amount) external",
    "function owner() view returns (address)"
];

// Helper to extract revert reason
const getRevertReason = (err: any) => {
    if (err?.info?.error?.message) return err.info.error.message;
    if (err?.message) return err.message;
    return "Transaction Failed (Unknown Reason)";
};

/**
 * Executes the full research workflow by orchestrating the Research Agent.
 * Uses pure ethers.js v6 with window.ethereum.
 */
export async function runResearchTask(
    onLog: (log: {
        task: string;
        agentName: string;
        amount: string;
        txHash?: string;
        status: "pending" | "success" | "error";
    }) => void
) {
    console.log("🚀 Starting Research Task Workflow (Ethers v6)");

    // 1. Connect Wallet
    const { signer, address } = await connectWallet();
    console.log("👤 Connected wallet:", address);

    // 2. Load registry
    const researchTreasuryAddr = AGENT_REGISTRY.research_agent.treasury_address;
    const dataAgentAddr = AGENT_REGISTRY.data_agent.treasury_address;
    const seoAgentAddr = AGENT_REGISTRY.seo_agent.treasury_address;
    const formattingAgentAddr = AGENT_REGISTRY.formatting_agent.treasury_address;

    // ✅ FIX 1 — Registry sanity check
    if (
        !researchTreasuryAddr ||
        !dataAgentAddr ||
        !seoAgentAddr ||
        !formattingAgentAddr
    ) {
        throw new Error("❌ Agent registry is missing treasury addresses");
    }

    console.log("📒 Registry OK");

    // 3. Instantiate contracts
    const router = new ethers.Contract(
        PROTOCOL_ROUTER_ADDRESS,
        ROUTER_ABI,
        signer
    );

    const researchTreasury = new ethers.Contract(
        researchTreasuryAddr,
        AGENT_TREASURY_ABI,
        signer
    );

    // ✅ FIX 2 — Execution authority check
    try {
        const treasuryOwner = await researchTreasury.owner();
        console.log("🏦 Research Treasury Owner:", treasuryOwner);
        console.log("✍️ Connected Wallet:", address);

        if (treasuryOwner.toLowerCase() !== address.toLowerCase()) {
            console.warn("⚠️ Wallet is NOT treasury owner — execute() may revert");
        } else {
            console.log("✅ Wallet IS treasury owner");
        }
    } catch {
        console.log("ℹ️ Treasury has no owner() or uses role-based auth");
    }

    // 4. Fetch payment token (AUSD)
    console.log("💰 Fetching payment token...");
    const ausdAddress = await router.paymentToken();
    console.log("AUSD Address:", ausdAddress);

    const ausd = new ethers.Contract(ausdAddress, ERC20_ABI, signer);

    // 5. Allowance check
    const currentAllowance = await ausd.allowance(
        researchTreasuryAddr,
        PROTOCOL_ROUTER_ADDRESS
    );

    const requiredAmount = ethers.parseEther("1.0");

    if (currentAllowance < requiredAmount) {
        console.log("📝 Approving router to spend AUSD");

        onLog({
            task: "Approving Payment Router",
            agentName: "Research Treasury",
            amount: "0.00",
            status: "pending"
        });

        const approveTx = await researchTreasury.approveToken(
            ausdAddress,
            PROTOCOL_ROUTER_ADDRESS,
            ethers.MaxUint256
        );

        console.log("Approval tx:", approveTx.hash);
        await approveTx.wait();
        console.log("✅ Approval confirmed");
    } else {
        console.log("✅ Allowance already sufficient");
    }

    // 6. Payment plan
    const payments = [
        { recipient: dataAgentAddr, amount: "0.20", task: "Data Collection", agentName: "Data Agent" },
        { recipient: seoAgentAddr, amount: "0.10", task: "SEO Optimization", agentName: "SEO Agent" },
        { recipient: formattingAgentAddr, amount: "0.05", task: "Formatting", agentName: "Formatting Agent" }
    ];

    // 7. Execute payments
    for (const pay of payments) {
        console.log(`➡️ Paying ${pay.agentName}`);

        onLog({
            task: pay.task,
            agentName: pay.agentName,
            amount: pay.amount,
            status: "pending"
        });

        try {
            const calldata = router.interface.encodeFunctionData(
                "processPayment",
                [
                    pay.recipient,
                    ethers.parseEther(pay.amount),
                    `Payment for ${pay.task}`
                ]
            );

            const tx = await researchTreasury.execute(
                PROTOCOL_ROUTER_ADDRESS,
                0,
                calldata
            );

            console.log("Tx sent:", tx.hash);
            await tx.wait();

            console.log(`✅ ${pay.task} complete`);

            onLog({
                task: `${pay.task} - Confirmed`,
                agentName: pay.agentName,
                amount: pay.amount,
                txHash: tx.hash,
                status: "success"
            });
        } catch (err: any) {
            console.error("❌ Payment failed:", err);

            onLog({
                task: `${pay.task} - FAILED`,
                agentName: pay.agentName,
                amount: pay.amount,
                status: "error"
            });

            throw new Error(getRevertReason(err));
        }
    }

    console.log("🎉 Research Task Workflow Completed");
    return "SUCCESS";
}
