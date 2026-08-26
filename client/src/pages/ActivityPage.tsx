import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ClipboardList, MessageCircle, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { api } from "../services/api";
import CreatePost from "../components/activity/CreatePost";
import PostCard from "../components/activity/PostCard";
import ChatPanel from "../components/chat/ChatPanel";
import type { Post, ChatConversation } from "../types";

type FeedTab = "all" | "campaign" | "my-campaigns" | "ended";

export default function ActivityPage() {
  const { user, token } = useAuth();
  const { socket, onlineUsers, isUserOnline, on, emit } = useSocket(token);

  const [posts, setPosts] = useState<Post[]>([]);
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [feedType, setFeedType] = useState<FeedTab>("all");
  const [searchTag, setSearchTag] = useState("");
  const [myCampaignChats, setMyCampaignChats] = useState<ChatConversation[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  const activeChats = useMemo(
    () => myCampaignChats.filter((c) => c.postId?.campaignStatus !== "ended"),
    [myCampaignChats]
  );
  const endedChats = useMemo(
    () => myCampaignChats.filter((c) => c.postId?.campaignStatus === "ended"),
    [myCampaignChats]
  );

  const activeChatIsEnded = useMemo(() => {
    if (!activeCampaignId) return false;
    const chat = myCampaignChats.find((c) => c._id === activeCampaignId);
    return chat?.postId?.campaignStatus === "ended";
  }, [activeCampaignId, myCampaignChats]);

  const feedParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (feedType === "campaign") params.type = "campaign";
    else if (feedType === "my-campaigns") params.type = "my-campaigns";
    else if (feedType === "ended") params.type = "ended";
    if (searchTag.trim()) params.tag = searchTag.trim().replace(/^#/, "");
    return Object.keys(params).length ? params : undefined;
  }, [feedType, searchTag]);

  const loadFeed = useCallback(async (p = 1) => {
    try {
      const data = await api.getFeed(p, feedParams());
      setPosts((prev) => (p === 1 ? data.posts : [...prev, ...data.posts]));
      setPage(p);
      setHasMore(data.hasMore);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [feedParams]);

  useEffect(() => {
    setLoading(true);
    loadFeed(1);
  }, [feedType]);

  useEffect(() => {
    return on("post:new", (post: Post) => {
      if ((post.userId as any)?._id === user?.id) return;
      if (!postsRef.current.some((p) => p._id === post._id)) {
        setPosts((prev) => [post, ...prev]);
      }
    });
  }, [on, user?.id]);

  const loadCampaignChats = useCallback(async () => {
    if (!token) return;
    try {
      const groups: ChatConversation[] = await api.getCampaignChats();
      setMyCampaignChats(groups);
      setActiveCampaignId((prev) =>
        prev && groups.some((g) => g._id === prev) ? prev : null
      );
    } catch {
      toast.error("Failed to load campaign chats");
    }
  }, [token]);

  const addCampaignChatOptimistic = useCallback((conv: ChatConversation) => {
    setMyCampaignChats((prev) =>
      prev.some((c) => c._id === conv._id) ? prev : [conv, ...prev]
    );
    setActiveCampaignId((prev) => prev ?? conv._id);
  }, []);

  useEffect(() => {
    loadCampaignChats();
    return on("campaign:group-created", ({ conversation }: any) => {
      if (conversation?._id) {
        addCampaignChatOptimistic(conversation);
      } else {
        loadCampaignChats();
      }
    });
  }, [loadCampaignChats, addCampaignChatOptimistic]);

  useEffect(() => {
    return on("campaign:ended", () => {
      loadCampaignChats();
    });
  }, [on, loadCampaignChats]);

  useEffect(() => {
    return on("post:update", (updated: Post) => {
      const isParticipant =
        user &&
        ((updated.volunteers || []).some((v) => v._id === user.id) ||
          updated.userId._id === user.id);
      if (
        isParticipant &&
        updated.campaignStatus === "started" &&
        !myCampaignChats.some((c) => String(c.postId?._id ?? c.postId) === updated._id)
      ) {
        loadCampaignChats();
      }
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p))
      );
    });
  }, [on, user, loadCampaignChats, myCampaignChats]);

  useEffect(() => {
    return on("post:delete", ({ postId }: { postId: string }) =>
      setPosts((prev) => prev.filter((p) => p._id !== postId))
    );
  }, [on]);

  useEffect(() => {
    return on("post:like", ({ postId, likes }: { postId: string; likes: string[] }) =>
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes } : p)))
    );
  }, [on]);

  useEffect(() => {
    return on("chat:notify", ({ conversationId }: any) => {
      setUnread((prev) => ({ ...prev, [conversationId]: (prev[conversationId] || 0) + 1 }));
    });
  }, [on]);

  const clearUnread = useCallback((conversationId: string) => {
    setUnread((prev) => ({ ...prev, [conversationId]: 0 }));
  }, []);

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const loadMore = () => {
    setLoading(true);
    loadFeed(page + 1);
  };

  const feedTabs: { key: FeedTab; label: string }[] = [
    { key: "all", label: "All Posts" },
    { key: "campaign", label: "Campaigns" },
    { key: "my-campaigns", label: "My Campaigns" },
    { key: "ended", label: "Ended" },
  ];

  return (
    <div className="min-h-screen">
      <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div className="page-header-icon bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h1 className="page-header-title">Activity</h1>
        </div>
        <p className="page-header-desc">Share updates and chat with the community.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Feed */}
        <div ref={feedRef}>
          {/* Feed tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200/60">
              {feedTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFeedType(t.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                    feedType === t.key
                      ? "bg-eco-primary text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">#</span>
              <input
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLoading(true);
                    loadFeed(1);
                  }
                }}
                placeholder="Search hashtags (press Enter)"
                className="w-full input-field !py-2 pl-7 text-sm"
              />
            </div>
          </div>

          {user && feedType !== "ended" && (
            <CreatePost
              user={{ id: user.id, name: user.name, avatar: user.avatar }}
              onCreated={(post) => setPosts((prev) => [post, ...prev])}
            />
          )}

          {posts.length === 0 && !loading ? (
            <div className="card text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">
                {feedType === "my-campaigns"
                  ? "You haven't created any campaigns yet."
                  : feedType === "ended"
                  ? "No ended campaigns."
                  : "No activity yet. Be the first to post!"}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user!.id}
                socketOn={on}
                onUpdated={(updated) =>
                  setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
                }
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
                onLikeEvent={(postId, likes) =>
                  setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes } : p)))
                }
                onCampaignStarted={(conversationId, conversation) => {
                  if (conversation) addCampaignChatOptimistic(conversation);
                  else if (conversationId) loadCampaignChats();
                }}
              />
            ))
          )}

          {hasMore && (
            <button onClick={loadMore} disabled={loading} className="btn-secondary w-full mt-2">
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </div>

        {/* Campaign chat sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            {(activeChats.length > 0 || endedChats.length > 0) && socket.current ? (
              <div>
                {activeChats.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Active Chats
                    </p>
                    <div className="space-y-1 mb-3">
                      {activeChats.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => setActiveCampaignId(c._id)}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between font-medium ${
                            activeCampaignId === c._id
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-emerald-50 border border-slate-200/60 shadow-card"
                          }`}
                        >
                          <span className="truncate">{c.title || "Campaign"}</span>
                          {unread[c._id] > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold">
                              {unread[c._id]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {endedChats.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      Ended
                    </p>
                    <div className="space-y-1 mb-3">
                      {endedChats.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => setActiveCampaignId(c._id)}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                            activeCampaignId === c._id
                              ? "bg-gray-500 text-white shadow-sm"
                              : "bg-white text-gray-500 hover:bg-gray-100 border border-slate-200/60 shadow-card"
                          }`}
                        >
                          <span className="truncate">{c.title || "Campaign"}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeCampaignId && (
                  <ChatPanel
                    key={activeCampaignId}
                    currentUserId={user!.id}
                    socket={socket}
                    emit={emit}
                    onlineUsers={onlineUsers}
                    isUserOnline={isUserOnline}
                    onClose={() => {}}
                    unread={unread}
                    clearUnread={clearUnread}
                    initialConversationId={activeCampaignId}
                    isEnded={activeChatIsEnded}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 text-center shadow-card">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  No campaign chats yet. Start or join a campaign to chat!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: floating button + slide-up panel */}
      {!showChat && (activeChats.length > 0 || endedChats.length > 0) && (
        <button
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 btn-primary !rounded-full !p-4 shadow-float relative active:scale-90"
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {showChat && (activeChats.length > 0 || endedChats.length > 0) && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
          {socket.current && (
            <div>
              <div className="space-y-1 mb-2">
                {activeChats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setActiveCampaignId(c._id)}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between font-medium ${
                      activeCampaignId === c._id
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-slate-200/80 shadow-card"
                    }`}
                  >
                    <span className="truncate">{c.title || "Campaign"}</span>
                    {unread[c._id] > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold">
                        {unread[c._id]}
                      </span>
                    )}
                  </button>
                ))}
                {endedChats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setActiveCampaignId(c._id)}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                      activeCampaignId === c._id
                        ? "bg-gray-500 text-white shadow-sm"
                        : "bg-white text-gray-500 border border-slate-200/60 shadow-card"
                    }`}
                  >
                    <span className="truncate">{c.title || "Campaign"}</span>
                  </button>
                ))}
              </div>
              {activeCampaignId && (
                <ChatPanel
                  key={activeCampaignId}
                  currentUserId={user!.id}
                  socket={socket}
                  emit={emit}
                  onlineUsers={onlineUsers}
                  isUserOnline={isUserOnline}
                  onClose={() => setShowChat(false)}
                  unread={unread}
                  clearUnread={clearUnread}
                  initialConversationId={activeCampaignId}
                  isEnded={activeChatIsEnded}
                />
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
