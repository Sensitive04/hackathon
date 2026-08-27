import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-neu-red-light/60 rounded-3xl shadow-neu-raised p-6 text-center animate-fade-in">
      <div className="w-12 h-12 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
        <AlertTriangle className="w-6 h-6 text-neu-red" />
      </div>
      <p className="text-neu-red font-semibold text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neu-red hover:text-red-700 bg-neu-bg hover:shadow-neu-hover px-4 py-2 rounded-2xl shadow-neu-raised-sm transition-all duration-200 active:shadow-neu-pressed active:scale-[0.97]"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
