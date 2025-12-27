import Spinner from "./Spinner";

/**
 * LoadingOverlay Component
 * Overlay toàn màn hình với spinner và message
 */
const LoadingOverlay = ({ message = "Đang tải...", transparent = false }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        transparent ? "bg-black/20" : "bg-black/50"
      } backdrop-blur-sm`}
    >
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <Spinner size="lg" color="blue" />
        {message && (
          <p className="text-gray-700 font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
