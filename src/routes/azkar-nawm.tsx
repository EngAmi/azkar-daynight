import { createFileRoute } from "@tanstack/react-router";
import { FocusDhikrPage } from "@/components/FocusDhikrPage";
import { sleepAdhkar } from "@/data/extraAdhkar";
import { pageHead, breadcrumb, itemList } from "@/lib/seo";

const PATH = "/azkar-nawm";
const TITLE = "أذكار النوم مكتوبة كاملة بالتشكيل — الذاكرين";
const DESC = "أذكار النوم من السنة الصحيحة: آية الكرسي، خواتيم البقرة، المعوذات، ودعاء باسمك ربي وضعت جنبي — ذكرًا واحدًا في كل مرة بهدوء قبل النوم.";

export const Route = createFileRoute("/azkar-nawm")({
  head: () =>
    pageHead({
      path: PATH,
      title: TITLE,
      description: DESC,
      jsonLd: [itemList("أذكار النوم", PATH, sleepAdhkar), breadcrumb("أذكار النوم", PATH)],
    }),
  component: () => (
    <FocusDhikrPage
      heading="أذكار النوم"
      subheading="اختم ليلتك بذكر الله — ذكر واحد في كل مرة"
      listTitle="أذكار النوم مكتوبة كاملة"
      intro="أذكار النوم الثابتة عن النبي ﷺ من القرآن الكريم والسنة الصحيحة، مع عدد التكرار والفضل والمصدر. تُقال عند الاضطجاع على الفراش."
      items={sleepAdhkar}
    />
  ),
});
