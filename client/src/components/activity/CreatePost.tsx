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
        <div className="w-10 h-10 bg-neu-bg rounded-full flex items-center justify-center text-eco-primary text-sm font-bold flex-shrink-0 shadow-neu-raised-sm">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            className="w-full px-4 py-3 rounded-2xl bg-neu-bg text-neu-text placeholder:text-neu-text-muted resize-none text-sm transition-all duration-200 shadow-neu-pressed-sm focus:shadow-neu-pressed focus:ring-2 focus:ring-eco-primary/30 focus:outline-none !py-3"
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
                    className="w-16 h-16 object-cover rounded-2xl shadow-neu-raised-sm"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neu-red text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-neu-raised-sm hover:brightness-110"
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
              className="flex-1 text-xs !py-2 px-4 rounded-2xl bg-neu-bg text-neu-text placeholder:text-neu-text-muted transition-all duration-200 shadow-neu-pressed-sm focus:shadow-neu-pressed focus:ring-2 focus:ring-eco-primary/30 focus:outline-none min-w-[140px]"
              placeholder="Hashtags (comma-separated)"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl bg-neu-bg text-neu-text-secondary shadow-neu-raised-sm hover:shadow-neu-hover hover:text-eco-primary transition-all duration-200 active:scale-95"
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
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                isCampaign
                  ? "bg-neu-accent/10 text-eco-primary shadow-neu-pressed-sm"
                  : "bg-neu-bg text-neu-text-secondary shadow-neu-raised-sm hover:shadow-neu-hover hover:text-eco-primary"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              Campaign
            </button>
            {isCampaign && (
              <div className="flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-eco-primary" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={volunteerNeeded}
                  onChange={(e) =>
                    setVolunteerNeeded(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="!py-1 !px-2 w-16 text-center text-xs rounded-xl bg-neu-bg text-neu-text shadow-neu-pressed-sm focus:shadow-neu-pressed focus:ring-2 focus:ring-eco-primary/30 focus:outline-none transition-all duration-200"
                />
                <span className="text-neu-text-muted font-medium">needed</span>
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
