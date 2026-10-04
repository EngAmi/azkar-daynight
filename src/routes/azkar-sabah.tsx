import { createFileRoute } from "@tanstack/react-router";
import AzkarSabah, { sabahJsonLd } from "@/pages/AzkarSabah";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/azkar-sabah")({
  head: () =>
    pageHead({
      path: "/azkar-sabah",
      title: "أذكار الصباح مكتوبة كاملة بالتشكيل وبصوت القارئ — الذاكرين",
      description:
        "أذكار الصباح كاملة مكتوبة بالتشكيل من السنة الصحيحة، مع عدد التكرار والفضل والمصدر، واستماع بصوت قارئ هادئ وعدّاد تسبيح — بدون تشتيت ولا إعلانات.",
      jsonLd: sabahJsonLd,
    }),
  component: AzkarSabah,
});
