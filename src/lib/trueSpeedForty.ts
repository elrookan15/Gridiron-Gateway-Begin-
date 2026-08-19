/**
 * Constant-speed 40-yard time from TrueSpeed peak velocity (mph).
 *
 * 1 mph = 5280 ft / 3600 s = 22/15 ft/s. 40 yards = 120 feet.
 * t = 120 / (mph * 22/15) = 1800 / (22 * mph).
 *
 * A yards-over-ft/s formula (40 / (mph * 1.46667)) renders 22 mph as 1.24s
 * instead of ~3.72s on the live Top 250.
 */
export function fortyYardSecondsFromMph(mph: number): number {
  if (!Number.isFinite(mph) || mph <= 0) {
    return 0;
  }
  return Number((1800 / (22 * mph)).toFixed(2));
}
