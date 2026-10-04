import { createFileRoute } from "@tanstack/react-router";
import { FocusDhikrPage } from "@/components/FocusDhikrPage";
import { afterPrayerAdhkar } from "@/data/extraAdhkar";
import { pageHead, breadcrumb, itemList } from "@/lib/seo";

const PATH = "/azkar-baad-salah";
const TITLE = "أذكار بعد الصلاة مكتوبة كاملة بالتشكيل — الذاكرين";
const DESC = "أذكار ما بعد الصلاة المفروضة من السنة الصحيحة: الاستغفار، التسبيح والتحميد والتكبير، آية الكرسي والمعوذات — ذكرًا ذكرًا مع العدّاد والفضل والمصدر.";

export const Route = createFileRoute("/azkar-baad-salah")({
  head: () =>
    pageHead({
      path: PATH,
      title: TITLE,
      description: DESC,
      jsonLd: [itemList("أذكار بعد الصلاة", PATH, afterPrayerAdhkar), breadcrumb("أذكار بعد الصلاة", PATH)],
    }),
  component: () => (
    <FocusDhikrPage
      heading="أذكار بعد الصلاة"
      subheading="بعد السلام من الصلاة المفروضة — ذكرًا ذكرًا بسكينة"
      listTitle="أذكار بعد الصلاة مكتوبة كاملة"
      intro="الأذكار المشروعة بعد السلام من كل صلاة مفروضة، من القرآن الكريم والسنة النبوية الصحيحة، مع عدد التكرار والفضل والمصدر."
      items={afterPrayerAdhkar}
    />
  ),
});
