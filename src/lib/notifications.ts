// Local (device-side) notification scheduler for morning/evening adhkar.
// No server — uses browser Notification API + Service Worker registration
// where available, and falls back to `new Notification` when there is no SW
// (e.g. dev/preview). Reschedules on load, on visibilitychange, and after
// firing. Cross-tab safe via a shared setTimeout id kept in module scope.

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM" 24h */
  morningTime: string;
  /** "HH:MM" 24h */
  eveningTime: string;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  morningTime: "07:00",
  eveningTime: "17:00",
};

export const REMINDER_STORAGE_KEY = "adhkar:reminders:v1";

export function loadReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REMINDER_SETTINGS;
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      enabled: !!parsed.enabled,
      morningTime: typeof parsed.morningTime === "string" ? parsed.morningTime : DEFAULT_REMINDER_SETTINGS.morningTime,
      eveningTime: typeof parsed.eveningTime === "string" ? parsed.eveningTime : DEFAULT_REMINDER_SETTINGS.eveningTime,
    };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveReminderSettings(s: ReminderSettings) {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("adhkar:reminders-changed"));
  } catch {
    // ignore
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

interface NextTarget {
  when: number;
  type: "morning" | "evening";
}

function parseHM(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map((v) => parseInt(v, 10));
  return {
    h: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 7,
    m: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  };
}

/** Compute the next upcoming reminder (either morning or evening) after `from`. */
export function computeNextReminder(settings: ReminderSettings, from: Date = new Date()): NextTarget | null {
  if (!settings.enabled) return null;
  const mk = (hm: string, dayOffset: number) => {
    const { h, m } = parseHM(hm);
    const d = new Date(from);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  };
  const candidates: NextTarget[] = [];
  for (const off of [0, 1]) {
    const morning = mk(settings.morningTime, off);
    const evening = mk(settings.eveningTime, off);
    if (morning > from.getTime()) candidates.push({ when: morning, type: "morning" });
    if (evening > from.getTime()) candidates.push({ when: evening, type: "evening" });
  }
  candidates.sort((a, b) => a.when - b.when);
  return candidates[0] ?? null;
}

let scheduledTimeoutId: number | null = null;
let scheduledFor: number | null = null;

async function fireNotification(type: "morning" | "evening") {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const title = type === "morning" ? "أذكار الصباح" : "أذكار المساء";
  const body =
    type === "morning"
      ? "حصّن يومك بأذكار الصباح — لحظة سكون وذكر."
      : "استقبل ليلتك بأذكار المساء — قلبٌ مطمئنّ بذكر الله.";
  const url = `/?session=${type}`;
  const options: NotificationOptions = {
    body,
    icon: "/og-image.webp",
    badge: "/og-image.webp",
    tag: `adhkar-${type}`,
    dir: "rtl",
    lang: "ar",
    data: { url },
  };
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, options);
        return;
      }
    }
    new Notification(title, options);
  } catch {
    try {
      new Notification(title, options);
    } catch {
      // ignore
    }
  }
}

/** Schedule the next reminder. Clears any pending one first. Safe to call repeatedly. */
export function scheduleNextReminder(settings: ReminderSettings) {
  if (typeof window === "undefined") return;
  if (scheduledTimeoutId !== null) {
    clearTimeout(scheduledTimeoutId);
    scheduledTimeoutId = null;
    scheduledFor = null;
  }
  if (!settings.enabled) return;
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const next = computeNextReminder(settings);
  if (!next) return;

  // setTimeout can't be trusted beyond ~24d, and long sleeps get throttled.
  // Cap at 6h and re-schedule on wake — visibilitychange handler covers the rest.
  const delay = Math.min(next.when - Date.now(), 6 * 60 * 60 * 1000);
  scheduledFor = next.when;

  scheduledTimeoutId = window.setTimeout(async () => {
    scheduledTimeoutId = null;
    // Only fire if we've actually reached the target time.
    if (Date.now() + 1000 >= (scheduledFor ?? 0)) {
      await fireNotification(next.type);
    }
    scheduledFor = null;
    // Reschedule the next one.
    scheduleNextReminder(loadReminderSettings());
  }, Math.max(0, delay));
}

/** Send a test notification immediately (for the settings UI). */
export async function sendTestNotification() {
  await fireNotification(
    new Date().getHours() < 15 ? "morning" : "evening"
  );
}

/** Attach global listeners: reschedule on load, on tab focus, on settings change. */
export function installReminderScheduler() {
  if (typeof window === "undefined") return () => {};
  const reschedule = () => scheduleNextReminder(loadReminderSettings());
  reschedule();
  const onVis = () => {
    if (document.visibilityState === "visible") reschedule();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === REMINDER_STORAGE_KEY) reschedule();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", reschedule);
  window.addEventListener("storage", onStorage);
  window.addEventListener("adhkar:reminders-changed", reschedule);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", reschedule);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("adhkar:reminders-changed", reschedule);
    if (scheduledTimeoutId !== null) {
      clearTimeout(scheduledTimeoutId);
      scheduledTimeoutId = null;
    }
  };
}

export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.("(display-mode: standalone)");
  // @ts-expect-error iOS Safari-only
  const iosStandalone = window.navigator.standalone === true;
  return !!(mql?.matches || iosStandalone);
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}
