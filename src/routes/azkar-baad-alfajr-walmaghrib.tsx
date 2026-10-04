import { createFileRoute } from "@tanstack/react-router";
import { FocusDhikrPage } from "@/components/FocusDhikrPage";
import { fajrMaghribAdhkar } from "@/data/extraAdhkar";
import { pageHead, breadcrumb, itemList } from "@/lib/seo";

const PATH = "/azkar-baad-alfajr-walmaghrib";
const TITLE = "أذكار بعد صلاة الفجر والمغرب — الذاكرين";
const DESC = "الأذكار الخاصة بعد صلاتي الفجر والمغرب من السنة الصحيحة: التهليل عشرًا، والمعوذات ثلاثًا، ودعاء العلم النافع — مع العدّاد والفضل والمصدر.";

export const Route = createFileRoute("/azkar-baad-alfajr-walmaghrib")({
  head: () =>
    pageHead({
      path: PATH,
      title: TITLE,
      description: DESC,
      jsonLd: [itemList("أذكار بعد الفجر والمغرب", PATH, fajrMaghribAdhkar), breadcrumb("أذكار بعد الفجر والمغرب", PATH)],
    }),
  component: () => (
    <FocusDhikrPage
      heading="أذكار بعد الفجر والمغرب"
      subheading="تُقال بعد أذكار الصلاة العامة — بهدوء وحضور قلب"
      listTitle="أذكار بعد الفجر والمغرب مكتوبة كاملة"
      intro="أذكار تختص بها صلاتا الفجر والمغرب، تُقال بعد أذكار الصلاة المعتادة، مع عدد التكرار والفضل والمصدر."
      items={fajrMaghribAdhkar}
    />
  ),
});
