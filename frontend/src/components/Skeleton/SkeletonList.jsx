const SkeletonList = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;
