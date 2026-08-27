import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorDisplay from "../components/common/ErrorDisplay";
import {
  Recycle,
  Search,
  CheckCircle,
  XCircle,
  ArrowRight,
  Upload,
  Camera,
  X,
  Hammer,
} from "lucide-react";

interface HomemadeIdea {
  title: string;
  description: string;
  materials: string[];
  steps: string[];
}

interface RecycleResult {
  itemName: string;
  materials: string[];
  recyclable: boolean;
  disposalMethod: string;
  steps: string[];
  environmentalImpact: string;
  reusable: boolean;
  reuseIdeas: string[];
  homemadeIdeas?: HomemadeIdea[];
}

export default function RecycleSuggestPage() {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<RecycleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  const startProgress = useCallback(() => {
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      const remaining = 95 - p;
      const step = Math.max(0.5, remaining * 0.08) * (0.6 + Math.random() * 0.8);
      p = Math.min(p + step, 95);
      setProgress(Math.floor(p));
    }, 350);
  }, []);

  const finishProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  }, []);

  useEffect(() => {
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast_error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast_error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const toast_error = (msg: string) => {
    setError(msg);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !imageFile) return;
    setLoading(true);
    setError("");
    setResult(null);
    startProgress();
    try {
      let imageBase64: string | undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }
      const data = await api.analyzeItem(description, imageBase64);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      finishProgress();
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon">
            <Recycle className="w-5 h-5 text-eco-primary" />
          </div>
          <h1 className="page-header-title">AI Recycle Suggestion</h1>
        </div>
        <p className="page-header-desc">
          Describe or photograph an item to get AI-powered recycling, reuse, and DIY crafting guidance.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="card mb-8 space-y-4 animate-fade-in">
        {/* Image Upload Area */}
        <div>
          <label className="label mb-2 block">Photo (optional)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-2xl shadow-neu-raised-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-neu-red text-white rounded-full flex items-center justify-center hover:brightness-110 transition-all duration-200 shadow-neu-raised-sm active:scale-90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-eco-primary shadow-neu-pressed"
                  : "border-neu-shadow-dark/30 hover:border-eco-primary/40 hover:shadow-neu-pressed-sm"
              }`}
            >
              <div className="w-12 h-12 bg-neu-bg rounded-full flex items-center justify-center mx-auto mb-3 shadow-neu-pressed-sm">
                <Upload className="w-6 h-6 text-neu-text-muted" />
              </div>
              <p className="text-sm text-neu-text-secondary">
                Drag and drop an image here, or{" "}
                <span className="text-eco-primary font-semibold">browse</span>
              </p>
              <p className="text-xs text-neu-text-muted mt-1">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* Camera + Description Row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="h-px bg-neu-shadow-dark/20 flex-1" />
          <span className="text-xs text-neu-text-muted font-medium">or describe below</span>
          <div className="h-px bg-neu-shadow-dark/20 flex-1" />
        </div>

        {/* Text Description */}
        <div>
          <label className="label mb-2 block">Item Description</label>
          <input
            className="input-field"
            placeholder="e.g. old laptop, plastic bottle, cardboard box..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || (!description.trim() && !imageFile)}
        >
          <Search className="w-4 h-4" />
          {loading ? "Analyzing..." : "Get Suggestion"}
        </button>
      </form>

      {loading && <LoadingSpinner text={`Analyzing item... ${progress}%`} progress={progress} />}
      {error && <ErrorDisplay message={error} />}

      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Recycling Analysis */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-neu-text tracking-tight">{result.itemName}</h2>
              {result.recyclable ? (
                <span className="badge bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm">
                  <CheckCircle className="w-3.5 h-3.5" /> Recyclable
                </span>
              ) : (
                <span className="badge bg-neu-red-light text-red-700 shadow-neu-pressed-sm">
                  <XCircle className="w-3.5 h-3.5" /> Not Recyclable
                </span>
              )}
            </div>

            {result.materials.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-neu-text-secondary mb-2 text-sm">Materials</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.materials.map((m, i) => (
                    <span key={i} className="bg-neu-bg text-neu-text-secondary px-3 py-1 rounded-xl text-sm font-medium shadow-neu-pressed-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-neu-text-secondary mb-2 text-sm">Disposal Method</h3>
              <p className="text-neu-text-secondary bg-neu-bg p-3 rounded-2xl shadow-neu-pressed-sm text-sm leading-relaxed">{result.disposalMethod}</p>
            </div>

            {result.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-neu-text-secondary mb-2 text-sm">Steps</h3>
                <ol className="space-y-2">
                  {result.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-neu-text-secondary">
                      <div className="w-5 h-5 bg-neu-bg text-eco-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-neu-pressed-sm">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="border-t border-neu-shadow-dark/15 pt-4 mt-4">
              <h3 className="font-semibold text-neu-text-secondary mb-2 text-sm">Environmental Impact</h3>
              <p className="text-neu-text-secondary text-sm leading-relaxed">{result.environmentalImpact}</p>
            </div>
          </div>

          {/* Reuse Ideas */}
          {result.reusable && result.reuseIdeas.length > 0 && (
            <div className="card bg-neu-accent/5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2 text-sm">
                <div className="w-7 h-7 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                  <Recycle className="w-3.5 h-3.5 text-green-700" />
                </div>
                Reuse Ideas
              </h3>
              <ul className="space-y-2">
                {result.reuseIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-green-700">
                    <Recycle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Homemade / DIY Item Ideas */}
          {result.homemadeIdeas && result.homemadeIdeas.length > 0 && (
            <div className="card bg-neu-amber-light/50">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-neu-bg rounded-full flex items-center justify-center shadow-neu-pressed-sm">
                  <Hammer className="w-4 h-4 text-amber-700" />
                </div>
                <h3 className="font-semibold text-amber-800 tracking-tight">
                  DIY / Homemade Item Ideas
                </h3>
              </div>
              <div className="space-y-4">
                {result.homemadeIdeas.map((idea, i) => (
                  <div
                    key={i}
                    className="bg-neu-bg rounded-2xl p-4 shadow-neu-pressed-sm"
                  >
                    <h4 className="font-bold text-neu-text mb-2 tracking-tight">{idea.title}</h4>
                    <p className="text-sm text-neu-text-secondary mb-3 leading-relaxed">{idea.description}</p>

                    {idea.materials.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-bold text-neu-text-muted uppercase tracking-wider mb-1.5">
                          Materials Needed
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.materials.map((m, j) => (
                            <span
                              key={j}
                              className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-xl font-medium shadow-neu-pressed-sm"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {idea.steps.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-neu-text-muted uppercase tracking-wider mb-1.5">
                          How to Make It
                        </p>
                        <ol className="space-y-1.5">
                          {idea.steps.map((step, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm text-neu-text-secondary"
                            >
                              <span className="w-4 h-4 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-neu-pressed-sm">
                                {j + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
