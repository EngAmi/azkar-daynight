// Prefetch audio files for the current session so playback works even on
// weak or offline networks. Requests are made with low priority and limited
// concurrency to avoid saturating the user's connection. The service worker's
// CacheFirst rules for adhkar-audio / adhkar-audio-local store the responses.
//
// Safe no-op in dev / Lovable preview (no SW registered there) — the fetches
// still succeed but simply aren't cached, which is fine.

import { AUDIO_BASE_URL } from "@/data/adhkar";

export function resolveAudioUrl(audioFile: string): string {
  if (/^(https?:)?\/\//.test(audioFile) || audioFile.startsWith("/")) return audioFile;
  return `${AUDIO_BASE_URL}${audioFile}`;
}

// --- Warm audio elements -------------------------------------------------
// Fetching alone only fills the HTTP/SW cache; the browser still has to build
// and decode an audio element on first play. Keeping a couple of preloaded
// <audio> elements around makes playback start instantly on resume, even the
// very first time the media is stored locally.
const MAX_WARM = 4;
const warm = new Map<string, HTMLAudioElement>();

export function warmAudio(audioFile?: string): HTMLAudioElement | undefined {
  if (!audioFile || typeof window === "undefined") return undefined;
  const url = resolveAudioUrl(audioFile);
  const existing = warm.get(url);
  if (existing) {
    // refresh LRU order
    warm.delete(url);
    warm.set(url, existing);
    return existing;
  }
  const audio = new Audio();
  audio.preload = "auto";
  audio.crossOrigin = "anonymous";
  audio.src = url;
  try {
    audio.load();
  } catch {
    // ignore
  }
  warm.set(url, audio);
  while (warm.size > MAX_WARM) {
    const oldestKey = warm.keys().next().value as string | undefined;
    if (!oldestKey) break;
    const old = warm.get(oldestKey);
    warm.delete(oldestKey);
    if (old) {
      old.pause();
      old.removeAttribute("src");
      try {
        old.load();
      } catch {
        // ignore
      }
    }
  }
  return audio;
}

export function getWarmAudio(audioFile?: string): HTMLAudioElement | undefined {
  if (!audioFile) return undefined;
  return warm.get(resolveAudioUrl(audioFile));
}


const inflight = new Set<string>();
const done = new Set<string>();

async function prefetchOne(url: string, signal?: AbortSignal): Promise<void> {
  if (done.has(url) || inflight.has(url)) return;
  inflight.add(url);
  try {
    // `no-cors` allows opaque responses (cacheableResponse allows status 0).
    // Low priority so we never contend with the currently-playing audio.
    await fetch(url, {
      method: "GET",
      mode: "no-cors",
      credentials: "omit",
      cache: "default",
      // Low priority hint so we never contend with the currently-playing audio.
      priority: "low",
      signal,
    } as RequestInit & { priority?: "low" | "high" | "auto" });
    done.add(url);
  } catch {
    // ignore — user may be offline; SW will serve whatever it already has
  } finally {
    inflight.delete(url);
  }
}

/**
 * Prefetch the audio files for a list of adhkar with limited concurrency.
 * Returns an AbortController the caller can use to cancel on unmount / tab change.
 */
export function prefetchSessionAudio(
  audioFiles: Array<string | undefined>,
  concurrency = 2,
): AbortController {
  const controller = new AbortController();
  const urls = Array.from(
    new Set(audioFiles.filter((f): f is string => !!f).map(resolveAudioUrl)),
  ).filter((u) => !done.has(u));

  if (urls.length === 0 || typeof window === "undefined" || !("fetch" in window)) {
    return controller;
  }

  // Wait for the page to be idle before starting — never compete with first paint.
  const start = () => {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
      while (cursor < urls.length && !controller.signal.aborted) {
        const i = cursor++;
        const url = urls[i];
        if (url) await prefetchOne(url, controller.signal);
      }
    });
    void Promise.all(workers);
  };

  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof idle === "function") {
    idle(start, { timeout: 2000 });
  } else {
    setTimeout(start, 600);
  }

  return controller;
}
