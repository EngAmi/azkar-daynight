import Index from "./Index";
import { SeoHead } from "@/components/SeoHead";
import { AdhkarTextList, adhkarItemListJsonLd } from "@/components/AdhkarTextList";

const SITE = "https://azkar-daynight.lovable.app";

const AzkarMassa = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "أذكار المساء — الذاكرين",
      inLanguage: "ar",
      url: `${SITE}/azkar-massa`,
      description:
        "أذكار المساء الصحيحة من السنة النبوية مع عدّاد التكرار وصوت القارئ — تطبيق الذاكرين.",
    },
    adhkarItemListJsonLd("evening", `${SITE}/azkar-massa`),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ما وقت أذكار المساء؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "وقتها من بعد صلاة العصر إلى غروب الشمس، ومن فاته ذلك فله أن يقضيها إلى منتصف الليل.",
          },
        },
        {
          "@type": "Question",
          name: "هل أذكار المساء هنا صحيحة ومخرّجة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، الأذكار مأخوذة من القرآن الكريم والسنة النبوية الصحيحة، ومذكور مع كل ذكر عدد تكراره وفضله ومصدره من كتب الحديث.",
          },
        },
        {
          "@type": "Question",
          name: "هل يمكن الاستماع لأذكار المساء بصوت القارئ؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يمكنك الاستماع لكل ذكر بصوت قارئ هادئ داخل الجلسة، مع عدّاد تكرار يعمل بلمسة واحدة، وبدون إعلانات.",
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "أذكار المساء", item: SITE + "/azkar-massa" },
      ],
    },
  ];

  return (
    <>
      <SeoHead
        title="أذكار المساء مكتوبة كاملة بالتشكيل وبصوت القارئ — الذاكرين"
        description="أذكار المساء كاملة مكتوبة بالتشكيل من السنة الصحيحة، مع عدد التكرار والفضل والمصدر، واستماع بصوت قارئ هادئ وعدّاد تسبيح — بدون تشتيت ولا إعلانات."
        canonical={`${SITE}/azkar-massa`}
        jsonLd={jsonLd}
      />
      <Index
        initialTab="evening"
        pageHeading="أذكار المساء"
        pageSubheading="اختم يومك بذكر الله — مكتوبة ومسموعة بصوت القارئ"
      />
      <AdhkarTextList type="evening" />
    </>
  );
};

export default AzkarMassa;
