const SkeletonProductGrid = ({ items = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
        >
          {/* Image */}
          <div className="h-48 bg-gray-200"></div>

          {/* Content */}
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>

            {/* Price and button */}
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-9 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonProductGrid;
