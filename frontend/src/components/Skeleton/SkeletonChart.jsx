const SkeletonChart = ({ height = "h-80" }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
      <div
        className={`${height} bg-gray-100 rounded-lg flex items-end gap-2 p-4`}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const randomHeight = Math.floor(Math.random() * 60) + 30;
          return (
            <div
              key={i}
              className="flex-1 bg-gray-200 rounded-t"
              style={{ height: `${randomHeight}%` }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default SkeletonChart;
