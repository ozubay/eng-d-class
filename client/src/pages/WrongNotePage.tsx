// ============================================================
// WrongNotePage
// 오답 노트 - 틀린 문장만 모아 집중 복습
// Design: Neo-Minimal Workspace
// Flow: 암기(Flashcard) → 퀴즈(Quiz)
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ALL_SENTENCES, STAGES } from "@/lib/courseData";
import { generateQuizSession, checkAnswer, QuizQuestion, CheckResult } from "@/lib/quizEngine";
import { useProgress } from "@/hooks/useProgress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Home, BookOpen, Zap, ChevronRight,
  CheckCircle2, XCircle, RotateCcw, Trash2, Trophy,
  AlertTriangle, Heart, Lightbulb, Target
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Phase = 'overview' | 'flashcard' | 'quiz' | 'complete';
type QuizState = 'question' | 'feedback' | 'complete' | 'failed';

const TOTAL_LIVES = 3;

export default function WrongNotePage() {
  const [, navigate] = useLocation();
  const { progress, getWrongSentences, clearWrongSentences, recordCorrect, recordWrong } = useProgress();

  const wrongEntries = getWrongSentences();
  const wrongSentences = wrongEntries
    .map(e => ALL_SENTENCES.find(s => s.id === e.sentenceId))
    .filter(Boolean) as typeof ALL_SENTENCES;

  const totalWrong = (progress.wrongSentenceIds ?? []).length;
  const totalMastered = (progress.masteredWrongIds ?? []).length;

  const [phase, setPhase] = useState<Phase>('overview');

  if (phase === 'flashcard') {
    return <WrongFlashcard sentences={wrongSentences} onComplete={() => setPhase('quiz')} onBack={() => setPhase('overview')} />;
  }
  if (phase === 'quiz') {
    return <WrongQuiz sentences={wrongSentences} onComplete={() => setPhase('complete')} onBack={() => setPhase('overview')} />;
  }
  if (phase === 'complete') {
    return <WrongComplete onReset={() => { clearWrongSentences(); navigate('/'); }} onRetry={() => setPhase('overview')} />;
  }

  // ── Overview ──
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}>
        <Link href="/">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10">
            <ArrowLeft size={18} className="text-white/70" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            오답 노트
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "oklch(0.65 0.22 25)", color: "white" }}>
            집중 복습
          </span>
        </div>
        <div className="flex-1" />
        <Link href="/">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <Home size={16} className="text-white/50" />
          </button>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {wrongSentences.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="mt-16 text-center"
          >
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              오답이 없습니다!
            </h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              아직 틀린 문제가 없거나 모든 오답 문장을 완벽히 숙달했습니다.<br />
              퀴즈를 풀면 틀린 문장이 자동으로 여기에 모입니다.
            </p>
            <Link href="/">
              <button className="px-6 py-3 rounded-2xl font-bold text-sm transition-all btn-press"
                style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}>
                대시보드로 돌아가기
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                오답 노트
              </h1>
              <p className="text-sm text-muted-foreground mb-5">
                틀렸던 문장을 집중적으로 복습해 완전히 정복하세요.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                  icon={<AlertTriangle size={16} className="text-rose-500" />}
                  label="복습 필요"
                  value={String(wrongSentences.length)}
                  color="rose"
                />
                <StatCard
                  icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                  label="정복 완료"
                  value={String(totalMastered)}
                  color="emerald"
                />
                <StatCard
                  icon={<Target size={16} className="text-blue-500" />}
                  label="전체 오답"
                  value={String(totalWrong)}
                  color="blue"
                />
              </div>

              {/* Progress bar */}
              {totalWrong > 0 && (
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">오답 정복률</span>
                    <span className="text-xs text-muted-foreground">
                      {totalMastered} / {totalWrong} 완료
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "oklch(0.65 0.22 25)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((totalMastered / totalWrong) * 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Wrong sentence list */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="mb-6"
            >
              <h2 className="text-sm font-bold text-foreground mb-3">복습 대상 문장 ({wrongSentences.length}개)</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {wrongSentences.map((sentence, i) => (
                  <motion.div
                    key={sentence.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03, duration: 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "oklch(0.65 0.22 25 / 12%)" }}>
                      <span className="text-[10px] font-bold" style={{ color: "oklch(0.55 0.22 25)" }}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-relaxed truncate">
                        "{sentence.studentEN}"
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        ({sentence.studentKR})
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
              className="space-y-3"
            >
              {/* Start review flow */}
              <button
                onClick={() => setPhase('flashcard')}
                className="w-full py-4 rounded-2xl font-bold text-base btn-press transition-all"
                style={{ background: "oklch(0.65 0.22 25)", color: "white", boxShadow: "0 6px 20px oklch(0.65 0.22 25 / 25%)" }}
              >
                <BookOpen size={18} className="inline mr-2 mb-0.5" />
                암기부터 시작하기
              </button>

              <button
                onClick={() => setPhase('quiz')}
                className="w-full py-4 rounded-2xl font-bold text-base btn-press transition-all border border-border bg-card hover:bg-muted"
              >
                <Zap size={18} className="inline mr-2 mb-0.5" />
                바로 퀴즈 풀기
              </button>

              {/* Clear button */}
              <button
                onClick={() => {
                  if (window.confirm('오답 노트를 초기화하시겠습니까? 모든 오답 기록이 삭제됩니다.')) {
                    clearWrongSentences();
                    toast.success('오답 노트가 초기화되었습니다.');
                  }
                }}
                className="w-full py-3 rounded-2xl text-sm text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-all border border-dashed border-border"
              >
                <Trash2 size={14} className="inline mr-1.5 mb-0.5" />
                오답 노트 초기화
              </button>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    rose: "bg-rose-50 border-rose-200",
    emerald: "bg-emerald-50 border-emerald-200",
    blue: "bg-blue-50 border-blue-200",
  };
  return (
    <div className={`p-3 rounded-2xl border text-center ${colorMap[color] ?? colorMap.blue}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

// ── Wrong Flashcard ──
function WrongFlashcard({ sentences, onComplete, onBack }: {
  sentences: typeof ALL_SENTENCES;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'study' | 'review' | 'done'>('study');

  const studyList = phase === 'study' ? sentences : sentences.filter(s => reviewIds.has(s.id));
  const current = studyList[currentIndex];
  const total = studyList.length;

  const handleKnown = () => {
    setKnownIds(prev => new Set(Array.from(prev).concat(current.id)));
    if (currentIndex + 1 >= total) {
      if (phase === 'study' && reviewIds.size > 0) {
        setPhase('review');
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setPhase('done');
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleReview = () => {
    setReviewIds(prev => new Set(Array.from(prev).concat(current.id)));
    if (currentIndex + 1 >= total) {
      if (phase === 'study' && reviewIds.size > 0) {
        setPhase('review');
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setPhase('done');
      }
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  if (phase === 'done' || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-8 max-w-sm w-full border border-border shadow-lg text-center"
        >
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            암기 단계 완료!
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {knownIds.size}개 문장을 암기했습니다. 이제 퀴즈로 확인해보세요.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-2xl font-bold text-sm btn-press"
            style={{ background: "oklch(0.65 0.22 25)", color: "white" }}
          >
            퀴즈 시작하기 →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.968 0.003 240)" }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <span className="text-sm font-bold text-white">오답 노트 — 암기</span>
        <div className="flex-1" />
        <span className="text-xs text-white/50">{currentIndex + 1} / {total}</span>
      </header>

      {/* Progress */}
      <div className="h-1" style={{ background: "oklch(0.18 0.01 240)" }}>
        <motion.div
          className="h-full"
          style={{ background: "oklch(0.65 0.22 25)" }}
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <main className="max-w-lg mx-auto p-6 flex flex-col items-center">
        {phase === 'review' && (
          <div className="mb-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "oklch(0.65 0.22 25 / 12%)", color: "oklch(0.55 0.22 25)" }}>
            복습 라운드 — {reviewIds.size}개 재학습 중
          </div>
        )}

        {/* Flip card */}
        <div className="w-full mb-6" style={{ perspective: '1000px' }}>
          <motion.div
            className="relative w-full cursor-pointer"
            style={{ transformStyle: 'preserve-3d', minHeight: '240px' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setIsFlipped(f => !f)}
          >
            {/* Front: Korean */}
            <div className="absolute inset-0 rounded-3xl bg-card border border-border shadow-md p-6 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">학생 발언 (한국어)</div>
              <p className="text-lg font-bold text-foreground text-center leading-relaxed mb-3">
                "{current.studentKR}"
              </p>
              <div className="mt-4 text-xs text-muted-foreground">탭하여 뒤집기 →</div>
            </div>

            {/* Back: English + professor response */}
            <div className="absolute inset-0 rounded-3xl border shadow-md p-6 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: "oklch(0.10 0.01 240)" }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "oklch(0.65 0.22 25)" }}>
                학생 발언 (영어)
              </div>
              <p className="text-base font-bold text-white text-center leading-relaxed mb-4">
                "{current.studentEN}"
              </p>
              <div className="w-full border-t border-white/10 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "oklch(0.82 0.22 130)" }}>
                  교수 응답
                </div>
                <p className="text-xs text-white/80 leading-relaxed text-center">
                  {current.professorEN}
                </p>
                <p className="text-[10px] text-white/40 leading-relaxed text-center mt-1">
                  ({current.professorKR})
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={handleReview}
            className="py-3 rounded-2xl font-semibold text-sm border border-border bg-card hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all btn-press"
          >
            <RotateCcw size={14} className="inline mr-1.5 mb-0.5" />
            다시 볼게요
          </button>
          <button
            onClick={handleKnown}
            className="py-3 rounded-2xl font-semibold text-sm btn-press transition-all"
            style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}
          >
            <CheckCircle2 size={14} className="inline mr-1.5 mb-0.5" />
            알겠어요!
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Wrong Quiz ──
function WrongQuiz({ sentences, onComplete, onBack }: {
  sentences: typeof ALL_SENTENCES;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { recordCorrect, recordWrong } = useProgress();
  const [questions] = useState<QuizQuestion[]>(() => generateQuizSession(sentences, 2));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('question');
  const [userAnswer, setUserAnswer] = useState('');
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    if (quizState === 'question') {
      setUserAnswer('');
      setShowHint(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, quizState]);

  const handleSubmit = useCallback(() => {
    if (!userAnswer.trim() || !currentQuestion) return;
    const result = checkAnswer(currentQuestion, userAnswer);
    setLastResult(result);
    setQuizState('feedback');
    if (result.correct) {
      setScore(prev => prev + result.score);
      setCorrectCount(prev => prev + 1);
      // Find stageId for this sentence
      const sentence = ALL_SENTENCES.find(s => s.id === currentQuestion.sentenceId);
      if (sentence) {
        const stage = STAGES.find(st => st.sentences.some(s => s.id === sentence.id));
        if (stage) recordCorrect(stage.id, sentence.id);
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      const sentence = ALL_SENTENCES.find(s => s.id === currentQuestion.sentenceId);
      if (sentence) {
        const stage = STAGES.find(st => st.sentences.some(s => s.id === sentence.id));
        if (stage) recordWrong(stage.id, sentence.id);
      }
      if (newLives <= 0) {
        setTimeout(() => setQuizState('failed'), 1200);
        return;
      }
    }
  }, [userAnswer, currentQuestion, lives, recordCorrect, recordWrong]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setQuizState('complete');
    } else {
      setCurrentIndex(prev => prev + 1);
      setQuizState('question');
    }
  }, [currentIndex, totalQuestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (quizState === 'question') handleSubmit();
      else if (quizState === 'feedback') handleNext();
    }
  };

  if (quizState === 'complete' || quizState === 'failed') {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-8 max-w-sm w-full border border-border shadow-lg text-center"
        >
          <div className="text-5xl mb-4">
            {quizState === 'failed' ? "💪" : accuracy >= 80 ? "🏆" : "📚"}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {quizState === 'failed' ? "다시 도전해보세요!" : accuracy >= 80 ? "오답 정복!" : "계속 연습하세요"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            정확도 {accuracy}% · {correctCount}/{totalQuestions} 정답
          </p>
          <div className="space-y-3">
            <button onClick={onComplete}
              className="w-full py-3 rounded-2xl font-bold text-sm btn-press"
              style={{ background: "oklch(0.65 0.22 25)", color: "white" }}>
              완료
            </button>
            <button onClick={() => { setCurrentIndex(0); setLives(TOTAL_LIVES); setScore(0); setCorrectCount(0); setQuizState('question'); }}
              className="w-full py-3 rounded-2xl font-bold text-sm border border-border bg-card hover:bg-muted transition-all btn-press">
              다시 풀기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const sentence = ALL_SENTENCES.find(s => s.id === currentQuestion.sentenceId);
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.01 240)" }}>
          <motion.div className="h-full rounded-full" style={{ background: "oklch(0.65 0.22 25)" }}
            animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-xs text-white/50 w-16 text-right">{currentIndex + 1}/{totalQuestions}</span>
        {/* Lives */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
            <Heart key={i} size={14} className={i < lives ? "text-rose-400 fill-rose-400" : "text-white/20"} />
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto p-6">
        {/* Question type badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "oklch(0.65 0.22 25 / 12%)", color: "oklch(0.55 0.22 25)" }}>
            오답 복습 퀴즈
          </span>
          <button onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors">
            <Lightbulb size={12} />
            힌트
          </button>
        </div>

        {/* Question card */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm mb-4">
          {/* Student sentence bilingual */}
          {sentence && (
            <div className="mb-4 p-3 rounded-xl border border-border bg-muted/60 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">학생 발언</p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">"{sentence.studentEN}"</p>
              <p className="text-xs text-muted-foreground">({sentence.studentKR})</p>
            </div>
          )}

          {/* Hint */}
          <AnimatePresence>
            {showHint && currentQuestion.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50"
              >
                <p className="text-xs text-amber-700">{currentQuestion.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simple short-answer for wrong note quiz */}
          <p className="text-sm font-semibold text-foreground mb-3">
            교수로서 영어로 어떻게 응답하겠습니까? (핵심 디자인 용어 포함 필수)
          </p>
          <textarea
            ref={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={quizState === 'feedback'}
            placeholder="영어로 교수 응답을 작성하세요..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.22_25/50%)] disabled:opacity-60 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {quizState === 'feedback' && lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={`rounded-2xl border overflow-hidden mb-4 ${lastResult.correct ? "border-[oklch(0.82_0.22_130/40%)] bg-[oklch(0.82_0.22_130/8%)]" : "border-rose-200 bg-rose-50"}`}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-current/10">
                {lastResult.correct
                  ? <CheckCircle2 size={16} className="text-[oklch(0.45_0.22_130)]" />
                  : <XCircle size={16} className="text-rose-500" />}
                <span className={`text-sm font-bold ${lastResult.correct ? "text-[oklch(0.35_0.15_130)]" : "text-rose-600"}`}>
                  {lastResult.correct ? "정답" : "오답"}
                </span>
              </div>
              <div className="px-4 pb-4 pt-3 space-y-3">
                <p className="text-xs text-foreground/70 leading-relaxed">{lastResult.feedback}</p>
                {!lastResult.correct && lastResult.expectedEN && (
                  <div className="rounded-xl bg-white/70 border border-border p-3 space-y-2">
                    <p className="text-xs font-bold text-foreground">정답 영어 응답:</p>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium italic">{lastResult.expectedEN}</p>
                    {lastResult.expectedKR && (
                      <div className="border-t border-border/50 pt-2">
                        <p className="text-xs font-bold text-foreground/60 mb-1">한국어 해석:</p>
                        <p className="text-xs text-foreground/70 leading-relaxed">{lastResult.expectedKR}</p>
                      </div>
                    )}
                  </div>
                )}
                {lastResult.isKorean && lastResult.altEN && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-700 mb-1">💡 내 답변을 영어로 표현하면:</p>
                    <p className="text-xs text-amber-800 leading-relaxed italic">{lastResult.altEN}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit / Next button */}
        <div>
          {quizState === 'question' ? (
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full py-4 rounded-2xl font-bold text-base btn-press transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: userAnswer.trim() ? "oklch(0.65 0.22 25)" : "oklch(0.93 0.005 240)",
                color: userAnswer.trim() ? "white" : "oklch(0.55 0.012 240)",
                boxShadow: userAnswer.trim() ? "0 6px 20px oklch(0.65 0.22 25 / 25%)" : "none",
              }}
            >
              확인하기
            </button>
          ) : quizState === 'feedback' ? (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-base btn-press transition-all"
              style={{ background: "oklch(0.65 0.22 25)", color: "white" }}
            >
              다음 문제 <ChevronRight size={18} className="inline mb-0.5" />
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
}

// ── Complete Screen ──
function WrongComplete({ onReset, onRetry }: { onReset: () => void; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.968 0.003 240)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl p-8 max-w-sm w-full border border-border shadow-lg text-center"
      >
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          오답 복습 완료!
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          틀렸던 문장들을 집중 복습했습니다. 계속 반복하면 완전히 정복할 수 있습니다.
        </p>
        <div className="space-y-3">
          <button onClick={onReset}
            className="w-full py-3 rounded-2xl font-bold text-sm btn-press"
            style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}>
            <Home size={14} className="inline mr-1.5 mb-0.5" />
            대시보드로 돌아가기
          </button>
          <button onClick={onRetry}
            className="w-full py-3 rounded-2xl font-bold text-sm border border-border bg-card hover:bg-muted transition-all btn-press">
            <RotateCcw size={14} className="inline mr-1.5 mb-0.5" />
            다시 복습하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
