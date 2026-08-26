import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50/80 border border-red-200/80 rounded-2xl p-6 text-center animate-fade-in backdrop-blur-sm">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-red-700 font-semibold text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 px-4 py-2 rounded-xl border border-red-200 transition-all duration-200 active:scale-[0.97]"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
