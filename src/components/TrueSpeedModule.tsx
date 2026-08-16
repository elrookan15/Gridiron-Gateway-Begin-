import React, { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Loader2, Play, ShieldCheck, UploadCloud } from "lucide-react";

import {
  computeTrueSpeedFromHipTrack,
  hipCenterX,
  LEFT_ANKLE,
  LEFT_HIP,
  RIGHT_ANKLE,
  RIGHT_HIP,
  type HipSample,
} from "../lib/trueSpeedKinematics";
import { initializePoseLandmarkerHeavy } from "../lib/trueSpeedPoseEngine";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { TrueSpeedTelemetry } from "../types";

export interface TrueSpeedModuleProps {
  athleteId: string;
  onVerificationComplete: (telemetry: TrueSpeedTelemetry) => void;
}

function emptyTelemetry(athleteId: string): TrueSpeedTelemetry {
  return {
    athleteId,
    verifiedFortyTime: null,
    peakVelocityMph: null,
    averageStrideLengthInches: null,
    confidenceScore: 0,
    verificationStatus: "UNVERIFIED",
    analyzedAt: null,
  };
}

function waitForSeek(video: HTMLVideoElement, timeSec: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Video seek failed."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = Math.min(timeSec, Math.max(0, video.duration - 0.001));
  });
}

export const TrueSpeedModule: React.FC<TrueSpeedModuleProps> = ({
  athleteId,
  onVerificationComplete,
}) => {
  const [telemetry, setTelemetry] = useState<TrueSpeedTelemetry>(() => emptyTelemetry(athleteId));
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setTelemetry((prev) => ({ ...prev, athleteId }));
  }, [athleteId]);

  useEffect(() => {
    let isMounted = true;

    const initializeVisionModel = async () => {
      try {
        const poseLandmarker = await initializePoseLandmarkerHeavy();
        if (!isMounted) {
          poseLandmarker.close();
          return;
        }
        landmarkerRef.current = poseLandmarker;
        setIsModelLoading(false);
      } catch {
        if (isMounted) {
          setError("Failed to load computer vision telemetry engine.");
          setIsModelLoading(false);
        }
      }
    };

    void initializeVisionModel();
    return () => {
      isMounted = false;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !videoRef.current) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    videoRef.current.src = url;
    setHasVideo(true);
    setTelemetry(emptyTelemetry(athleteId));
    setError(null);
  };

  const processVideoFrames = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker || !hasVideo) return;

    setIsProcessing(true);
    setTelemetry((prev) => ({ ...prev, verificationStatus: "PROCESSING" }));
    setError(null);

    try {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
      }

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration < 3.2) {
        throw new Error("Clip too short for a 40-yard kinematic sample.");
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable.");

      video.pause();
      const sampleHz = 15;
      const step = 1 / sampleHz;
      const samples: HipSample[] = [];

      for (let t = 0, stamp = 0; t < duration; t += step, stamp += 1) {
        await waitForSeek(video, t);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const result = landmarker.detectForVideo(video, Math.round(t * 1000));
        const pose = result.landmarks[0];
        if (pose && pose[LEFT_HIP] && pose[RIGHT_HIP]) {
          const vis =
            ((pose[LEFT_HIP].visibility ?? 1) + (pose[RIGHT_HIP].visibility ?? 1)) / 2;
          samples.push({
            tSec: t,
            hipX: hipCenterX(pose[LEFT_HIP].x, pose[RIGHT_HIP].x),
            visibility: vis,
            leftAnkleX: pose[LEFT_ANKLE]?.x ?? pose[LEFT_HIP].x,
            rightAnkleX: pose[RIGHT_ANKLE]?.x ?? pose[RIGHT_HIP].x,
          });
        }
        if (stamp % 4 === 0) {
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
      }

      const finalTelemetry = computeTrueSpeedFromHipTrack(athleteId, samples);
      setTelemetry(finalTelemetry);
      if (finalTelemetry.verificationStatus === "AUTHENTICATED") {
        onVerificationComplete(finalTelemetry);
      } else {
        setError(
          "Kinematics rejected: insufficient hip travel, pose confidence, or clip duration for a 40-yard field reference.",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kinematic analysis failed.";
      setError(message);
      setTelemetry({
        ...emptyTelemetry(athleteId),
        verificationStatus: "REJECTED",
        analyzedAt: new Date().toISOString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const statusBadge = () => {
    if (telemetry.verificationStatus === "AUTHENTICATED") {
      return (
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
        </span>
      );
    }
    if (telemetry.verificationStatus === "PROCESSING") {
      return (
        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded">
          Processing
        </span>
      );
    }
    if (telemetry.verificationStatus === "REJECTED") {
      return (
        <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
        Awaiting Video
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 shrink-0 text-cyan-400" />
            TrueSpeed Auth Engine
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            MediaPipe kinematic frame-by-frame velocity analysis
          </p>
        </div>
        <div className="shrink-0">
          {isModelLoading ? (
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mounting WASM
            </span>
          ) : (
            statusBadge()
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl overflow-hidden group min-h-[180px]">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain z-10"
              controls={false}
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            {isModelLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 pointer-events-none">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Mounting PoseLandmarker WASM</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">UI remains interactive</p>
              </div>
            )}
            {!hasVideo && !isModelLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 pointer-events-none">
                <UploadCloud className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Sprint Video</p>
              </div>
            )}
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={handleVideoUpload}
              aria-label="Upload sprint video"
              className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => void processVideoFrames()}
            disabled={isModelLoading || isProcessing || !hasVideo || telemetry.verificationStatus === "AUTHENTICATED"}
            className={`w-full min-h-[44px] rounded-xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
              isProcessing || isModelLoading
                ? "bg-slate-800 text-slate-500 cursor-wait border border-slate-700"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
            }`}
          >
            {isModelLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Loading Vision Model
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Kinematics...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Authenticate Sprint
              </>
            )}
          </button>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5 min-h-[280px]">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Authenticated 40-Yard Dash
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-black tracking-tighter tabular-nums ${
                  telemetry.verifiedFortyTime ? "text-slate-100" : "text-slate-700"
                }`}
              >
                {telemetry.verifiedFortyTime ? telemetry.verifiedFortyTime.toFixed(2) : "--"}
              </span>
              <span className="text-sm font-mono text-slate-500">SEC</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Peak Velocity</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xl font-bold tabular-nums ${
                    telemetry.peakVelocityMph ? "text-cyan-400" : "text-slate-700"
                  }`}
                >
                  {telemetry.peakVelocityMph ? telemetry.peakVelocityMph.toFixed(1) : "--"}
                </span>
                <span className="text-[10px] font-mono text-slate-500">MPH</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model Confidence</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xl font-bold tabular-nums ${
                    telemetry.confidenceScore > 0 ? "text-emerald-400" : "text-slate-700"
                  }`}
                >
                  {telemetry.confidenceScore > 0 ? `${(telemetry.confidenceScore * 100).toFixed(0)}%` : "--"}
                </span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
              Hip landmarks 23/24 drive CoM displacement. Horizontal travel is scaled to a 40-yard field
              reference. Stationary camera, perpendicular to the sprint path, is required. Fail-closed if pose
              lock or travel is insufficient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
