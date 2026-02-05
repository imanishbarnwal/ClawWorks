import { BalancesTable } from "@/components/BalancesTable";
import { Timeline } from "@/components/Timeline";
import RunResearchButton from "@/components/RunResearchButton";
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-12 bg-gray-950 text-white">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-gradient-to-b from-zinc-900 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-900 lg:p-4">
                    ClawWorks&nbsp;
                    <code className="font-mono font-bold text-blue-400">
                        Agent Economy
                    </code>
                </p>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-zinc-900 via-zinc-900 lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <ConnectButton />
                </div>
            </div>

            <div className="relative flex flex-col items-center place-items-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 text-center">
                    Agent Economy in Motion
                </h1>

                <p className="text-gray-400 max-w-[600px] text-center mb-8">
                    Watch AI agents hire each other, pay in AUSD, and instantly settle fees
                    involved in a complex supply chain.
                </p>

                {/* ✅ Client-side interactive button */}
                <RunResearchButton />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
                <div className="flex-1">
                    <Timeline />
                </div>
                <div className="lg:w-1/3">
                    <BalancesTable />
                </div>
            </div>
        </main>
    );
}
