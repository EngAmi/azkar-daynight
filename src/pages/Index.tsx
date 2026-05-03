import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { getMorningAdhkar, getEveningAdhkar, AUDIO_BASE_URL, type SessionType, type Dhikr } from "@/data/adhkar";
import { BreathingCircle } from "@/components/BreathingCircle";
import { DhikrFadl } from "@/components/DhikrFadl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeControl } from "@/components/FontSizeControl";
import { SeoHead } from "@/components/SeoHead";
import { useTheme } from "@/hooks/useTheme";
import { useFontScale } from "@/hooks/useFontScale";
import { useAccessibility } from "@/hooks/useAccessibility";

interface SessionState {
  index: number;
  rep: number;
  completed: boolean;
}

const initialSession: SessionState = { index: 0, rep: 0, completed: false };

const STORAGE_KEY = "adhkar:lastSession:v1";

interface PersistedState {
  activeTab: SessionType;
  focusMode: boolean;
  morningState: SessionState;
  eveningState: SessionState;
}

function loadPersisted(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

interface IndexProps {
  /** Force a specific tab on mount — used by /azkar-sabah and /azkar-massa routes */
  initialTab?: SessionType;
  /** Visible H1 override for dedicated SEO routes */
  pageHeading?: string;
  /** Visible subtitle under H1 for dedicated SEO routes */
  pageSubheading?: string;
}

const Index = ({ initialTab, pageHeading, pageSubheading }: IndexProps = {}) => {
  const [isReady, setIsReady] = useState(false);
  const hour = new Date().getHours();
  const defaultType: SessionType = hour >= 15 ? "evening" : "morning";

  const persisted = useMemo(() => loadPersisted(), []);

  const [activeTab, setActiveTab] = useState<SessionType>(initialTab ?? persisted.activeTab ?? defaultType);
  const [focusMode, setFocusMode] = useState<boolean>(persisted.focusMode ?? false);
  const [morningState, setMorningState] = useState<SessionState>(persisted.morningState ?? initialSession);
  const [eveningState, setEveningState] = useState<SessionState>(persisted.eveningState ?? initialSession);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const enterFocus = (tab: SessionType) => {
    setActiveTab(tab);
    setFocusMode(true);
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMorningState(initialSession);
    setEveningState(initialSession);
    setFocusMode(false);
  };

  useEffect(() => {
    // شاشة تهدئة قصيرة قبل ظهور الأذكار — تمنح المستخدم لحظة سكون
    const timer = setTimeout(() => setIsReady(true), 850);
    return () => clearTimeout(timer);
  }, []);

  // Persist session state on changes
  useEffect(() => {
    try {
      const data: PersistedState = { activeTab, focusMode, morningState, eveningState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota / private mode errors
    }
  }, [activeTab, focusMode, morningState, eveningState]);

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-background overflow-hidden transition-colors duration-700">
      {/* canonical الجذر — يُعاد تطبيقه دائمًا عند العودة لهذه الصفحة لمنع تسرّب canonical من المسارات المخصّصة */}
      {!pageHeading && (
        <SeoHead
          title="أذكار الصباح والمساء — الذاكرين | تطبيق الأذكار اليومية بصوت القارئ"
          description="أذكار الصباح والمساء من القرآن والسنة الصحيحة، مع عدّاد التسبيح والاستماع بصوت القارئ. تطبيق الذاكرين: حصّن يومك بالذكر، بدون تشتيت."
          canonical="https://azkar-daynight.lovable.app/"
        />
      )}
      {/* Ambient golden glow — adapts gently to day / night */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary halo (top) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.16 : 0.06 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-[200px]"
          style={{
            background: isLight
              ? "radial-gradient(circle, hsl(var(--glow-gold) / 0.7) 0%, transparent 65%)"
              : "radial-gradient(circle, hsl(var(--primary) / 0.55) 0%, transparent 70%)",
          }}
        />
        {/* Soft warm wash (bottom) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.10 : 0.035 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          className="absolute -bottom-40 left-1/4 w-[520px] h-[520px] rounded-full blur-[180px]"
          style={{
            background: isLight
              ? "radial-gradient(circle, hsl(36 60% 72% / 0.6) 0%, transparent 70%)"
              : "radial-gradient(circle, hsl(var(--glow-soft) / 0.7) 0%, transparent 70%)",
          }}
        />
        {/* Subtle accent (side) */}
        <motion.div
          aria-hidden
          animate={{ opacity: isLight ? 0.07 : 0.025 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.4 }}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[380px] h-[380px] rounded-full blur-[160px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--glow-gold) / 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* شاشة تهدئة قصيرة قبل ظهور الأذكار */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="calming-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-background"
            aria-hidden="true"
          >
            {/* دائرة تتنفس بهدوء */}
            <motion.div
              className="relative w-28 h-28 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.95, 0.6] }}
              transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
            >
              <div className="absolute inset-3 rounded-full border border-primary/25" />
              <div className="absolute inset-7 rounded-full bg-primary/10" />
            </motion.div>

            {/* عناصر skeleton هادئة */}
            <div className="flex flex-col items-center gap-3 w-64">
              <div className="h-3 w-32 rounded-full bg-muted/40 animate-pulse" />
              <div className="h-2 w-48 rounded-full bg-muted/30 animate-pulse" />
              <div className="h-2 w-40 rounded-full bg-muted/20 animate-pulse" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-amiri text-primary/40 text-sm tracking-wide"
            >
              لحظة سكون…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* H1 — مرئي على الصفحات المخصّصة (الصباح/المساء)، ومخفي بصريًا على الجذر */}
              {pageHeading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.15 }}
                  className="flex flex-col items-center gap-1"
                >
                  <h1 className="font-amiri text-3xl sm:text-4xl text-foreground tracking-wide">
                    {pageHeading}
                  </h1>
                  {pageSubheading && (
                    <p className="font-naskh text-xs sm:text-sm text-muted-foreground/60 tracking-wide">
                      {pageSubheading}
                    </p>
                  )}
                  <p className="font-naskh text-[10px] text-muted-foreground/30 tracking-widest mt-1">
                    تطبيق الذاكرين
                  </p>
                </motion.div>
              ) : (
                <>
                  <h1 className="sr-only">
                    أذكار الصباح والمساء — تطبيق الذاكرين بصوت القارئ
                  </h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="flex flex-col items-center gap-0.5"
                    aria-hidden="true"
                  >
                    <p className="font-amiri text-3xl sm:text-4xl text-foreground tracking-wide">
                      الذاكرين
                    </p>
                    <p className="font-naskh text-[11px] text-muted-foreground/40 tracking-widest">
                      حصّن يومك بذكر الله
                    </p>
                  </motion.div>
                </>
              )}
            </header>

            {/* Header chrome — hidden in Focus Mode */}
            <AnimatePresence initial={false}>
              {!focusMode && (
                <motion.div
                  key="chrome"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="w-full overflow-hidden"
                >
                  {/* Top controls: font size + accessibility + theme */}
                  <div className="flex items-center justify-end gap-2 px-4 pt-1 w-full">
                    <FontSizeControl />
                    <AccessibilityToggle />
                    <ThemeToggle />
                  </div>

                  {/* Tab switcher */}
                  <nav
                    className="flex items-center justify-center gap-1 px-4 py-2 w-full"
                    aria-label="اختر نوع الأذكار"
                  >
                    <TabButton
                      active={activeTab === "morning"}
                      onClick={() => enterFocus("morning")}
                      icon="☀️"
                      label="الصباح"
                    />
                    <TabButton
                      active={activeTab === "evening"}
                      onClick={() => enterFocus("evening")}
                      icon="🌙"
                      label="المساء"
                    />
                  </nav>

                  {/* Quiet reset link */}
                  {(morningState.index > 0 || morningState.rep > 0 || morningState.completed ||
                    eveningState.index > 0 || eveningState.rep > 0 || eveningState.completed) && (
                    <div className="flex justify-center pb-1">
                      <button
                        onClick={resetProgress}
                        className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-[11px] font-naskh px-2 py-1"
                      >
                        نَسخ التقدم
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipeable session content */}
            <SwipeableContent
              activeTab={activeTab}
              onTabChange={setActiveTab}
              focusMode={focusMode}
              onExitFocus={() => setFocusMode(false)}
              onResetProgress={resetProgress}
              morningState={morningState}
              eveningState={eveningState}
              setMorningState={setMorningState}
              setEveningState={setEveningState}
            />

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
      aria-pressed={active}
      className={`relative flex items-center gap-1 px-3 py-1.5 sm:gap-1.5 sm:px-5 sm:py-2 rounded-full transition-all duration-300 font-naskh text-xs sm:text-sm whitespace-nowrap ${
        active
          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
          : "text-muted-foreground/40 hover:text-muted-foreground/60"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="text-[11px] sm:text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SwipeableContent({
  activeTab,
  onTabChange,
  focusMode,
  onExitFocus,
  onResetProgress,
  morningState,
  eveningState,
  setMorningState,
  setEveningState,
}: {
  activeTab: SessionType;
  onTabChange: (tab: SessionType) => void;
  focusMode: boolean;
  onExitFocus: () => void;
  onResetProgress: () => void;
  morningState: SessionState;
  eveningState: SessionState;
  setMorningState: React.Dispatch<React.SetStateAction<SessionState>>;
  setEveningState: React.Dispatch<React.SetStateAction<SessionState>>;
}) {
  const state = activeTab === "morning" ? morningState : eveningState;
  const setState = activeTab === "morning" ? setMorningState : setEveningState;

  return (
    <div className="flex-1 w-full overflow-hidden">
      <InlineSession
        type={activeTab}
        state={state}
        setState={setState}
        focusMode={focusMode}
        onExitFocus={onExitFocus}
        onResetProgress={onResetProgress}
        onTabChange={onTabChange}
      />
    </div>
  );
}

function InlineSession({
  type,
  state,
  setState,
  focusMode,
  onExitFocus,
  onResetProgress,
  onTabChange,
}: {
  type: SessionType;
  state: SessionState;
  setState: React.Dispatch<React.SetStateAction<SessionState>>;
  focusMode?: boolean;
  onExitFocus?: () => void;
  onResetProgress?: () => void;
  onTabChange?: (tab: SessionType) => void;
}) {
  const adhkarList = useMemo(
    () => (type === "morning" ? getMorningAdhkar() : getEveningAdhkar()),
    [type]
  );
  const { scale: fontScale } = useFontScale();

  const currentIndex = state.index;
  const currentRep = state.rep;
  const isCompleted = state.completed;
  const [showFadl, setShowFadl] = useState(false);
  const [direction, setDirection] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTabSwitchAt = useRef<number>(0);

  // Reset transient UI (fadl/direction) when switching tabs
  useEffect(() => {
    setShowFadl(false);
    setDirection(1);
  }, [type]);

  const currentDhikr: Dhikr | undefined = adhkarList[currentIndex];

  // Scroll to top when dhikr changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, type]);

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
      setState((s) => ({ ...s, rep: newRep }));
    }
  };

  const moveToNext = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setState((s) => ({ ...s, completed: true }));
    } else {
      setDirection(1);
      setState((s) => ({ ...s, index: s.index + 1, rep: 0 }));
    }
  };

  const handleSkip = () => {
    setShowFadl(false);
    if (currentIndex + 1 >= adhkarList.length) {
      setState((s) => ({ ...s, completed: true }));
    } else {
      setDirection(1);
      setState((s) => ({ ...s, index: s.index + 1, rep: 0 }));
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setShowFadl(false);
    setDirection(-1);
    setState((s) => ({ ...s, index: s.index - 1, rep: 0 }));
  };

  const canGoPrev = currentIndex > 0;

  const handleRestart = () => {
    setShowFadl(false);
    setState({ index: 0, rep: 0, completed: false });
  };

  // Keyboard shortcuts: Arrow keys for navigation between adhkar.
  // RTL-aware: ArrowRight goes to previous (visual right = earlier in RTL),
  //            ArrowLeft goes to next (visual left = later in RTL).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas/contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canGoPrev) handlePrev();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, adhkarList.length]);

  if (isCompleted) {
    return <InlineCompletion sessionType={type} onRestart={handleRestart} />;
  }

  if (!currentDhikr) return null;

  const isHighCount = currentDhikr.count >= 10;
  const progress = ((currentIndex) / adhkarList.length) * 100 + (currentRep / currentDhikr.count / adhkarList.length) * 100;
  const sessionLabel = type === "morning" ? "أذكار الصباح" : "أذكار المساء";

  // Two-tier swipe gesture (RTL-aware) with smarter classification:
  //  • Short/medium horizontal swipe → navigate adhkar (prev/next)
  //  • Long swipe (>= TAB_THRESHOLD) AND clear horizontal intent → switch morning/evening tab
  // Filtering rules to avoid accidental tab switches:
  //   - Must be predominantly horizontal (|dx| > |dy| * AXIS_RATIO)
  //   - Must exceed BOTH a distance AND velocity floor for tab switch
  //   - Tab switches are debounced (TAB_COOLDOWN_MS) to prevent rapid double-fires
  //   - Very slow drags (low velocity) never trigger tab switch even if long
  const handleSwipe = (_: unknown, info: PanInfo) => {
    const ADHKAR_THRESHOLD = 60;
    const ADHKAR_VELOCITY_MIN = 120; // ignore micro/accidental drags
    const TAB_THRESHOLD = 220;        // raised: avoid accidental tab switch
    const TAB_VELOCITY_MIN = 500;     // must be a deliberate flick
    const AXIS_RATIO = 1.6;           // horizontal must dominate vertical clearly
    const TAB_COOLDOWN_MS = 700;

    const dx = info.offset.x;
    const dy = info.offset.y;
    const vx = info.velocity.x;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const absVx = Math.abs(vx);

    // Reject mostly-vertical or diagonal-ish gestures (likely scroll intent)
    if (absDx < absDy * AXIS_RATIO) return;

    // Reject tiny/slow accidental drags entirely
    if (absDx < ADHKAR_THRESHOLD && absVx < ADHKAR_VELOCITY_MIN) return;

    // Tab switch requires BOTH long distance AND meaningful velocity
    const wantsTabSwitch =
      onTabChange &&
      absDx >= TAB_THRESHOLD &&
      absVx >= TAB_VELOCITY_MIN;

    if (wantsTabSwitch) {
      const now = Date.now();
      if (now - lastTabSwitchAt.current < TAB_COOLDOWN_MS) return; // debounce
      lastTabSwitchAt.current = now;
      // RTL: swipe right (positive) → previous tab (morning); left → evening
      onTabChange(dx > 0 ? "morning" : "evening");
      return;
    }

    if (absDx >= ADHKAR_THRESHOLD) {
      if (dx > 0) {
        if (canGoPrev) handlePrev();
      } else {
        handleSkip();
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full touch-pan-y"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleSwipe}
    >
      {/* Screen-reader live announcement of current dhikr position */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`الذكر ${currentIndex + 1} من ${adhkarList.length} — ${sessionLabel}`}
      </div>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pb-2 gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="الذكر السابق (سهم يمين)"
            title="السابق — سهم يمين"
            aria-keyshortcuts="ArrowRight"
            className="text-muted-foreground/30 hover:text-muted-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-naskh p-1"
          >
            → السابق
          </button>
          <button
            onClick={handleSkip}
            aria-label="الذكر التالي (سهم يسار)"
            title="التالي — سهم يسار"
            aria-keyshortcuts="ArrowLeft"
            className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-xs font-naskh p-1"
          >
            تخطي ←
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FocusFontControl />
          <AccessibilityToggle compact />
          {focusMode && onResetProgress && (
            <button
              onClick={onResetProgress}
              aria-label="نسخ التقدم"
              title="نَسخ التقدم"
              className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-[11px] font-naskh px-2 py-1 rounded-full border border-border/30"
            >
              نَسخ
            </button>
          )}
          {focusMode && onExitFocus && (
            <button
              onClick={onExitFocus}
              aria-label="خروج من وضع التركيز"
              className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors text-[11px] font-naskh px-2 py-1 rounded-full border border-border/30"
            >
              ⌃
            </button>
          )}
        </div>

        <span
          className="text-muted-foreground/30 text-[11px] font-naskh tabular-nums"
          aria-hidden="true"
        >
          {focusMode ? (
            <span className="tabular-nums">حاليًا</span>
          ) : (
            <>{currentIndex + 1} / {adhkarList.length}</>
          )}
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
        <motion.p
          key={type}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pt-2 text-center text-[11px] font-naskh text-muted-foreground/35"
        >
          {sessionLabel}
        </motion.p>
      </div>

      {/* Main content - scrollable */}
      <div ref={scrollRef} className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait" custom={direction}>
          {showFadl ? (
            <DhikrFadl key="fadl" fadl={currentDhikr.fadl} onContinue={moveToNext} />
          ) : (
            <motion.div
              key={type + "-" + currentDhikr.id + "-" + currentIndex}
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
                  className="dhikr-text text-xl sm:text-2xl leading-[2.4] text-balance transition-[font-size] duration-300"
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
    </motion.div>
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

// Accessibility toggle — enlarges Arabic typography & opens line spacing
function AccessibilityToggle({ compact = false }: { compact?: boolean }) {
  const { a11yMode, toggle } = useAccessibility();
  const size = compact ? "w-7 h-7 text-[13px]" : "w-9 h-9 text-base";

  return (
    <button
      onClick={toggle}
      aria-pressed={a11yMode}
      aria-label={a11yMode ? "إيقاف وضع إمكانية الوصول" : "تشغيل وضع إمكانية الوصول"}
      title={a11yMode ? "وضع إمكانية الوصول مُفعّل" : "وضع إمكانية الوصول"}
      className={`${size} rounded-full border flex items-center justify-center font-naskh transition-all duration-300 ${
        a11yMode
          ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)]"
          : "border-border/40 text-muted-foreground/50 hover:text-primary hover:border-primary/30"
      }`}
    >
      <span aria-hidden className="leading-none">ﺍ+</span>
    </button>
  );
}

// Inline, minimal font-size control for Focus Mode
function FocusFontControl() {
  const { scale, increase, decrease, reset, canIncrease, canDecrease } = useFontScale();
  const percent = Math.round(scale * 100);

  const withFeedback = (fn: () => void) => () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(10); } catch {}
    }
    fn();
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-border/30 bg-background/40 backdrop-blur-sm px-0.5 touch-manipulation"
      role="group"
      aria-label="ضبط حجم الخط"
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={withFeedback(decrease)}
        disabled={!canDecrease}
        aria-label="تصغير الخط"
        className="w-9 h-9 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-primary active:bg-primary/20 active:scale-90 active:text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 text-sm sm:text-xs font-naskh touch-manipulation"
      >
        ﺍ
      </button>
      <button
        type="button"
        onClick={withFeedback(reset)}
        aria-label={`الحجم الحالي ${percent}٪ — اضغط للإرجاع`}
        className="font-naskh text-[11px] sm:text-[10px] tabular-nums text-muted-foreground/40 hover:text-primary active:scale-90 active:text-primary transition-all duration-150 min-w-[32px] sm:min-w-[26px] text-center px-1 py-2 sm:py-0 touch-manipulation"
      >
        {percent}٪
      </button>
      <button
        type="button"
        onClick={withFeedback(increase)}
        disabled={!canIncrease}
        aria-label="تكبير الخط"
        className="w-9 h-9 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-primary active:bg-primary/20 active:scale-90 active:text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 text-lg sm:text-base font-naskh touch-manipulation"
      >
        ﺍ
      </button>
    </div>
  );
}
