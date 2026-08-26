import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import type { Comment } from "../../types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  postId: string;
  currentUserId: string;
}

const COLLAPSE_COUNT = 3;

export default function CommentSection({ postId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getComments(postId);
        setComments(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await api.createComment(postId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleComments = showAll ? comments : comments.slice(-COLLAPSE_COUNT);
  const hiddenCount = comments.length - COLLAPSE_COUNT;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100/80">
      <div className="flex items-center gap-1.5 mb-2.5">
        <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-400 font-semibold">
          {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
        </span>
      </div>

      {!loading && comments.length > COLLAPSE_COUNT && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-eco-primary hover:text-eco-secondary mb-2.5 font-semibold transition-colors duration-200"
        >
          View all {comments.length} comments
        </button>
      )}

      {loading && (
        <p className="text-xs text-gray-400 py-2">Loading comments...</p>
      )}

      {!loading && visibleComments.length > 0 && (
        <div className="space-y-2.5 mb-3">
          {visibleComments.map((c) => (
            <div key={c._id} className="flex items-start gap-2 group">
              <div className="w-6 h-6 bg-gradient-to-br from-eco-primary/80 to-emerald-400 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5">
                {c.userId.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-900">{c.userId.name}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-xs text-gray-400 py-1">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 text-xs input-field !py-2"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="p-2 text-eco-primary disabled:text-gray-300 hover:bg-eco-light rounded-lg transition-all duration-200 active:scale-90"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
