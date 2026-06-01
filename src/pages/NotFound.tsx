import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SeoHead } from "@/components/SeoHead";

const SITE = "https://azkar-daynight.lovable.app";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SeoHead
        title="الصفحة غير موجودة — الذاكرين"
        description="الصفحة التي تبحث عنها غير متوفرة. عُد إلى الرئيسية لقراءة أذكار الصباح والمساء."
        canonical={`${SITE}/`}
      />
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">الصفحة غير موجودة</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            العودة إلى الرئيسية
          </a>
        </div>
      </main>
    </>
  );
};

export default NotFound;
