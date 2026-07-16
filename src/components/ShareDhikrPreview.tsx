import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Download } from "lucide-react";
import {
  generateDhikrImage,
  shareDhikrAsImage,
  DEFAULT_SIGNATURE,
  DEFAULT_SIGNATURE_URL,
  type ShareDhikrInput,
} from "@/lib/shareDhikrImage";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  defaultSource?: string;
  sessionType?: "morning" | "evening";
}

/**
 * معاينة بطاقة الذكر قبل مشاركتها/تنزيلها،
 * مع إمكانية تعديل المصدر والتوقيع بصورة سريعة.
 */
export function ShareDhikrPreview({
  open,
  onOpenChange,
  content,
  defaultSource,
  sessionType,
}: Props) {
  const [source, setSource] = useState(defaultSource ?? "");
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE);
  const [signatureUrl, setSignatureUrl] = useState(DEFAULT_SIGNATURE_URL);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const currentBlobRef = useRef<Blob | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // إعادة تعيين المصدر عند فتح الحوار على ذكر جديد
  useEffect(() => {
    if (open) {
      setSource(defaultSource ?? "");
    }
  }, [open, defaultSource]);

  // إعادة توليد الصورة عندما تتغيّر المدخلات (مع debounce صغير)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsRendering(true);
      try {
        const input: ShareDhikrInput = {
          content,
          source,
          sessionType,
          signature,
          signatureUrl,
        };
        const blob = await generateDhikrImage(input);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        // نظّف الرابط السابق
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
        currentBlobRef.current = blob;
        currentUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        if (!cancelled) {
          toast({
            title: "تعذّر توليد المعاينة",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, content, source, sessionType, signature, signatureUrl]);

  // تنظيف عند إغلاق الحوار
  useEffect(() => {
    if (!open && currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
      currentBlobRef.current = null;
      setPreviewUrl(null);
    }
  }, [open]);

  const handleShare = async (forceDownload = false) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const blob = currentBlobRef.current;
      const input: ShareDhikrInput & { blob?: Blob } = {
        content,
        source,
        sessionType,
        signature,
        signatureUrl,
        ...(blob ? { blob } : {}),
      };

      if (forceDownload) {
        const b = blob ?? (await generateDhikrImage(input));
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dhikr-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast({ title: "تم حفظ الصورة" });
      } else {
        const result = await shareDhikrAsImage(input);
        if (result === "downloaded") {
          toast({
            title: "تم حفظ الصورة",
            description: "يمكنك مشاركتها من مجلد التنزيلات.",
          });
        }
      }
      onOpenChange(false);
    } catch {
      toast({ title: "تعذّرت المشاركة", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-naskh">مشاركة الذكر كصورة</DialogTitle>
          <DialogDescription className="font-naskh text-xs">
            عاين البطاقة وعدّل المصدر أو التوقيع قبل المشاركة أو التنزيل.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* المعاينة */}
          <div className="relative mx-auto w-full max-w-[240px] aspect-[9/16] rounded-lg overflow-hidden bg-black/40 border border-border/50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="معاينة بطاقة الذكر"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {isRendering && previewUrl && (
              <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                <Loader2 className="w-3 h-3 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* التحرير */}
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="dhikr-source" className="font-naskh text-xs">
                المصدر
              </Label>
              <Input
                id="dhikr-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="اختياري — مثال: رواه البخاري"
                className="font-naskh text-sm"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="dhikr-sig" className="font-naskh text-xs">
                  التوقيع
                </Label>
                <Input
                  id="dhikr-sig"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="font-naskh text-sm"
                  dir="rtl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="dhikr-sig-url" className="text-xs">
                  الرابط/الحساب
                </Label>
                <Input
                  id="dhikr-sig-url"
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                  className="text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleShare(true)}
            disabled={isSharing || !previewUrl}
            className="font-naskh"
          >
            <Download className="w-4 h-4 ml-1" aria-hidden="true" />
            تنزيل
          </Button>
          <Button
            onClick={() => handleShare(false)}
            disabled={isSharing || !previewUrl}
            className="font-naskh"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="w-4 h-4 ml-1" aria-hidden="true" />
            )}
            مشاركة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
