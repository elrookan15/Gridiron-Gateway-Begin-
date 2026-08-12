import React, { useState } from "react";
import { MOCK_SOCIAL_POSTS } from "../data/mockData";
import { SocialPost } from "../types";
import {
  Heart,
  Repeat2,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Video,
  Plus,
  Link2,
  X,
  Play,
  Share2,
  Film,
  Edit3
} from "lucide-react";

interface SocialMediaShowcaseProps {
  athleteName: string;
  twitterHandle: string;
  instagramHandle?: string;
  facebookHandle?: string;
  hudlUrl?: string;
  youtubeFilmUrl?: string;
  onUpdateHandles?: (handles: {
    twitterHandle: string;
    instagramHandle?: string;
    facebookHandle?: string;
    hudlUrl?: string;
    youtubeFilmUrl?: string;
  }) => void;
  onAddSocialPost?: (post: SocialPost) => void;
}

export const SocialMediaShowcase: React.FC<SocialMediaShowcaseProps> = ({
  athleteName,
  twitterHandle,
  instagramHandle,
  facebookHandle,
  hudlUrl,
  youtubeFilmUrl,
  onUpdateHandles,
  onAddSocialPost,
}) => {
  const [activePlatformFilter, setActivePlatformFilter] = useState<
    "All" | "Twitter" | "Instagram" | "Hudl" | "Facebook" | "Highlights"
  >("All");

  const [posts, setPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [repostedPostIds, setRepostedPostIds] = useState<Record<string, boolean>>({});
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  // Handle Editing Modal state
  const [showManageModal, setShowManageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"handles" | "addPost">("handles");

  // Form states
  const [twHandleInput, setTwHandleInput] = useState(twitterHandle || "");
  const [igHandleInput, setIgHandleInput] = useState(instagramHandle || "");
  const [fbHandleInput, setFbHandleInput] = useState(facebookHandle || "");
  const [hudlUrlInput, setHudlUrlInput] = useState(hudlUrl || "");
  const [ytUrlInput, setYtUrlInput] = useState(youtubeFilmUrl || "");

  // New Post state
  const [postPlatform, setPostPlatform] = useState<"Twitter" | "Instagram" | "Facebook">("Twitter");
  const [postCaption, setPostCaption] = useState("");
  const [postHighlightTitle, setPostHighlightTitle] = useState("");
  const [postVideoUrl, setPostVideoUrl] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");

  const handleToggleLike = (postId: string) => {
    setLikedPostIds((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleToggleRepost = (postId: string) => {
    setRepostedPostIds((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHandle(label);
    setTimeout(() => setCopiedHandle(null), 2000);
  };

  const handleCopyScoutPackage = () => {
    const formattedTw = twitterHandle ? (twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`) : "N/A";
    const formattedIg = instagramHandle ? (instagramHandle.startsWith("@") ? instagramHandle : `@${instagramHandle}`) : "N/A";
    const formattedHudl = hudlUrl || "N/A";

    const packageText = `🏈 GRIDIRON GATEWAY — RECRUITING & MEDIA PACKAGE
👤 Athlete: ${athleteName}
🎬 HUDL Reel: ${formattedHudl}
🐦 X (Twitter): ${formattedTw}
📸 Instagram: ${formattedIg}
${youtubeFilmUrl ? `▶️ YouTube Film: ${youtubeFilmUrl}` : ""}`;

    navigator.clipboard.writeText(packageText);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
  };

  const handleSaveHandlesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateHandles) {
      let formattedHudl = hudlUrlInput.trim();
      if (formattedHudl && !formattedHudl.startsWith("http")) {
        formattedHudl = `https://${formattedHudl}`;
      }
      let formattedYt = ytUrlInput.trim();
      if (formattedYt && !formattedYt.startsWith("http")) {
        formattedYt = `https://${formattedYt}`;
      }

      onUpdateHandles({
        twitterHandle: twHandleInput.trim().startsWith("@") ? twHandleInput.trim() : `@${twHandleInput.trim()}`,
        instagramHandle: igHandleInput.trim() ? (igHandleInput.trim().startsWith("@") ? igHandleInput.trim() : `@${igHandleInput.trim()}`) : "",
        facebookHandle: fbHandleInput.trim(),
        hudlUrl: formattedHudl,
        youtubeFilmUrl: formattedYt,
      });
    }
    setShowManageModal(false);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCaption) return;

    let handleUsed = twHandleInput || twitterHandle;
    if (postPlatform === "Instagram") handleUsed = igHandleInput || instagramHandle || "@athlete_ig";
    if (postPlatform === "Facebook") handleUsed = fbHandleInput || facebookHandle || "facebook.com/athlete";

    const newPost: SocialPost = {
      id: `custom-sp-${Date.now()}`,
      platform: postPlatform,
      authorName: athleteName,
      handle: handleUsed,
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80",
      timestamp: "Just now",
      content: postCaption,
      likes: 1,
      retweets: 0,
      verified: true,
      videoUrl: postVideoUrl || undefined,
      mediaUrl: postMediaUrl || undefined,
      highlightTitle: postHighlightTitle || undefined,
    };

    setPosts([newPost, ...posts]);
    if (onAddSocialPost) {
      onAddSocialPost(newPost);
    }

    setPostCaption("");
    setPostHighlightTitle("");
    setPostVideoUrl("");
    setPostMediaUrl("");
    setShowManageModal(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (activePlatformFilter === "Highlights") {
      return Boolean(post.videoUrl || post.highlightTitle);
    }
    if (activePlatformFilter === "Hudl") {
      return Boolean(post.videoUrl || post.highlightTitle);
    }
    if (activePlatformFilter !== "All" && post.platform !== activePlatformFilter) {
      return false;
    }
    return true;
  });

  const formattedTwUrl = `https://x.com/${(twitterHandle || "").replace("@", "")}`;
  const formattedIgUrl = `https://instagram.com/${(instagramHandle || "").replace("@", "")}`;
  const formattedFbUrl = (facebookHandle || "").startsWith("http")
    ? facebookHandle
    : `https://${facebookHandle || "facebook.com"}`;
  const formattedHudlUrl = (hudlUrl || "").startsWith("http") ? hudlUrl! : `https://${hudlUrl || "hudl.com"}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header & Social Audit Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Scout Social & Film Hub
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Verified Recruit Handles
            </span>
          </div>
          <h2 className="text-md font-extrabold text-white mt-1 flex items-center gap-2">
            Social Media & HUDL Film Integration
          </h2>
          <p className="text-[11px] text-slate-400">
            Link Instagram, X (Twitter) & HUDL accounts for streamlined college scouting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyScoutPackage}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted links to send to college recruiters"
          >
            {copiedPackage ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Package Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Scout Package</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setTwHandleInput(twitterHandle || "");
              setIgHandleInput(instagramHandle || "");
              setFbHandleInput(facebookHandle || "");
              setHudlUrlInput(hudlUrl || "");
              setYtUrlInput(youtubeFilmUrl || "");
              setShowManageModal(true);
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" /> Link Handles
          </button>
        </div>
      </div>

      {/* CONNECTED SCOUTING PLATFORMS STRIP (X, INSTAGRAM, HUDL) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* X (Twitter) Card Badge */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-500/30 flex items-center justify-between group hover:border-cyan-400 transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 font-black text-xs">
              𝕏
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">X / Twitter</span>
              <a
                href={formattedTwUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-cyan-400 hover:underline truncate block"
              >
                {twitterHandle || "@link_handle"}
              </a>
            </div>
          </div>
          {twitterHandle && (
            <button
              onClick={() => handleCopyText(twitterHandle, "tw")}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="Copy handle"
            >
              {copiedHandle === "tw" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Instagram Card Badge */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-pink-500/30 flex items-center justify-between group hover:border-pink-400 transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500 p-0.5 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-pink-400 font-bold text-xs">
                IG
              </div>
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instagram</span>
              {instagramHandle ? (
                <a
                  href={formattedIgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-black text-pink-400 hover:underline truncate block"
                >
                  {instagramHandle}
                </a>
              ) : (
                <span className="text-xs text-slate-500 italic block">Not Linked</span>
              )}
            </div>
          </div>
          {instagramHandle && (
            <button
              onClick={() => handleCopyText(instagramHandle, "ig")}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="Copy handle"
            >
              {copiedHandle === "ig" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* HUDL Film Reel Badge */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/40 flex items-center justify-between group hover:border-amber-400 transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Film className="w-4 h-4 text-amber-400" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                HUDL Film Reel
              </span>
              {hudlUrl ? (
                <a
                  href={formattedHudlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-black text-white hover:text-amber-300 hover:underline truncate block"
                >
                  Watch Hudl Highlights
                </a>
              ) : (
                <span className="text-xs text-slate-500 italic block">Not Linked</span>
              )}
            </div>
          </div>
          {hudlUrl && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleCopyText(hudlUrl, "hudl")}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Copy Hudl URL"
              >
                {copiedHandle === "hudl" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
              <a
                href={formattedHudlUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer"
                title="Open Hudl"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Coach Evaluation Summary Banner */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-white text-xs">High Work Ethic & Leadership Flags</p>
            <p className="text-[11px] text-slate-400">
              0 offensive flags • Strong workout film consistency • Verified scout visibility
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-center text-[10px]">
          <div>
            <span className="text-slate-500 block">Total Engagement</span>
            <span className="font-black text-white">8.4k Likes</span>
          </div>
          <div>
            <span className="text-slate-500 block">Verified Coach Reach</span>
            <span className="font-black text-emerald-400">142 Coaches</span>
          </div>
        </div>
      </div>

      {/* Platform & Highlight Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(["All", "Twitter", "Instagram", "Hudl", "Facebook", "Highlights"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActivePlatformFilter(filter)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activePlatformFilter === filter
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter === "Twitter" ? "𝕏 (Twitter)" : filter === "Hudl" ? "🏈 HUDL Film" : filter === "Highlights" ? "🎬 Clips" : filter}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Showing {filteredPosts.length} Items
        </span>
      </div>

      {/* Social Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
            <Film className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold">No social posts found for this filter.</p>
            <p className="text-[11px] text-slate-500">Post a new highlight or switch filters to view content.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPostIds[post.id];
            const isReposted = repostedPostIds[post.id];
            const currentLikes = post.likes + (isLiked ? 1 : 0);
            const currentReposts = post.retweets + (isReposted ? 1 : 0);

            return (
              <div
                key={post.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-200 space-y-3 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.avatarUrl}
                      alt={post.authorName}
                      className="w-9 h-9 rounded-full border border-slate-700 object-cover shadow-inner"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{post.authorName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {post.handle} • {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded border text-[10px] font-bold ${
                        post.platform === "Twitter"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : post.platform === "Instagram"
                          ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {post.platform === "Twitter" ? "X / Twitter" : post.platform}
                    </span>
                  </div>
                </div>

                {post.highlightTitle && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs">
                    <Video className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{post.highlightTitle}</span>
                  </div>
                )}

                <p className="leading-relaxed text-slate-200 font-medium">{post.content}</p>

                {/* Embedded Video Media Player */}
                {post.videoUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-inner group">
                    <video
                      src={post.videoUrl}
                      controls
                      className="w-full max-h-72 object-cover rounded-xl"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-bold text-emerald-400 border border-slate-800 flex items-center gap-1">
                      <Film className="w-3 h-3 text-emerald-400" /> Embedded Highlight Video
                    </div>
                  </div>
                ) : post.mediaUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-800 group">
                    <img
                      src={post.mediaUrl}
                      alt="Post Media"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-white border border-slate-800">
                      Media Attachment
                    </div>
                  </div>
                ) : null}

                {/* Engagement Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${
                        isLiked ? "text-rose-400 font-bold" : ""
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`} />{" "}
                      {currentLikes} Likes
                    </button>

                    <button
                      onClick={() => handleToggleRepost(post.id)}
                      className={`flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer ${
                        isReposted ? "text-emerald-400 font-bold" : ""
                      }`}
                    >
                      <Repeat2 className="w-3.5 h-3.5 text-emerald-400" /> {currentReposts} Reposts
                    </button>
                  </div>

                  <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified Scout Visible
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MANAGE SOCIAL HANDLES & POST HIGHLIGHT MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">Social Media & HUDL Film Hub</h3>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("handles")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "handles"
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Link Handles & Film
              </button>
              <button
                onClick={() => setActiveTab("addPost")}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "addPost"
                    ? "bg-cyan-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Embed Highlight Post
              </button>
            </div>

            {/* Tab 1: Link Handles */}
            {activeTab === "handles" && (
              <form onSubmit={handleSaveHandlesSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    X (formerly Twitter) Handle
                  </label>
                  <input
                    type="text"
                    value={twHandleInput}
                    onChange={(e) => setTwHandleInput(e.target.value)}
                    placeholder="@CadenCarterQB1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Direct contact handle used by college recruiters for recruiting DMs.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={igHandleInput}
                    onChange={(e) => setIgHandleInput(e.target.value)}
                    placeholder="@caden.carter_qb"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-pink-400 focus:outline-none focus:border-pink-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Used by college staffs for social media engagement & branding.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>HUDL Profile / Highlight Reel Link</span>
                    <span className="text-[10px] font-bold text-amber-400">Primary Scout Film</span>
                  </label>
                  <input
                    type="text"
                    value={hudlUrlInput}
                    onChange={(e) => setHudlUrlInput(e.target.value)}
                    placeholder="https://www.hudl.com/profile/18293847/caden-carter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Official high school game film link evaluated by collegiate staffs.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">YouTube Film Link (Optional)</label>
                  <input
                    type="text"
                    value={ytUrlInput}
                    onChange={(e) => setYtUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-red-400 focus:outline-none focus:border-red-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Facebook Handle or Profile Link (Optional)</label>
                  <input
                    type="text"
                    value={fbHandleInput}
                    onChange={(e) => setFbHandleInput(e.target.value)}
                    placeholder="facebook.com/caden.carter.qb"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManageModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Save Linked Accounts & Film
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Embed Highlight Post */}
            {activeTab === "addPost" && (
              <form onSubmit={handleCreatePostSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Platform</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(["Twitter", "Instagram", "Facebook"] as const).map((plat) => (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => setPostPlatform(plat)}
                        className={`py-2 rounded-xl font-bold border transition-all ${
                          postPlatform === plat
                            ? "bg-slate-800 text-white border-cyan-500"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {plat === "Twitter" ? "X (Twitter)" : plat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Highlight Title (Optional)</label>
                  <input
                    type="text"
                    value={postHighlightTitle}
                    onChange={(e) => setPostHighlightTitle(e.target.value)}
                    placeholder="e.g. 50-Yard Touchdown Pass in State Playoffs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Post Caption / Text *</label>
                  <textarea
                    rows={2}
                    required
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Describe your workout, game play, or recruiting update..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Highlight Video URL (Optional MP4 / Media Link)</label>
                  <input
                    type="url"
                    value={postVideoUrl}
                    onChange={(e) => setPostVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/...mp4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Embeds an HTML5 player directly into your profile social feed.</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManageModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Embed Post to Feed
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

