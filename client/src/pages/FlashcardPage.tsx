// ============================================================
// FlashcardPage — Stage Step 1: Memorization
// Shows each sentence as a flip card:
//   Front: Korean student line + Korean professor response
//   Back:  English student line + English professor response
// User taps to flip, then marks "알겠어요" / "다시 볼게요"
// After all cards reviewed → proceed to Matching Game
// ============================================================

import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { STAGES } from "@/lib/courseData";
import { getStageSession, setStageSession } from "@/lib/stageSession";
import { SpeakButton } from "@/components/SpeakButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, RotateCcw, CheckCircle2,
  BookOpen, Zap, Eye, EyeOff, Home
} from "lucide-react";
import { Link } from "wouter";

export default function FlashcardPage() {
  const params = useParams<{ stageId: string }>();
  const stageId = parseInt(params.stageId ?? "1");
  const stage = STAGES.find(s => s.id === stageId);
  const [, navigate] = useLocation();

  const [currentIndex, setCurrentIndex] = useState(() => {
    const s = getStageSession(stageId);
    const total = stage?.sentences.length ?? 0;
    return s?.step === "flashcard" && s.index < total ? s.index : 0;
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [phase, setPhase] = useState<'study' | 'review' | 'done'>('study');

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">스테이지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Which sentences to show in current phase
  const sentences = phase === 'review'
    ? stage.sentences.filter(s => reviewIds.has(s.id))
    : stage.sentences;

  const currentSentence = sentences[currentIndex];
  const total = sentences.length;
  const progressPercent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  const handleFlip = () => setIsFlipped(f => !f);

  const handleKnown = useCallback(() => {
    if (!currentSentence) return;
    setKnownIds(prev => new Set(Array.from(prev).concat(currentSentence.id)));
    advance();
  }, [currentSentence, currentIndex, total]);

  const handleReview = useCallback(() => {
    if (!currentSentence) return;
    setReviewIds(prev => new Set(Array.from(prev).concat(currentSentence.id)));
    advance();
  }, [currentSentence, currentIndex, total]);

  const advance = () => {
    setIsFlipped(false);
    if (currentIndex + 1 >= total) {
      // End of current deck
      if (phase === 'study') {
        // Check if there are cards to review
        setTimeout(() => {
          const finalReviewIds = new Set(Array.from(reviewIds));
          if (finalReviewIds.size > 0) {
            setPhase('review');
            setCurrentIndex(0);
          } else {
            setPhase('done');
            // Step 1 done → next time resume at Step 2 (matching)
            setStageSession(stageId, 'match', 0);
          }
        }, 50);
      } else {
        setPhase('done');
        setStageSession(stageId, 'match', 0);
      }
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      // Persist resume position (only meaningful in the study deck)
      if (phase === 'study') setStageSession(stageId, 'flashcard', next);
    }
  };

  // ── Done Screen ──
  if (phase === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card rounded-3xl p-8 max-w-md w-full border border-border shadow-lg text-center"
        >
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            암기 완료!
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {stage.sentences.length}개 문장을 모두 학습했습니다.<br />
            이제 매칭 게임으로 실력을 확인해보세요.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{knownIds.size}</div>
              <div className="text-xs text-muted-foreground mt-0.5">✅ 알겠어요</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{reviewIds.size}</div>
              <div className="text-xs text-muted-foreground mt-0.5">🔄 복습함</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/stage/${stageId}/match`)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base btn-press"
              style={{
                background: "oklch(0.82 0.22 130)",
                color: "#1a2e00",
                boxShadow: "0 8px 24px oklch(0.82 0.22 130 / 30%)"
              }}
            >
              <Zap size={18} />
              매칭 게임으로 이동
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setKnownIds(new Set());
                setReviewIds(new Set());
                setPhase('study');
                setStageSession(stageId, 'flashcard', 0);
              }}
              className="w-full py-3 rounded-2xl font-medium text-sm border border-border bg-card text-foreground btn-press"
            >
              <RotateCcw size={14} className="inline mr-1.5" />
              처음부터 다시 암기
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-2xl font-medium text-sm text-muted-foreground btn-press flex items-center justify-center gap-1.5"
            >
              <Home size={14} />
              홈으로 돌아가기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentSentence) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href={`/stage/${stageId}`}>
            <button className="text-white/60 hover:text-white transition-colors btn-press" title="스테이지로">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <Link href="/">
            <button className="text-white/60 hover:text-white transition-colors btn-press" title="홈으로">
              <Home size={17} />
            </button>
          </Link>

          {/* Progress bar */}
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "oklch(0.82 0.22 130)" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          <span className="text-xs font-medium text-white/60">
            {currentIndex + 1} / {total}
          </span>

          {/* Phase badge */}
          <span className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: phase === 'review' ? "oklch(0.7 0.2 50 / 20%)" : "oklch(0.82 0.22 130 / 20%)",
              color: phase === 'review' ? "oklch(0.7 0.2 50)" : "oklch(0.82 0.22 130)"
            }}>
            {phase === 'review' ? '🔄 복습' : '📖 암기'}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Stage label */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Step 1 · 암기
              </span>
            </div>
            <button
              onClick={() => setShowAll(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? <EyeOff size={13} /> : <Eye size={13} />}
              {showAll ? "영어 숨기기" : "영어 미리보기"}
            </button>
          </div>

          {/* Flip Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${currentSentence.id}-${phase}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="mb-6"
            >
              {/* 3D Flip Container */}
              <div
                className="relative cursor-pointer"
                style={{ perspective: "1200px", minHeight: "320px" }}
                onClick={handleFlip}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "320px" }}
                >
                  {/* Front: Korean */}
                  <div
                    className="absolute inset-0 rounded-3xl border border-border bg-card shadow-md p-6 flex flex-col"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        🇰🇷 한국어
                      </span>
                      <span className="text-xs text-muted-foreground">탭하여 영어 보기 →</span>
                    </div>

                    {/* Student KR */}
                    <div className="mb-4 p-4 rounded-2xl"
                      style={{ background: "oklch(0.96 0.01 240)" }}>
                      <p className="text-xs font-bold text-muted-foreground mb-2">학생 발언</p>
                      <p className="text-base font-semibold text-foreground leading-relaxed">
                        "{currentSentence.studentKR}"
                      </p>
                    </div>

                    {/* Professor KR */}
                    <div className="flex-1 p-4 rounded-2xl"
                      style={{ background: "oklch(0.82 0.22 130 / 8%)", border: "1px solid oklch(0.82 0.22 130 / 20%)" }}>
                      <p className="text-xs font-bold mb-2" style={{ color: "oklch(0.45 0.18 130)" }}>
                        교수 응답
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {currentSentence.professorKR}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {currentSentence.keywords.slice(0, 4).map(kw => (
                        <span key={kw}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "oklch(0.10 0.01 240 / 8%)", color: "oklch(0.40 0.01 240)" }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Back: English */}
                  <div
                    className="absolute inset-0 rounded-3xl border shadow-md p-6 flex flex-col"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "oklch(0.10 0.01 240)",
                      borderColor: "oklch(1 0 0 / 10%)"
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: "oklch(0.82 0.22 130)" }}>
                        🇺🇸 English
                      </span>
                      <span className="text-xs text-white/30">탭하여 한국어 보기 ←</span>
                    </div>

                    {/* Student EN */}
                    <div className="mb-4 p-4 rounded-2xl"
                      style={{ background: "oklch(1 0 0 / 5%)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white/40">Student says</p>
                        <SpeakButton text={currentSentence.studentEN}
                          className="text-white/50 hover:text-white p-1" />
                      </div>
                      <p className="text-base font-semibold text-white leading-relaxed">
                        "{currentSentence.studentEN}"
                      </p>
                    </div>

                    {/* Professor EN */}
                    <div className="flex-1 p-4 rounded-2xl"
                      style={{ background: "oklch(0.82 0.22 130 / 12%)", border: "1px solid oklch(0.82 0.22 130 / 25%)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold" style={{ color: "oklch(0.82 0.22 130)" }}>
                          Professor responds
                        </p>
                        <SpeakButton text={currentSentence.professorEN}
                          className="text-[oklch(0.82_0.22_130)] hover:text-white p-1" />
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "oklch(0.9 0.01 240)" }}>
                        {currentSentence.professorEN}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {currentSentence.keywords.slice(0, 4).map(kw => (
                        <span key={kw}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "oklch(0.82 0.22 130 / 20%)", color: "oklch(0.82 0.22 130)" }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* showAll preview (before flip) */}
          {showAll && !isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl border border-border bg-card/60"
            >
              <p className="text-xs font-bold text-muted-foreground mb-2">영어 미리보기</p>
              <p className="text-sm font-medium text-foreground mb-1">"{currentSentence.studentEN}"</p>
              <p className="text-xs text-foreground/60 leading-relaxed">{currentSentence.professorEN}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReview}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm border border-border bg-card text-foreground btn-press transition-all hover:bg-muted"
            >
              <RotateCcw size={15} />
              다시 볼게요
            </button>
            <button
              onClick={handleKnown}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm btn-press transition-all"
              style={{
                background: "oklch(0.82 0.22 130)",
                color: "#1a2e00"
              }}
            >
              <CheckCircle2 size={15} />
              알겠어요!
            </button>
          </div>

          {/* Skip to matching */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(`/stage/${stageId}/match`)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              암기 건너뛰고 매칭 게임으로 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
