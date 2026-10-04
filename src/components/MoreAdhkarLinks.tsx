import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/azkar-sabah", label: "أذكار الصباح" },
  { to: "/azkar-massa", label: "أذكار المساء" },
  { to: "/azkar-baad-salah", label: "أذكار بعد الصلاة" },
  { to: "/azkar-baad-alfajr-walmaghrib", label: "أذكار بعد الفجر والمغرب" },
  { to: "/azkar-nawm", label: "أذكار النوم" },
] as const;

/** روابط داخلية بين صفحات الأذكار — تساعد الزائر ومحركات البحث على اكتشاف كل الصفحات. */
export function MoreAdhkarLinks() {
  return (
    <nav aria-label="صفحات الأذكار" className="relative z-10 bg-background border-t border-border/40 px-5 py-10">
      <h2 className="font-amiri text-xl text-primary text-center mb-5">أذكار أخرى</h2>
      <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 list-none p-0">
        {LINKS.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-block rounded-full border border-primary/30 bg-secondary/30 px-4 py-2 font-naskh text-sm text-foreground hover:border-primary/60 transition-colors"
              activeProps={{ className: "!border-primary text-primary" }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
