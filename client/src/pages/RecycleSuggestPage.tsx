import { useState } from "react";
import { api } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import { Recycle, Search, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface RecycleResult {
  itemName: string;
  materials: string[];
  recyclable: boolean;
  disposalMethod: string;
  steps: string[];
  environmentalImpact: string;
  reusable: boolean;
  reuseIdeas: string[];
}

export default function RecycleSuggestPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<RecycleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.analyzeItem(description);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Recycle Suggestion</h1>
        </div>
        <p className="text-gray-500">
          Describe an item to get AI-powered recycling, reuse, and disposal guidance.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="card mb-8">
        <label className="label mb-2 block">What item do you want to recycle?</label>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="e.g. old laptop, plastic bottle, cardboard box..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <Search className="w-4 h-4" />
            {loading ? "Analyzing..." : "Get Suggestion"}
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner text="Analyzing item..." />}
      {error && <ErrorDisplay message={error} />}

      {result && !loading && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900">{result.itemName}</h2>
              {result.recyclable ? (
                <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" /> Recyclable
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <XCircle className="w-4 h-4" /> Not Recyclable
                </span>
              )}
            </div>

            {result.materials.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {result.materials.map((m, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Disposal Method</h3>
              <p className="text-gray-600">{result.disposalMethod}</p>
            </div>

            {result.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Steps</h3>
                <ol className="space-y-2">
                  {result.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <ArrowRight className="w-4 h-4 text-eco-primary mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Environmental Impact</h3>
              <p className="text-gray-600 text-sm">{result.environmentalImpact}</p>
            </div>
          </div>

          {result.reusable && result.reuseIdeas.length > 0 && (
            <div className="card bg-emerald-50 border-emerald-200">
              <h3 className="font-semibold text-emerald-800 mb-3">Reuse Ideas</h3>
              <ul className="space-y-2">
                {result.reuseIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                    <Recycle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
