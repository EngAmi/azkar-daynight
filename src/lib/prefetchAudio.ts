// Prefetch audio files for the current session so playback works even on
// weak or offline networks. Requests are made with low priority and limited
// concurrency to avoid saturating the user's connection. The service worker's
// CacheFirst rules for adhkar-audio / adhkar-audio-local store the responses.
//
// Safe no-op in dev / Lovable preview (no SW registered there) — the fetches
// still succeed but simply aren't cached, which is fine.

import { AUDIO_BASE_URL } from "@/data/adhkar";

function resolveAudioUrl(audioFile: string): string {
  if (/^(https?:)?\/\//.test(audioFile) || audioFile.startsWith("/")) return audioFile;
  return `${AUDIO_BASE_URL}${audioFile}`;
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
      // @ts-expect-error — priority is a valid but not-yet-typed hint
      priority: "low",
      signal,
    });
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
        await prefetchOne(urls[i], controller.signal);
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
