import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { getMorningAdhkar, getEveningAdhkar, AUDIO_BASE_URL, type SessionType, type Dhikr } from "@/data/adhkar";
import { BreathingCircle } from "@/components/BreathingCircle";
import { DhikrFadl } from "@/components/DhikrFadl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const [isReady, setIsReady] = useState(false);
  const hour = new Date().getHours();
  const defaultType: SessionType = hour >= 15 ? "evening" : "morning";
  const [activeTab, setActiveTab] = useState<SessionType>(defaultType);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-background overflow-hidden transition-colors duration-700">
      {/* Ambient golden glow — adapts gently to day / night */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary halo (top) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.18 : 0.09 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-[180px]"
          style={{
            background: isLight
              ? "radial-gradient(circle, hsl(var(--glow-gold) / 0.9) 0%, transparent 65%)"
              : "radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, transparent 70%)",
          }}
        />
        {/* Soft warm wash (bottom) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.12 : 0.05 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          className="absolute -bottom-40 left-1/4 w-[520px] h-[520px] rounded-full blur-[160px]"
          style={{
            background: isLight
              ? "radial-gradient(circle, hsl(38 80% 70% / 0.8) 0%, transparent 70%)"
              : "radial-gradient(circle, hsl(var(--glow-soft) / 0.9) 0%, transparent 70%)",
          }}
        />
        {/* Subtle accent (side) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.08 : 0.04 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.4 }}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--glow-gold) / 0.6) 0%, transparent 70%)",
          }}
        />
      </div>

      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center w-full flex-1"
          >
            {/* Header */}
            <header className="text-center pt-8 pb-1 px-6 safe-area-top">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex flex-col items-center gap-0.5"
              >
                <h1 className="font-amiri text-3xl sm:text-4xl text-foreground tracking-wide">
                  الذاكرين
                </h1>
                <p className="font-naskh text-[11px] text-muted-foreground/40 tracking-widest">
                  حصّن يومك بذكر الله
                </p>
              </motion.div>
            </header>

            {/* Tab switcher with theme toggle */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center gap-2 px-6 py-2 w-full"
              aria-label="اختر نوع الأذكار"
            >
              <div className="flex items-center gap-1">
                <TabButton
                  active={activeTab === "morning"}
                  onClick={() => setActiveTab("morning")}
                  icon="☀️"
                  label="الصباح"
                />
                <TabButton
                  active={activeTab === "evening"}
                  onClick={() => setActiveTab("evening")}
                  icon="🌙"
                  label="المساء"
                />
              </div>
              <div className="absolute end-4">
                <ThemeToggle />
              </div>
            </motion.nav>

            {/* Swipeable session content */}
            <SwipeableContent activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Footer */}
            <footer className="px-6 pb-4 safe-area-bottom text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
                className="font-amiri text-primary/25 text-sm leading-relaxed"
              >
                ﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2.5 }}
                className="font-naskh text-[10px] text-muted-foreground/20 mt-1.5"
              >
                الأصوات من{" "}
                <a
                  href="https://alazkar.today/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-muted-foreground/40 transition-colors"
                >
                  أذكار اليوم
                </a>
              </motion.p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full transition-all duration-300 font-naskh text-sm ${
        active
          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
          : "text-muted-foreground/40 hover:text-muted-foreground/60"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SwipeableContent({
  activeTab,
  onTabChange,
}: {
  activeTab: SessionType;
  onTabChange: (tab: SessionType) => void;
}) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      onTabChange("morning");
    } else if (info.offset.x < -threshold) {
      onTabChange("evening");
    }
  };

  return (
    <div className="flex-1 w-full overflow-hidden">
      <motion.div
        key={activeTab}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: activeTab === "morning" ? -30 : 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="h-full touch-pan-y"
      >
        <InlineSession type={activeTab} />
      </motion.div>
    </div>
  );
}

