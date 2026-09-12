import { AlertCircle, RefreshCw } from "lucide-react";

// Reusable alert banner shown when an API request fails
const ErrorBanner = ({
  message = "Failed to load data. Please check your connection.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 my-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
