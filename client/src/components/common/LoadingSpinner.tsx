import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = 40,
  text = "Processing...",
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div className="relative">
        <Loader2 className="animate-spin text-eco-primary" size={size} />
        <div className="absolute inset-0 animate-pulse-gentle">
          <Loader2 className="text-eco-primary/20" size={size} />
        </div>
      </div>
      {text && <p className="text-gray-500 text-sm font-medium">{text}</p>}
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
