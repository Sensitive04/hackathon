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
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-eco-primary" size={size} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
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
