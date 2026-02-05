"use client";

import { runResearchTask } from "@/lib/runResearchTask";
import { useState } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
// Removed wagmi imports to ensure clean separation as requested in earlier steps
// import { useAccount } from "wagmi";

export default function RunResearchButton({
    onPaymentComplete,
    taskInput
}: {
    onPaymentComplete?: () => Promise<void>;
    taskInput: string;
}) {
    // const { isConnected } = useAccount(); // Connection check is now implicit in runResearchTask
    const { addLog, clearLogs } = useWorkflow();
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (!taskInput.trim()) return;

        try {
            setLoading(true);
            clearLogs(); // Clear previous runs

            await runResearchTask(
                taskInput,
                (log) => {
                    addLog(log);
                },
                onPaymentComplete
            );

        } catch (err: any) {
            console.error(err);
            alert(`Workflow Failed: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleClick}
                disabled={loading || !taskInput.trim()}
                className={`rounded-xl px-6 py-3 text-white font-semibold transition-all shadow-lg ${loading || !taskInput.trim()
                    ? "bg-blue-800 cursor-not-allowed opacity-75"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25"
                    }`}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Running Research Task...
                    </span>
                ) : (
                    "Run Research Task"
                )}
            </button>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
                1 click &rarr; 3 agents hired &rarr; 4 on-chain transactions
            </p>
        </div>
    );
}
