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

                                {log.decision && (
                                    <div className="bg-purple-900/10 border-l-2 border-purple-500 pl-2 py-1 my-2 rounded-r text-xs">
                                        <div className="text-purple-300 font-semibold mb-0.5">Agent Decision Protocol:</div>
                                        <div className="text-gray-400">Reason: <span className="italic text-gray-300">{log.decision.reason}</span></div>
                                        <div className="flex gap-3 mt-1">
                                            <div className="text-gray-400">Cost: <span className="font-mono text-purple-300">{log.decision.cost} AUSD</span></div>
                                            {log.decision.executionTime && (
                                                <div className="text-gray-400">⏱ <span className="text-blue-300 font-mono">{log.decision.executionTime}</span></div>
                                            )}
                                        </div>
                                        {log.decision.confidenceScore && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-gray-500 text-[10px]">CONFIDENCE</span>
                                                <div className="h-1.5 w-16 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                                    <div
                                                        className={`h-full ${log.decision.confidenceScore > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${log.decision.confidenceScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] text-gray-300">{log.decision.confidenceScore}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}

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

                                {log.output && (
                                    <details className="mt-2 group open:bg-gray-900/30 rounded-lg transition-colors p-1">
                                        <summary className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500 cursor-pointer list-none flex items-center gap-1.5 select-none hover:text-emerald-400 p-1">
                                            <span className="group-open:rotate-90 transition-transform duration-200">▶</span>
                                            View Agent Output
                                        </summary>
                                        <div className="mt-1 text-xs bg-black/50 border border-gray-800 rounded p-3 font-mono text-gray-300 shadow-inner animate-in slide-in-from-top-1 duration-200">
                                            <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                                                {log.output}
                                            </div>

                                            {log.agentName.includes("Formatting") && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // prevent closing detail if clicked
                                                        const blob = new Blob([log.output!], { type: 'text/markdown' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `ClawWorks-Report-${Date.now()}.md`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="mt-4 text-[10px] font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 py-2 rounded-md transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 w-fit"
                                                >
                                                    📄 Download Final Report
                                                </button>
                                            )}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
