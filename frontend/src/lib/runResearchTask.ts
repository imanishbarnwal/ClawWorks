import { ethers } from 'ethers';
import { AGENT_REGISTRY } from './registry';
import { PROTOCOL_ROUTER_ADDRESS, ROUTER_ABI, ERC20_ABI } from './contracts';
import { connectWallet } from './wallet';
import { generateDataOutput, generateSeoOutput, generateFinalReport } from './researchOutputs';

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
    taskDescription: string,
    onLog: (log: {
        task: string;
        agentName: string;
        amount: string;
        txHash?: string;
        status: "pending" | "success" | "error";
        output?: string;
        decision?: {
            reason: string;
            cost: string;
            confidenceScore?: number;
            executionTime?: string;
        };
    }) => void,
    onTreasuriesUpdate?: () => Promise<void>
) {
    console.log(`🚀 Starting Research Task: "${taskDescription}"`);

    // 0. Log User Task Submission (UI Only)
    onLog({
        task: "User Task Submitted",
        agentName: "User",
        amount: "-",
        status: "success",
        decision: {
            reason: taskDescription,
            cost: "-"
        }
    });

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

    // ==========================================
    // NEW STEP: User Funds Research Agent (1.00 AUSD)
    // ==========================================
    const fundingAmount = ethers.parseEther("1.0");

    console.log("Checking user allowance for funding...");
    const userAllowance = await ausd.allowance(address, PROTOCOL_ROUTER_ADDRESS);

    if (userAllowance < fundingAmount) {
        console.log("📝 User approving Router...");
        onLog({
            task: "Approving AUSD Spend",
            agentName: "User (You)",
            amount: "0.00",
            status: "pending"
        });

        try {
            const approveTx = await ausd.approve(PROTOCOL_ROUTER_ADDRESS, ethers.MaxUint256);
            console.log("User Approval Tx:", approveTx.hash);
            await approveTx.wait();
            console.log("✅ User Approval Confirmed");
        } catch (err: any) {
            console.error("User Approval Failed:", err);
            throw new Error(`User Approval Failed: ${getRevertReason(err)}`);
        }
    }

    console.log("💸 Funding Research Agent...");
    onLog({
        task: "Funding Research Agent",
        agentName: "User (You)",
        amount: "1.00",
        status: "pending"
    });

    try {
        const fundTx = await router.processPayment(
            researchTreasuryAddr,
            fundingAmount,
            "Initial Capital Infection"
        );
        console.log("Funding Tx:", fundTx.hash);
        await fundTx.wait();

        onLog({
            task: "Funding Complete",
            agentName: "User (You)",
            amount: "1.00",
            txHash: fundTx.hash,
            status: "success"
        });
        console.log("✅ Funding Confirmed");

        if (onTreasuriesUpdate) {
            console.log("🔄 Refetching Live Treasuries...");
            await onTreasuriesUpdate();
        }

    } catch (err: any) {
        console.error("Funding Failed:", err);
        onLog({
            task: "Funding Failed",
            agentName: "User (You)",
            amount: "1.00",
            status: "error"
        });
        throw new Error(`Funding Failed: ${getRevertReason(err)}`);
    }

    // ==========================================
    // EXISTING FLOW: Research Agent Pays Downstream
    // ==========================================

    // 5. Allowance check (Research Treasury -> Router)
    const currentAllowance = await ausd.allowance(
        researchTreasuryAddr,
        PROTOCOL_ROUTER_ADDRESS
    );

    const requiredAmount = ethers.parseEther("1.0"); // Need enough for downstream payments

    if (currentAllowance < requiredAmount) {
        console.log("📝 Approving router to spend AUSD (Treasury)...");

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

        console.log("Treasury Approval tx:", approveTx.hash);
        await approveTx.wait();
        console.log("✅ Treasury Approval confirmed");
    } else {
        console.log("✅ Treasury Allowance already sufficient");
    }

    // 6. Agent Decision Engine
    const decidePayments = (input: string) => {
        const t = input.toLowerCase();
        const plan = [];

        // Dynamic hiring based on keywords
        if (t.includes("data") || t.includes("research") || t.includes("supply") || t.includes("info")) {
            plan.push({
                recipient: dataAgentAddr,
                amount: "0.20",
                task: "Data Collection",
                agentName: "Data Agent",
                decision: {
                    reason: "Task trigger 'data/research' -> Initiating Supply Chain Scan",
                    cost: "0.20",
                    confidenceScore: 98,
                    executionTime: "~15s"
                }
            });
        }

        if (t.includes("seo") || t.includes("growth") || t.includes("rank") || t.includes("search")) {
            plan.push({
                recipient: seoAgentAddr,
                amount: "0.10",
                task: "SEO Optimization",
                agentName: "SEO Agent",
                decision: {
                    reason: "Task trigger 'seo/growth' -> Optimizing Search Ranking",
                    cost: "0.10",
                    confidenceScore: 89,
                    executionTime: "~8s"
                }
            });
        }

        if (t.includes("format") || t.includes("pdf") || t.includes("report") || t.includes("layout")) {
            plan.push({
                recipient: formattingAgentAddr,
                amount: "0.05",
                task: "Formatting",
                agentName: "Formatting Agent",
                decision: {
                    reason: "Task trigger 'format/report' -> Structuring Final Output",
                    cost: "0.05",
                    confidenceScore: 99,
                    executionTime: "~3s"
                }
            });
        }

        // Fallback: If input is vague, trigger standard protocol
        if (plan.length === 0) {
            console.log("⚠️ No specific keywords - Defaulting to Full Suite");
            return [
                {
                    recipient: dataAgentAddr,
                    amount: "0.20",
                    task: "Data Collection",
                    agentName: "Data Agent",
                    decision: {
                        reason: "Ambiguous task input -> Default Protocol: Data",
                        cost: "0.20",
                        confidenceScore: 75,
                        executionTime: "~15s"
                    }
                },
                {
                    recipient: seoAgentAddr,
                    amount: "0.10",
                    task: "SEO Optimization",
                    agentName: "SEO Agent",
                    decision: {
                        reason: "Ambiguous task input -> Default Protocol: SEO",
                        cost: "0.10",
                        confidenceScore: 80,
                        executionTime: "~8s"
                    }
                },
                {
                    recipient: formattingAgentAddr,
                    amount: "0.05",
                    task: "Formatting",
                    agentName: "Formatting Agent",
                    decision: {
                        reason: "Ambiguous task input -> Default Protocol: Formatting",
                        cost: "0.05",
                        confidenceScore: 95,
                        executionTime: "~3s"
                    }
                }
            ];
        }

        return plan;
    };

    const payments = decidePayments(taskDescription);

    // Store outputs to chain them for the final report
    const agentOutputs: Record<string, string> = {};

    const generateMockOutput = (agent: string, input: string, context: Record<string, string>) => {
        if (agent.includes("Data")) return generateDataOutput(input);
        if (agent.includes("SEO")) return generateSeoOutput(input);
        if (agent.includes("Formatting")) {
            const d = context["Data Agent"] || "No data gathered.";
            const s = context["SEO Agent"] || `Title: Report for ${input}\nH2: Overview`;
            return generateFinalReport(input, d, s);
        }
        return "Task Completed.";
    };

    // 7. Execute payments (Loop)
    for (const pay of payments) {
        console.log(`➡️ Paying ${pay.agentName}`);

        onLog({
            task: pay.task,
            agentName: pay.agentName,
            amount: pay.amount,
            decision: pay.decision,
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

            const output = generateMockOutput(pay.agentName, taskDescription, agentOutputs);
            agentOutputs[pay.agentName] = output;

            onLog({
                task: `${pay.task} - Confirmed`,
                agentName: pay.agentName,
                amount: pay.amount,
                txHash: tx.hash,
                status: "success",
                output: output
            });

            if (onTreasuriesUpdate) {
                console.log("🔄 Refetching Live Treasuries...");
                await onTreasuriesUpdate();
            }
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
