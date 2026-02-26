const WeekScheduleBadge = ({ activeBatch, userBatch }) => {
    // If we don't have batch info yet, don't show anything confusing
    if (activeBatch === null || userBatch === undefined) return null;

    const isActive = Number(activeBatch) === Number(userBatch);

    return (
        <div className={`px-6 py-2.5 rounded-2xl text-sm font-black border-2 transition-all duration-500 shadow-xl ${isActive
                ? "bg-green-500/10 border-green-500/40 text-green-500 shadow-green-500/10"
                : "bg-orange-500/10 border-orange-500/40 text-orange-500 shadow-orange-500/10"
            }`}>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                {isActive ? "Your Batch is Active" : `In-Office: Batch ${activeBatch}`}
            </div>
        </div>
    );
};

export default WeekScheduleBadge;
