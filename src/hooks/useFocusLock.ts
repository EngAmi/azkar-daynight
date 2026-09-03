import { useEffect, useRef, useState } from "react";

/**
 * وضع التركيز المُقفل:
 *  • يقفل تمرير الصفحة (scroll lock) طوال الجلسة
 *  • يحصر تركيز لوحة المفاتيح (focus trap) داخل حاوية الجلسة
 *  • لا يخرج إلا بإجراء متعمّد (Escape مرتين خلال ثانيتين)
 *
 * لا يلمس الألوان ولا أحجام الخط، فيبقى وضع الوصول (a11y) وحجم الخط كما اختارهما المستخدم.
 */
export function useFocusLock(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onRequestExit: () => void
) {
  // يُستخدم لعرض تلميح «اضغط Esc مرة أخرى للخروج»
  const [exitHintVisible, setExitHintVisible] = useState(false);
  const lastEscAt = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // قفل التمرير
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const body = document.body;
    const root = document.documentElement;
    const prevBody = body.style.overflow;
    const prevRoot = root.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overflow = prevBody;
      root.style.overflow = prevRoot;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, [active]);

  // حصر التركيز + الخروج المتعمّد
  useEffect(() => {
    if (!active) {
      setExitHintVisible(false);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // انقل التركيز إلى الحاوية عند الدخول ليقرأها قارئ الشاشة
    container.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) {
          e.preventDefault();
          container.focus({ preventScroll: true });
          return;
        }
        const first = items[0]!;
        const last = items[items.length - 1]!;
        const current = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (current === first || current === container || !container.contains(current)) {
            e.preventDefault();
            last.focus();
          }
        } else if (current === last || !container.contains(current)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        const now = Date.now();
        if (now - lastEscAt.current < 2000) {
          lastEscAt.current = 0;
          setExitHintVisible(false);
          onRequestExit();
        } else {
          lastEscAt.current = now;
          setExitHintVisible(true);
          if (hintTimer.current) clearTimeout(hintTimer.current);
          hintTimer.current = setTimeout(() => setExitHintVisible(false), 2000);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, containerRef, onRequestExit]);

  return { exitHintVisible };
}
