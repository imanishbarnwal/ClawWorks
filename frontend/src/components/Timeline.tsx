export function Timeline() {
    return (
        <div className="w-full max-w-2xl border rounded-lg p-6 bg-white/5 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Transaction Feed</h3>
            <div className="space-y-4">
                <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center text-gray-500 text-sm">
                    No transactions yet. Start the workflow to see agents in action.
                </div>
            </div>
        </div>
    );
}
