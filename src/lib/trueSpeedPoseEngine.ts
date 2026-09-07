import type { PoseLandmarker } from "@mediapipe/tasks-vision";

const MEDIAPIPE_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task";

function waitForIdle(): Promise<void> {
  return new Promise((resolve) => {
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      ric(() => resolve(), { timeout: 1500 });
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function createLandmarker(
  PoseLandmarker: typeof import("@mediapipe/tasks-vision").PoseLandmarker,
  FilesetResolver: typeof import("@mediapipe/tasks-vision").FilesetResolver,
  delegate: "GPU" | "CPU",
): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: POSE_MODEL,
      delegate,
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });
}

/**
 * Loads PoseLandmarker_heavy after first paint + idle so the SPA shell stays fluid.
 * WASM compile still hits the main thread; we never start it during React commit.
 */
export async function initializePoseLandmarkerHeavy(): Promise<PoseLandmarker> {
  await waitForPaint();
  await waitForIdle();
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  try {
    return await createLandmarker(PoseLandmarker, FilesetResolver, "GPU");
  } catch {
    return createLandmarker(PoseLandmarker, FilesetResolver, "CPU");
  }
}
