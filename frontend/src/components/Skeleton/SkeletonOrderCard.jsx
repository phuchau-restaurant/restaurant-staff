// Skeleton for order cards in Kitchen and Waiter screens
const SkeletonOrderCard = ({ variant = "kitchen" }) => {
    const isKitchen = variant === "kitchen";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            {/* Header */}
            <div className={`px-4 py-3 ${isKitchen ? 'bg-gray-100' : 'bg-gray-50'} border-b border-gray-100`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    {isKitchen && <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>}
                </div>
            </div>
        </div>
    );
};

export default SkeletonOrderCard;
