import { getMorningAdhkar, getEveningAdhkar, type SessionType } from "@/data/adhkar";

interface Props {
  type: SessionType;
}

/**
 * قسم نصّي كامل للأذكار يظهر أسفل التجربة التفاعلية.
 * الهدف: محتوى مقروء ومفهرَس لمحركات البحث (النص موجود في الـ DOM
 * دون الحاجة لبدء الجلسة)، مع فائدة حقيقية للزائر الذي يريد القراءة فقط.
 */
export function AdhkarTextList({ type }: Props) {
  const list = type === "morning" ? getMorningAdhkar() : getEveningAdhkar();
  const title = type === "morning" ? "أذكار الصباح مكتوبة كاملة" : "أذكار المساء مكتوبة كاملة";
  const intro =
    type === "morning"
      ? "أذكار الصباح كاملة مكتوبة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة، مع عدد التكرار وفضل كل ذكر ومصدره. وقتها من بعد صلاة الفجر إلى طلوع الشمس، ويجوز قضاؤها إلى الزوال."
      : "أذكار المساء كاملة مكتوبة بالتشكيل من القرآن الكريم والسنة النبوية الصحيحة، مع عدد التكرار وفضل كل ذكر ومصدره. وقتها من بعد صلاة العصر إلى غروب الشمس، ويجوز قضاؤها إلى منتصف الليل.";

  return (
    <section
      aria-labelledby={`adhkar-text-${type}`}
      className="relative z-10 bg-background border-t border-border/40 px-5 py-14"
    >
      <div className="mx-auto w-full max-w-3xl">
        <h2
          id={`adhkar-text-${type}`}
          className="font-amiri text-2xl sm:text-3xl text-primary text-center mb-4"
        >
          {title}
        </h2>
        <p className="font-naskh text-sm sm:text-base text-muted-foreground leading-loose text-center mb-10">
          {intro}
        </p>

        <ol className="flex flex-col gap-8 list-none p-0 m-0">
          {list.map((d, i) => (
            <li
              key={d.id}
              className="rounded-2xl border border-border/40 bg-secondary/20 p-5 sm:p-6"
            >
              <h3 className="font-naskh text-xs text-primary/80 mb-3">
                {`الذكر ${i + 1} — ${d.countDescription}`}
              </h3>
              <p className="font-amiri text-lg sm:text-xl leading-[2.2] text-foreground whitespace-pre-line">
                {d.content}
              </p>
              {d.fadl && (
                <p className="font-naskh text-sm text-muted-foreground leading-loose mt-4">
                  <span className="text-primary/80">الفضل: </span>
                  {d.fadl}
                </p>
              )}
              {d.source && (
                <p className="font-naskh text-xs text-muted-foreground/70 mt-2">
                  المصدر: {d.source}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** بيانات منظّمة (ItemList) لنفس المحتوى النصّي. */
export function adhkarItemListJsonLd(type: SessionType, url: string) {
  const list = type === "morning" ? getMorningAdhkar() : getEveningAdhkar();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: type === "morning" ? "أذكار الصباح مكتوبة كاملة" : "أذكار المساء مكتوبة كاملة",
    inLanguage: "ar",
    url,
    numberOfItems: list.length,
    itemListElement: list.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.content.slice(0, 110),
      description: d.fadl || d.source,
    })),
  };
}
