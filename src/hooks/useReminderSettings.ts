import { useEffect, useState, useCallback } from "react";
import {
  DEFAULT_REMINDER_SETTINGS,
  REMINDER_STORAGE_KEY,
  loadReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from "@/lib/notifications";

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);

  useEffect(() => {
    setSettings(loadReminderSettings());
    const sync = () => setSettings(loadReminderSettings());
    const onStorage = (e: StorageEvent) => {
      if (e.key === REMINDER_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("adhkar:reminders-changed", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("adhkar:reminders-changed", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<ReminderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveReminderSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