function InlineSession({ type }: { type: SessionType }) {
  const adhkarList = useMemo(
    () => (type === "morning" ? getMorningAdhkar() : getEveningAdhkar()),
    [type]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFadl, setShowFadl] = useState(false);
  const [direction, setDirection] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentDhikr: Dhikr | undefined = adhkarList[currentIndex];

  // Scroll to top when dhikr changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  const handleRepComplete = () => {
    if (!currentDhikr) return;
    const newRep = currentRep + 1;
    if (newRep >= currentDhikr.count) {
      if (currentDhikr.fadl) {
        setShowFadl(true);
      } else {
        moveToNext();
      }
    } else {
      setCurrentRep(newRep);
    }
  };

  const moveToNext = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  };

  const handleSkip = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setIsCompleted(true);
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setCurrentRep(0);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCurrentRep(0);
    setIsCompleted(false);
    setShowFadl(false);
  };

  if (isCompleted) {
    return <InlineCompletion sessionType={type} onRestart={handleRestart} />;
  }

  if (!currentDhikr) return null;

  const isHighCount = currentDhikr.count >= 10;
  const progress = ((currentIndex) / adhkarList.length) * 100 + (currentRep / currentDhikr.count / adhkarList.length) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pb-2">
        <button
          onClick={handleSkip}
          className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-xs font-naskh p-1"
        >
          تخطي ←
        </button>
        <span className="text-muted-foreground/30 text-[11px] font-naskh tabular-nums">
          {currentIndex + 1} / {adhkarList.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="w-full h-[2px] bg-border/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary/40 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main content - scrollable */}
      <div ref={scrollRef} className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait" custom={direction}>
          {showFadl ? (
            <DhikrFadl key="fadl" fadl={currentDhikr.fadl} onContinue={moveToNext} />
          ) : (
            <motion.div
              key={currentDhikr.id + "-" + currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-lg flex flex-col items-center gap-5"
            >
              {/* Dhikr text */}
              <div className="w-full text-center relative">
                <p
                  className="dhikr-text text-xl sm:text-2xl leading-[2.4] text-balance"
                  style={{
                    fontSize:
                      currentDhikr.content.length > 200
                        ? "1rem"
                        : currentDhikr.content.length > 100
                          ? "1.2rem"
                          : "1.4rem",
                  }}
                >
                  {currentDhikr.content}
                </p>
                <SpeakButton audioFile={currentDhikr.audio} />
              </div>

              {/* Count description badge */}
              {currentDhikr.count > 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] font-naskh text-muted-foreground/30 bg-muted/30 px-3 py-1 rounded-full"
                >
                  {currentDhikr.countDescription}
                </motion.span>
              )}

              {/* Breathing circle */}
              <div className="flex-shrink-0 pb-2">
                <BreathingCircle
                  onComplete={handleRepComplete}
                  size={isHighCount ? 120 : 140}
                  currentRep={currentRep}
                  totalReps={currentDhikr.count}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Source */}
      <div className="px-6 pb-2">
        <p className="text-center text-[10px] text-muted-foreground/25 font-naskh leading-relaxed truncate">
          📖 {currentDhikr.source}
        </p>
      </div>
    </div>
  );
}

function InlineCompletion({
  sessionType,
  onRestart,
}: {
  sessionType: SessionType;
  onRestart: () => void;
}) {
  const [showContent, setShowContent] = useState(false);
  const isMorning = sessionType === "morning";

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.12, scale: 1.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-64 h-64 rounded-full bg-primary blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="relative text-center flex flex-col items-center gap-8 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring", damping: 12 }}
          className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5"
        >
          <motion.svg
            width="32" height="32" viewBox="0 0 24 24" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="hsl(var(--primary))"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
          </motion.svg>
        </motion.div>

        <div className="space-y-4">
          <h2 className="font-amiri text-2xl text-foreground">
            {isMorning ? "أتممت أذكار الصباح" : "أتممت أذكار المساء"}
          </h2>
          <p className="font-naskh text-sm text-muted-foreground/50">
            جعلها الله في ميزان حسناتك
          </p>

          {showContent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="font-amiri text-lg text-primary/70 leading-relaxed"
            >
              ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
            </motion.p>
          )}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          onClick={onRestart}
          className="mt-6 px-6 py-2.5 rounded-full border border-primary/20 text-primary/70 hover:bg-primary/10 text-sm font-naskh transition-all duration-300"
        >
          إعادة الأذكار
        </motion.button>
      </motion.div>
    </div>
  );
}

function SpeakButton({ audioFile }: { audioFile?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioFile]);

  if (!audioFile) return null;

  const handlePlay = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(`${AUDIO_BASE_URL}${audioFile}`);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  return (
    <motion.button
      onClick={handlePlay}
      whileTap={{ scale: 0.9 }}
      className={`mt-3 mx-auto flex items-center gap-1.5 transition-colors duration-300 p-2 rounded-full ${
        isPlaying
          ? "text-primary/80 bg-primary/10"
          : "text-muted-foreground/35 hover:text-primary/60"
      }`}
      aria-label={isPlaying ? "إيقاف" : "استماع"}
    >
      {isPlaying ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
      <span className="font-naskh text-[11px]">{isPlaying ? "إيقاف" : "استماع"}</span>
    </motion.button>
  );
}

export default Index;
