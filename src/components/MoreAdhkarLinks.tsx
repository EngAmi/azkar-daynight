import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "الصباح والمساء" },
  { to: "/azkar-baad-salah", label: "بعد الصلاة" },
  { to: "/azkar-baad-alfajr-walmaghrib", label: "بعد الفجر والمغرب" },
  { to: "/azkar-nawm", label: "النوم" },
] as const;

/** تبويبات صفحات الأذكار الأخرى — تظهر فقط في صفحاتها المستقلة، لا في الصباح والمساء. */
export function MoreAdhkarLinks() {
  return (
    <nav aria-label="أقسام الأذكار" className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border/40">
      <ul className="mx-auto flex max-w-2xl gap-1 overflow-x-auto list-none px-3 py-2 m-0">
        {LINKS.map((l) => (
          <li key={l.to} className="shrink-0">
            <Link
              to={l.to}
              activeOptions={{ exact: true }}
              className="inline-block rounded-full px-4 py-2 font-naskh text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "bg-secondary/50 !text-primary", "aria-current": "page" }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
