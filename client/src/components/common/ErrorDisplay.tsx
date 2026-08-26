import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
