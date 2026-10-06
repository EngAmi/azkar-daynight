import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { pageHead } from "@/lib/seo";
import { homeFaqJsonLd } from "@/lib/homeFaq";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "أذكار الصباح والمساء — الذاكرين | بصوت القارئ",
      description:
        "أذكار الصباح والمساء وأذكار بعد الصلاة والنوم من القرآن والسنة الصحيحة، مع عدّاد التسبيح والاستماع بصوت القارئ. تجربة هادئة بدون تشتيت ولا إعلانات.",
      jsonLd: [homeFaqJsonLd],
    }),
  component: Home,
});

function Home() {
  return (
    <>
      <Index />
    </>
  );
}
