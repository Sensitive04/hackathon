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
    if (!confirm("Delete this post?")) return;
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
    <div className="card mb-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-eco-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {post.userId.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{post.userId.name}</span>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
            {post.campaignStatus && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  post.campaignStatus === "started"
                    ? "bg-blue-100 text-blue-700"
                    : post.campaignStatus === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {post.campaignStatus}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
            {post.content}
          </p>

          {post.images && post.images.length > 0 && (
            <div
              className={`grid gap-2 mb-2 ${
                post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl border"
                />
              ))}
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-xs text-emerald-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount > 0 && likeCount}
            </button>

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {post.campaignStatus && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  {volunteerNeeded > 0
                    ? `${volunteerCount}/${volunteerNeeded}`
                    : volunteerCount}
                </span>
                {post.campaignStatus === "proposed" && !isAuthor && !isFull && (
                  <button
                    onClick={handleJoin}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Join
                  </button>
                )}
                {post.campaignStatus === "proposed" && !isAuthor && isFull && (
                  <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-400">
                    Full
                  </span>
                )}
                {post.campaignStatus === "proposed" && isAuthor && (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}
                {post.campaignStatus === "started" && isAuthor && (
                  <button
                    onClick={handleEnd}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
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
