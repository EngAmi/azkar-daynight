import { createFileRoute } from "@tanstack/react-router";
import AzkarMassa, { massaJsonLd } from "@/pages/AzkarMassa";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/azkar-massa")({
  head: () =>
    pageHead({
      path: "/azkar-massa",
      title: "أذكار المساء مكتوبة كاملة بالتشكيل وبصوت القارئ — الذاكرين",
      description:
        "أذكار المساء كاملة مكتوبة بالتشكيل من السنة الصحيحة، مع عدد التكرار والفضل والمصدر، واستماع بصوت قارئ هادئ وعدّاد تسبيح — بدون تشتيت ولا إعلانات.",
      jsonLd: massaJsonLd,
    }),
  component: AzkarMassa,
});
