const DEFAULT_FILM_FPS = 30;

export function snapTimestampToFrame(timestampSeconds: number, fps: number = DEFAULT_FILM_FPS): number {
  const rate = fps > 0 ? fps : DEFAULT_FILM_FPS;
  return Math.round(timestampSeconds * rate) / rate;
}

/**
 * Pause, seek to the tag timestamp (snapped to a frame), wait for `seeked`
 * so overlay state matches the decoded frame—not a stale rAF clock.
 */
export function seekVideoToTimestamp(video: HTMLVideoElement, timestampSeconds: number): Promise<number> {
  video.pause();
  const target = snapTimestampToFrame(timestampSeconds);
  if (Math.abs(video.currentTime - target) < 1 / 120) {
    return Promise.resolve(video.currentTime);
  }

  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve(video.currentTime);
    };
    const onError = () => {
      cleanup();
      reject(new Error("Film seek failed."));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = target;
  });
}
