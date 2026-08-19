import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pause, Play, Scan, Tag, Target, UploadCloud } from "lucide-react";

import type { FilmAnalysisSession, FilmTag, PlayTagCategory } from "../types";
import { seekVideoToTimestamp } from "../lib/filmSeek";

export interface AIFilmStudioProps {
  videoId: string;
  sourceUrl?: string;
}

function emptySession(videoId: string): FilmAnalysisSession {
  return {
    videoId,
    status: "IDLE",
    tags: [],
    processedFrames: 0,
    totalFrames: 0,
  };
}

function categoryClass(category: PlayTagCategory): string {
  if (category === "COVERAGE") return "text-purple-400";
  if (category === "ROUTE_TREE") return "text-cyan-400";
  if (category === "BLOCKING_SCHEME") return "text-amber-400";
  return "text-rose-400";
}

export const AIFilmStudio: React.FC<AIFilmStudioProps> = ({ videoId, sourceUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const rafRef = useRef<number>(0);
  const scanTimerRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localUrl, setLocalUrl] = useState<string | null>(sourceUrl ?? null);
  const [session, setSession] = useState<FilmAnalysisSession>(() => emptySession(videoId));
  const [pinnedTagId, setPinnedTagId] = useState<string | null>(null);

  const filmUrl = localUrl ?? sourceUrl ?? null;

  useEffect(() => {
    setSession((prev) => ({ ...prev, videoId }));
  }, [videoId]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.clearInterval(scanTimerRef.current);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const syncClock = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
    rafRef.current = window.requestAnimationFrame(syncClock);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      window.cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = window.requestAnimationFrame(syncClock);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [isPlaying, syncClock]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !filmUrl) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }
    void video.play();
    setIsPlaying(true);
  };

  const handleFilmUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setLocalUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setSession(emptySession(videoId));
    setPinnedTagId(null);
  };

  const activeTags = useMemo(() => {
    return session.tags.filter((tag) => Math.abs(tag.timestampSeconds - currentTime) < 1);
  }, [session.tags, currentTime]);

  const ledgerTags = useMemo(() => {
    return [...session.tags].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }, [session.tags]);

  const executeVisionAnalysis = () => {
    const video = videoRef.current;
    if (!video || !filmUrl) return;

    window.clearInterval(scanTimerRef.current);
    const totalFrames = Math.max(1, Math.round((Number.isFinite(video.duration) ? video.duration : 10) * 30));
    setSession({
      videoId,
      status: "PROCESSING",
      tags: [],
      processedFrames: 0,
      totalFrames,
    });

    scanTimerRef.current = window.setInterval(() => {
      setSession((prev) => {
        if (prev.status !== "PROCESSING") return prev;
        const next = Math.min(prev.totalFrames, prev.processedFrames + 15);
        if (next >= prev.totalFrames) {
          window.clearInterval(scanTimerRef.current);
          return {
            ...prev,
            processedFrames: prev.totalFrames,
            status: "COMPLETED",
            tags: [],
          };
        }
        return { ...prev, processedFrames: next };
      });
    }, 100);
  };

  const seekToTag = (tag: FilmTag) => {
    const video = videoRef.current;
    if (!video) return;
    setIsPlaying(false);
    setPinnedTagId(tag.id);
    void seekVideoToTimestamp(video, tag.timestampSeconds).then((landedAt) => {
      setCurrentTime(landedAt);
    });
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const scanPercent =
    session.totalFrames > 0 ? Math.round((session.processedFrames / session.totalFrames) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full min-h-[600px]">
      <div className="flex-1 flex flex-col bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800 min-h-[360px]">
        <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-start bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Scan className="w-4 h-4 shrink-0 text-purple-400" />
            Vision Telemetry
          </h2>
          {session.status === "COMPLETED" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
              Tracking Active
            </div>
          )}
        </div>

        <div className="flex-1 relative bg-[#050505] overflow-hidden min-h-[280px]">
          {filmUrl ? (
            <video
              ref={videoRef}
              src={filmUrl}
              className="absolute inset-0 w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              controls={false}
              playsInline
              muted
            />
          ) : (
            <label className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 m-6 rounded-xl cursor-pointer min-h-[44px]">
              <UploadCloud className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-xs font-mono text-slate-500 uppercase">Load Raw Film Data</p>
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleFilmUpload}
                className="sr-only"
                aria-label="Upload game film"
              />
            </label>
          )}

          {session.status === "COMPLETED" &&
            activeTags.map((tag) => {
              if (!tag.boundingBox) return null;
              return (
                <div
                  key={tag.id}
                  className="absolute border-2 border-purple-500 bg-purple-500/10 pointer-events-none transition-all duration-75"
                  style={{
                    left: `${tag.boundingBox.x}%`,
                    top: `${tag.boundingBox.y}%`,
                    width: `${tag.boundingBox.width}%`,
                    height: `${tag.boundingBox.height}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-purple-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap uppercase tracking-wider shadow-lg">
                    {tag.label} {(tag.confidenceScore * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
        </div>

        <div className="bg-slate-900 border-t border-slate-800 p-4 flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!filmUrl}
            aria-label={isPlaying ? "Pause film" : "Play film"}
            className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
            <div className="absolute top-0 left-0 bottom-0 bg-purple-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12 text-right tabular-nums">{currentTime.toFixed(1)}s</span>
        </div>
      </div>

      <div className="lg:w-80 bg-slate-900 flex flex-col min-h-[280px]">
        <div className="p-5 border-b border-slate-800 space-y-4">
          <button
            type="button"
            onClick={executeVisionAnalysis}
            disabled={session.status === "PROCESSING" || !filmUrl}
            className={`w-full min-h-[44px] rounded-xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              session.status === "PROCESSING"
                ? "bg-slate-800 text-slate-500 cursor-wait"
                : "bg-purple-500 text-slate-950 hover:bg-purple-400 disabled:bg-slate-800 disabled:text-slate-500"
            }`}
          >
            {session.status === "PROCESSING" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing {scanPercent}%
              </>
            ) : (
              <>
                <Target className="w-4 h-4" /> Run Play-Action Scan
              </>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
            Extracted Metadata
          </h3>
          {ledgerTags.length === 0 ? (
            <p className="text-xs text-slate-600 font-mono text-center mt-10 min-h-[80px]">
              {session.status === "COMPLETED"
                ? "Scan finished. No temporal tags emitted — route/coverage classifier is fail-closed until kinematic vectors are attached."
                : "No vision tags generated for this film session."}
            </p>
          ) : (
            ledgerTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => seekToTag(tag)}
                className={`w-full text-left bg-slate-950 border p-3 rounded-xl min-h-[44px] transition-colors ${
                  pinnedTagId === tag.id || Math.abs(tag.timestampSeconds - currentTime) < 1
                    ? "border-purple-500/50 hover:border-purple-400"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${categoryClass(tag.category)}`}>
                    {tag.category.replaceAll("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{tag.timestampSeconds.toFixed(1)}s</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-sm font-black text-slate-200 truncate">{tag.label}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
