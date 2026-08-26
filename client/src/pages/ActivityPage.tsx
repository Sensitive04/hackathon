import { ClipboardList } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Activity</h1>
        </div>
        <p className="text-gray-500">Track and manage your sustainability activities.</p>
      </div>

      <div className="card text-center py-20">
        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400">Coming soon</p>
      </div>
    </div>
  );
}
