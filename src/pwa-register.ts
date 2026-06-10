// Guarded service worker registration.
// Refuses to register in dev, Lovable preview, iframes, or when ?sw=off is set.
// In any refused context, unregisters any existing /sw.js to keep previews clean.

const SW_PATH = "/sw.js";

function isLovablePreviewHost(hostname: string): boolean {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppSw() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const scriptURL =
        reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || "";
      if (scriptURL.endsWith(SW_PATH)) {
        await reg.unregister();
      }
    }
  } catch {
    // ignore
  }
}

export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = window.self !== window.top;
  const swDisabled = new URLSearchParams(window.location.search).get("sw") === "off";
  const isPreview = isLovablePreviewHost(window.location.hostname);

  if (!import.meta.env.PROD || inIframe || isPreview || swDisabled) {
    void unregisterAppSw();
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_PATH, { scope: "/" }).catch(() => {
      // ignore registration errors
    });
  });
}
