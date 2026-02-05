"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface LogEntry {
    id: string; // unique ID used for list keys
    task: string;
    agentName: string; // e.g., "Core (Research)"
    amount: string;
    txHash?: string;
    status: "pending" | "success" | "error";
    timestamp: string;
    output?: string;
    decision?: {
        reason: string;
        cost: string;
        confidenceScore?: number;
        executionTime?: string;
    };
}

interface WorkflowContextType {
    logs: LogEntry[];
    addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
    updateLogStatus: (txHash: string, status: "success" | "error") => void;
    clearLogs: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const addLog = (log: Omit<LogEntry, "id" | "timestamp">) => {
        const newEntry: LogEntry = {
            ...log,
            id: crypto.randomUUID(),
            timestamp: new Date().toLocaleTimeString(),
        };
        setLogs((prev) => [newEntry, ...prev]);
    };

    const updateLogStatus = (txHash: string, status: "success" | "error") => {
        setLogs((prev) =>
            prev.map((entry) =>
                entry.txHash === txHash ? { ...entry, status } : entry
            )
        );
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <WorkflowContext.Provider value={{ logs, addLog, updateLogStatus, clearLogs }}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error("useWorkflow must be used within a WorkflowProvider");
    }
    return context;
}
