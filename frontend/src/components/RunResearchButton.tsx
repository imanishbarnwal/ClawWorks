"use client";

import { runResearchTask } from "@/lib/runResearchTask";
import { useState } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { useAccount } from "wagmi";

export default function RunResearchButton() {
    const { isConnected } = useAccount();
    const { addLog, clearLogs } = useWorkflow();
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        // We defer connection check to runResearchTask which calls connectWallet()
        try {
            setLoading(true);
            clearLogs(); // Clear previous runs

            await runResearchTask((log) => {
                addLog(log);
            });

        } catch (err: any) {
            console.error(err);
            alert(`Workflow Failed: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? "Running Research Task..." : "Run Research Task"}
        </button>
    );
}
