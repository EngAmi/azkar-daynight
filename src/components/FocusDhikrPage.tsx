import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";
import type { SimpleDhikr } from "@/data/extraAdhkar";
import { MoreAdhkarLinks } from "./MoreAdhkarLinks";

interface Props {
  heading: string;
  subheading: string;
  intro: string;
  listTitle: string;
  items: SimpleDhikr[];
}

/** تجربة هادئة: ذكر واحد في كل مرة، عدّاد بلمسة، ثم النص الكامل مكتوبًا للقراءة والفهرسة. */
export function FocusDhikrPage({ heading, subheading, intro, listTitle, items }: Props) {
  const [index, setIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const d = (items[index] ?? items[0]) as SimpleDhikr;
  const done = index === items.length - 1 && reps >= d.count;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(items.length - 1, Math.max(0, i + delta)));
      setReps(0);
    },
    [items.length],
  );

  const tap = () => {
    if (reps + 1 >= d.count) {
      setReps(d.count);
      try { navigator.vibrate?.(10); } catch { /* ignore */ }
      if (index < items.length - 1) setTimeout(() => go(1), 450);
    } else {
      setReps((r) => r + 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(1);
      else if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const remaining = Math.max(0, d.count - reps);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col px-5 pt-6 pb-8">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="font-naskh text-sm text-muted-foreground hover:text-primary">
            ← الذاكرين
          </Link>
          <span className="font-naskh text-xs text-muted-foreground" aria-hidden>
            {index + 1} / {items.length}
          </span>
        </header>

        <h1 className="font-amiri text-3xl sm:text-4xl text-primary text-center">{heading}</h1>
        <p className="font-naskh text-sm text-muted-foreground text-center mt-2 mb-6">{subheading}</p>

        <div className="h-1 w-full rounded-full bg-secondary/40 mb-6" aria-hidden>
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((index + (reps >= d.count ? 1 : 0)) / items.length) * 100}%` }}
          />
        </div>

        <p className="sr-only" aria-live="polite">
          {`الذكر ${index + 1} من ${items.length}. ${remaining === 0 ? "اكتمل" : `المتبقي ${remaining}`}`}
        </p>

        <button
          type="button"
          onClick={tap}
          aria-label={`اضغط للعدّ — المتبقي ${remaining} من ${d.count}`}
          className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-primary/20 bg-secondary/20 p-6 sm:p-8 text-center transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="font-amiri text-[clamp(1.15rem,4.2vw,1.75rem)] leading-[2.1] whitespace-pre-line">
            {d.content}
          </span>
          {d.fadl && (
            <span className="mt-5 font-naskh text-xs sm:text-sm text-muted-foreground leading-loose">{d.fadl}</span>
          )}
          <span className="mt-2 font-naskh text-[11px] text-muted-foreground/70">{d.source}</span>
        </button>

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="الذكر السابق"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="font-amiri text-3xl text-primary tabular-nums">{remaining}</div>
            <div className="font-naskh text-[11px] text-muted-foreground">{d.countDescription}</div>
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === items.length - 1}
            aria-label="الذكر التالي"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {done && (
          <div className="mt-6 text-center">
            <p className="font-amiri text-lg text-primary">تقبّل الله منك</p>
            <button
              type="button"
              onClick={() => { setIndex(0); setReps(0); }}
              className="mt-2 inline-flex items-center gap-2 font-naskh text-sm text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="h-4 w-4" /> من البداية
            </button>
          </div>
        )}
      </main>

      <section aria-labelledby="full-list" className="border-t border-border/40 px-5 py-14">
        <div className="mx-auto w-full max-w-3xl">
          <h2 id="full-list" className="font-amiri text-2xl sm:text-3xl text-primary text-center mb-4">{listTitle}</h2>
          <p className="font-naskh text-sm sm:text-base text-muted-foreground leading-loose text-center mb-10">{intro}</p>
          <ol className="flex flex-col gap-8 list-none p-0 m-0">
            {items.map((x, i) => (
              <li key={x.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-5 sm:p-6">
                <h3 className="font-naskh text-xs text-primary/80 mb-3">{`الذكر ${i + 1} — ${x.countDescription}`}</h3>
                <p className="font-amiri text-lg sm:text-xl leading-[2.2] whitespace-pre-line">{x.content}</p>
                {x.fadl && (
                  <p className="font-naskh text-sm text-muted-foreground leading-loose mt-4">
                    <span className="text-primary/80">الفضل: </span>{x.fadl}
                  </p>
                )}
                <p className="font-naskh text-xs text-muted-foreground/70 mt-2">المصدر: {x.source}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <MoreAdhkarLinks />
    </div>
  );
}
