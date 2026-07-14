import { useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import {
  isIOS,
  isStandalonePWA,
  notificationsSupported,
  requestNotificationPermission,
  scheduleNextReminder,
  sendTestNotification,
  computeNextReminder,
} from "@/lib/notifications";
import { toast } from "@/hooks/use-toast";

export function ReminderSettings() {
  const { settings, update } = useReminderSettings();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationsSupported() ? Notification.permission : "denied"
  );

  const supported = notificationsSupported();
  const iosNoStandalone = isIOS() && !isStandalonePWA();

  const handleToggle = async (next: boolean) => {
    if (next) {
      if (!supported) {
        toast({
          title: "الإشعارات غير مدعومة",
          description: "المتصفح لا يدعم إشعارات الويب على هذا الجهاز.",
        });
        return;
      }
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast({
          title: "لم يُمنح الإذن",
          description: "فعّل الإشعارات من إعدادات المتصفح ثم أعد المحاولة.",
        });
        return;
      }
      const nextSettings = { ...settings, enabled: true };
      update({ enabled: true });
      scheduleNextReminder(nextSettings);
      toast({ title: "تم تفعيل التذكيرات", description: "سيصلك تذكير في الوقت المحدد." });
    } else {
      update({ enabled: false });
      scheduleNextReminder({ ...settings, enabled: false });
    }
  };

  const handleTimeChange = (which: "morningTime" | "eveningTime", value: string) => {
    const patch = { [which]: value } as Partial<typeof settings>;
    update(patch);
    if (settings.enabled) {
      scheduleNextReminder({ ...settings, ...patch });
    }
  };

  const next = computeNextReminder(settings);
  const nextLabel = next
    ? new Date(next.when).toLocaleString("ar", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="إعدادات التذكيرات"
          title="تذكيرات الأذكار"
          className="relative w-9 h-9 rounded-full flex items-center justify-center bg-secondary/40 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 backdrop-blur-sm"
        >
          {settings.enabled && permission === "granted" ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
          {settings.enabled && permission === "granted" && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="glass-surface border-primary/20 max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-amiri text-xl text-center text-primary">
            تذكيرات الأذكار
          </DialogTitle>
          <DialogDescription className="font-naskh text-center text-muted-foreground/80 leading-relaxed">
            نُذكّرك بلطف بأذكار الصباح والمساء في الوقت الذي تختاره.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Master switch */}
          <div className="flex items-center justify-between gap-4 px-1">
            <Label htmlFor="reminders-enabled" className="font-naskh text-sm">
              تفعيل التذكيرات
            </Label>
            <Switch
              id="reminders-enabled"
              checked={settings.enabled && permission === "granted"}
              onCheckedChange={handleToggle}
              disabled={!supported}
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="morning-time" className="font-naskh text-xs text-muted-foreground">
                ☀️ الصباح
              </Label>
              <input
                id="morning-time"
                type="time"
                value={settings.morningTime}
                onChange={(e) => handleTimeChange("morningTime", e.target.value)}
                className="bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm font-naskh text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evening-time" className="font-naskh text-xs text-muted-foreground">
                🌙 المساء
              </Label>
              <input
                id="evening-time"
                type="time"
                value={settings.eveningTime}
                onChange={(e) => handleTimeChange("eveningTime", e.target.value)}
                className="bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm font-naskh text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {/* Next reminder */}
          {settings.enabled && permission === "granted" && nextLabel && (
            <div className="text-center font-naskh text-xs text-muted-foreground/70">
              التذكير القادم: <span className="text-primary/80">{nextLabel}</span>
            </div>
          )}

          {/* Test button */}
          {supported && permission === "granted" && (
            <button
              onClick={() => sendTestNotification()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-naskh hover:bg-primary/15 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              أرسل إشعارًا تجريبيًا
            </button>
          )}

          {/* Warnings */}
          <div className="flex flex-col gap-2 text-[11px] font-naskh text-muted-foreground/60 leading-relaxed">
            {!supported && (
              <p>· متصفحك لا يدعم إشعارات الويب.</p>
            )}
            {iosNoStandalone && supported && (
              <p>
                · على iPhone: لتفعيل الإشعارات، أضف الموقع إلى الشاشة الرئيسية ثم افتحه من الأيقونة.
              </p>
            )}
            <p>
              · التذكيرات محلية على جهازك. قد تتأخر إن كان المتصفح مغلقًا لفترة طويلة.
            </p>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
