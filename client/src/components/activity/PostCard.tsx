import { useState } from "react";
import { Heart, Trash2, Users, Play, Square } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import type { Post, ChatConversation } from "../../types";
import CommentSection from "./CommentSection";

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
  post: Post;
  currentUserId: string;
  socketOn: (event: string, handler: (...args: any[]) => void) => () => void;
  onUpdated: (post: Post) => void;
  onDeleted: (id: string) => void;
  onLikeEvent: (postId: string, likes: string[]) => void;
  onCampaignStarted: (conversationId?: string, conversation?: ChatConversation) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onUpdated,
  onDeleted,
  onLikeEvent,
  onCampaignStarted,
}: Props) {
  const [liking, setLiking] = useState(false);

  const isLiked = post.likes.includes(currentUserId);
  const isAuthor = post.userId._id === currentUserId;
  const likeCount = post.likes.length;
  const volunteerCount = post.volunteers?.length || 0;
  const volunteerNeeded = post.volunteerNeeded || 0;
  const isFull = volunteerNeeded > 0 && volunteerCount >= volunteerNeeded;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.likePost(post._id);
      onLikeEvent(post._id, res.likes);
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePost(post._id);
      onDeleted(post._id);
      toast.success("Post deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const handleJoin = async () => {
    try {
      const res = await api.joinCampaign(post._id);
      onUpdated({ ...post, volunteers: res.volunteers, volunteerNeeded: res.volunteerNeeded });
      toast.success("Joined campaign!");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const handleStart = async () => {
    try {
      const res = await api.startCampaign(post._id);
      onUpdated(res.post);
      onCampaignStarted(res.conversation?._id, res.conversation);
      toast.success("Campaign started! Chat created.");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const handleEnd = async () => {
    if (!confirm("End this campaign? The group chat will become read-only.")) return;
    try {
      const res = await api.endCampaign(post._id);
      onUpdated(res.post);
      toast.success("Campaign ended.");
    } catch (err: any) {
      toast.error(err.message || "Failed to end campaign");
    }
  };

  return (
    <div className="card animate-fade-in-up mb-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-neu-bg rounded-full flex items-center justify-center text-eco-primary text-sm font-bold flex-shrink-0 shadow-neu-raised-sm">
          {post.userId.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-neu-text">{post.userId.name}</span>
            <span className="text-xs text-neu-text-muted">{timeAgo(post.createdAt)}</span>
            {post.campaignStatus && (
              <span
                className={`badge ${
                  post.campaignStatus === "started"
                    ? "bg-neu-blue-light text-blue-700 shadow-neu-pressed-sm"
                    : post.campaignStatus === "completed"
                    ? "bg-neu-accent/10 text-green-700 shadow-neu-pressed-sm"
                    : "bg-neu-amber-light text-amber-700 shadow-neu-pressed-sm"
                }`}
              >
                {post.campaignStatus}
              </span>
            )}
          </div>

          <p className="text-sm text-neu-text-secondary whitespace-pre-wrap mb-3 leading-relaxed">
            {post.content}
          </p>

          {post.images && post.images.length > 0 && (
            <div
              className={`grid gap-2 mb-3 ${
                post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-full h-48 object-cover rounded-2xl shadow-neu-raised-sm transition-transform duration-300 hover:scale-[1.01]"
                />
              ))}
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-xs text-eco-primary font-medium bg-neu-accent/10 px-2 py-0.5 rounded-xl shadow-neu-pressed-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-neu-shadow-dark/15">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isLiked
                  ? "text-neu-red shadow-neu-pressed-sm"
                  : "text-neu-text-muted hover:text-neu-red hover:shadow-neu-pressed-sm"
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform duration-200 ${isLiked ? "fill-current scale-110" : ""}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-medium text-neu-text-muted hover:text-neu-red px-3 py-1.5 rounded-xl hover:shadow-neu-pressed-sm transition-all duration-200 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {post.campaignStatus && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="flex items-center gap-1 text-xs text-neu-text-secondary font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {volunteerNeeded > 0
                    ? `${volunteerCount}/${volunteerNeeded}`
                    : volunteerCount}
                </span>
                {post.campaignStatus === "proposed" && !isAuthor && !isFull && (
                  <button
                    onClick={handleJoin}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-neu-accent/10 text-green-700 shadow-neu-raised-sm hover:shadow-neu-hover transition-all duration-200 active:scale-95"
                  >
                    Join
                  </button>
                )}
                {post.campaignStatus === "proposed" && !isAuthor && isFull && (
                  <span className="badge bg-neu-bg text-neu-text-muted shadow-neu-pressed-sm">
                    Full
                  </span>
                )}
                {post.campaignStatus === "proposed" && isAuthor && (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-neu-blue-light text-blue-700 shadow-neu-raised-sm hover:shadow-neu-hover transition-all duration-200 active:scale-95"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}
                {post.campaignStatus === "started" && isAuthor && (
                  <button
                    onClick={handleEnd}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-neu-red-light text-red-700 shadow-neu-raised-sm hover:shadow-neu-hover transition-all duration-200 active:scale-95"
                  >
                    <Square className="w-3 h-3" />
                    End
                  </button>
                )}
              </div>
            )}
          </div>

          <CommentSection postId={post._id} currentUserId={currentUserId} />
        </div>
      </div>
    </div>
  );
}
