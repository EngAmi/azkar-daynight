import type { SessionType } from "@/data/adhkar";

/**
 * يحدّد فترة الصباح/المساء بناءً على المنطقة الزمنية المحلية للمستخدم.
 * - يستخدم Intl.DateTimeFormat للحصول على الساعة في الـ timezone المرصودة فعليًا
 *   على الجهاز، بدل الاعتماد على `Date#getHours` الذي قد يختلف سلوكه على بعض البيئات.
 * - النافذة: من 3 صباحًا حتى 2:59 مساءً = صباح. غير ذلك = مساء.
 *   (تشمل ساعات الفجر المبكرة ضمن "الصباح" وتُعامل ما بعد منتصف الليل كمساء.)
 */
export function getCurrentSessionType(now: Date = new Date()): SessionType {
  let hour: number;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);
    const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";
    // Intl may return "24" for midnight in some engines; normalise to 0-23.
    hour = parseInt(hourPart, 10) % 24;
    if (Number.isNaN(hour)) hour = now.getHours();
  } catch {
    hour = now.getHours();
  }

  return hour >= 3 && hour < 15 ? "morning" : "evening";
}
