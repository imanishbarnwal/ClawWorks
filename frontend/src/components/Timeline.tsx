"use client";

import { useWorkflow } from "@/context/WorkflowContext";

export function Timeline() {
    const { logs } = useWorkflow();

    return (
        <div className="w-full max-w-2xl border border-gray-800 rounded-lg p-6 bg-gray-900/50 backdrop-blur-sm h-fit shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-200">Transaction Feed</h3>
                {logs.length > 0 && (
                    <span className="text-xs text-green-400 animate-pulse">Live</span>
                )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="p-8 border border-dashed border-gray-800 rounded-lg text-center text-gray-500 text-sm italic">
                        No active workflow. Click "Run Research Task" to start.
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="relative pl-6 border-l-2 border-gray-800 last:border-0 pb-4 last:pb-0 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 ${log.status === 'success' ? 'bg-green-500 border-green-900' :
                                    log.status === 'error' ? 'bg-red-500 border-red-900' :
                                        'bg-blue-500 border-blue-900 animate-pulse'
                                }`}></div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-200">{log.task}</span>
                                    <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                                </div>

                                <div className="text-xs text-gray-400">
                                    Paid <span className="text-emerald-400 font-mono">{log.amount} AUSD</span> to {log.agentName}
                                </div>

                                {log.txHash && (
                                    <a
                                        href={`https://testnet.monadexplorer.com/tx/${log.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline truncate font-mono mt-1 w-fit"
                                    >
                                        Tx: {log.txHash.slice(0, 6)}...{log.txHash.slice(-4)}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
