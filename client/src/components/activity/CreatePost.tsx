import { useState, useRef } from "react";
import { Send, Leaf, Users, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import type { Post } from "../../types";

interface Props {
  user: { id: string; name: string; avatar?: string };
  onCreated: (post: Post) => void;
}

export default function CreatePost({ user, onCreated }: Props) {
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isCampaign, setIsCampaign] = useState(false);
  const [volunteerNeeded, setVolunteerNeeded] = useState(5);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const tagList = hashtags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const post = await api.createPost({
        content: content.trim(),
        images,
        hashtags: tagList,
        campaignStatus: isCampaign ? "proposed" : undefined,
        volunteerNeeded: isCampaign ? volunteerNeeded : undefined,
      });

      onCreated(post);
      setContent("");
      setHashtags("");
      setImages([]);
      setIsCampaign(false);
      setVolunteerNeeded(5);
      toast.success("Post created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-eco-primary to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-gray-50 text-gray-900 placeholder:text-gray-400 resize-none text-sm transition-all duration-200 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 focus:outline-none hover:border-slate-300 !py-3"
            rows={3}
            placeholder="Share an update with the community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:bg-red-600"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <input
              type="text"
              className="flex-1 text-xs !py-2 px-4 rounded-xl border border-slate-200/60 bg-gray-50 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 focus:outline-none min-w-[140px]"
              placeholder="Hashtags (comma-separated)"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200/60 bg-gray-50 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200 active:scale-95"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => setIsCampaign(!isCampaign)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                isCampaign
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-slate-200/60 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              Campaign
            </button>
            {isCampaign && (
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={volunteerNeeded}
                  onChange={(e) =>
                    setVolunteerNeeded(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="!py-1 !px-2 w-16 text-center text-xs rounded-lg border border-slate-200/60 bg-gray-50 text-gray-900 focus:border-eco-primary focus:ring-2 focus:ring-eco-primary/20 focus:outline-none transition-all duration-200"
                />
                <span className="text-gray-500 font-medium">needed</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn-primary text-xs !py-2 !px-3.5"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
