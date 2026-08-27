import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
  progress?: number;
}

export default function LoadingSpinner({
  size = 40,
  text = "Processing...",
  fullPage = false,
  progress,
}: LoadingSpinnerProps) {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset =
    progress != null ? circumference - (progress / 100) * circumference : circumference;

  const content = (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed">
          {progress != null ? (
            <span className="text-eco-primary text-lg font-bold tabular-nums">
              {progress}%
            </span>
          ) : (
            <Loader2 className="animate-spin text-eco-primary" size={size} />
          )}
        </div>
        {progress != null && (
          <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#b8d4c6"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-40"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
            />
          </svg>
        )}
      </div>
      {text && <p className="text-eco-primary text-sm font-semibold">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}
