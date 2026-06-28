// ============================================================
// QuizPage
// Duolingo-style quiz flow with 5 question types
// Design: Neo-Minimal Workspace
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { STAGES, ALL_SENTENCES } from "@/lib/courseData";
import {
  generateQuizSession,
  checkAnswer,
  QuizQuestion,
  CheckResult
} from "@/lib/quizEngine";
import { useProgress } from "@/hooks/useProgress";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, XCircle, Zap, Heart,
  ChevronRight, BookOpen, Trophy, RotateCcw, Home,
  Lightbulb, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";

type QuizState = 'question' | 'feedback' | 'complete' | 'failed';

const TOTAL_LIVES = 3;

export default function QuizPage() {
  const params = useParams<{ stageId: string }>();
  const [, navigate] = useLocation();
  const stageId = parseInt(params.stageId ?? "1");
  const stage = STAGES.find(s => s.id === stageId);
  const { recordCorrect, recordWrong, progress } = useProgress();

  const [questions] = useState<QuizQuestion[]>(() => {
    if (!stage) return [];
    return generateQuizSession(stage.sentences, 3);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('question');
  const [userAnswer, setUserAnswer] = useState('');
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

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
      setXpGained(prev => prev + 10);
      recordCorrect(stageId, currentQuestion.sentenceId);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      recordWrong(stageId, currentQuestion.sentenceId);
      if (newLives <= 0) {
        setTimeout(() => setQuizState('failed'), 1200);
        return;
      }
    }
  }, [userAnswer, currentQuestion, lives, stageId, recordCorrect, recordWrong]);

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

  if (!stage || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">퀴즈를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // ── Complete Screen ──
  if (quizState === 'complete') {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const sp = progress.stages[stageId];
    const stageCompleted = sp?.completed ?? false;

    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card rounded-3xl p-8 max-w-md w-full border border-border shadow-lg text-center"
        >
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? "🏆" : accuracy >= 60 ? "⭐" : "📚"}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {accuracy >= 80 ? "미션 완료!" : "학습 완료!"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {stage.title} · {stage.titleKR}
          </p>

          {stageCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 p-3 rounded-xl text-sm font-semibold"
              style={{ background: "oklch(0.82 0.22 130 / 15%)", color: "oklch(0.35 0.15 130)" }}
            >
              🎉 스테이지 완료! 다음 스테이지가 잠금 해제되었습니다.
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-6">
            <ScoreCard label="정확도" value={`${accuracy}%`} />
            <ScoreCard label="획득 XP" value={`+${xpGained}`} highlight />
            <ScoreCard label="정답 수" value={`${correctCount}/${totalQuestions}`} />
          </div>

          <div className="flex gap-3">
            <Link href={`/stage/${stageId}`} className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">
                <RotateCcw size={14} className="mr-1.5" />
                다시 학습
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full rounded-xl btn-press"
                style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}>
                <Home size={14} className="mr-1.5" />
                대시보드
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Failed Screen ──
  if (quizState === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card rounded-3xl p-8 max-w-md w-full border border-border shadow-lg text-center"
        >
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-foreground mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            다시 도전해보세요!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            목숨을 모두 잃었습니다. 학습 내용을 복습하고 다시 시도하세요.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <ScoreCard label="진행 문제" value={`${currentIndex}/${totalQuestions}`} />
            <ScoreCard label="정답 수" value={`${correctCount}`} />
          </div>

          <div className="flex gap-3">
            <Link href={`/stage/${stageId}`} className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">
                <BookOpen size={14} className="mr-1.5" />
                복습하기
              </Button>
            </Link>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setLives(TOTAL_LIVES);
                setScore(0);
                setCorrectCount(0);
                setXpGained(0);
                setQuizState('question');
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-sm btn-press"
              style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}
            >
              <RotateCcw size={14} />
              재도전
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* ── Quiz Header ── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href={`/stage/${stageId}`}>
            <button className="text-white/60 hover:text-white transition-colors btn-press">
              <ArrowLeft size={18} />
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

          {/* Lives */}
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
              <Heart
                key={i}
                size={16}
                className={i < lives ? "text-rose-400 fill-rose-400" : "text-white/20"}
              />
            ))}
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 text-xs font-bold"
            style={{ color: "oklch(0.82 0.22 130)" }}>
            <Zap size={12} />
            {xpGained}
          </div>
        </div>
      </header>

      {/* ── Quiz Body ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Question counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground font-medium">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <QuizTypeBadge type={currentQuestion.type} />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <QuestionCard
                question={currentQuestion}
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                quizState={quizState}
                lastResult={lastResult}
                showHint={showHint}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
              />
            </motion.div>
          </AnimatePresence>

          {/* Hint toggle */}
          {quizState === 'question' && currentQuestion.hint && (
            <button
              onClick={() => setShowHint(v => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb size={12} />
              {showHint ? "힌트 숨기기" : "힌트 보기"}
            </button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {quizState === 'feedback' && lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className={`mt-4 rounded-2xl border overflow-hidden ${
                  lastResult.correct
                    ? "border-[oklch(0.82_0.22_130/40%)] bg-[oklch(0.82_0.22_130/10%)]"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
                  {lastResult.correct
                    ? <CheckCircle2 size={18} className="text-[oklch(0.45_0.18_130)] flex-shrink-0" />
                    : <XCircle size={18} className="text-rose-500 flex-shrink-0" />
                  }
                  <p className={`text-sm font-bold ${
                    lastResult.correct ? "text-[oklch(0.35_0.15_130)]" : "text-rose-700"
                  }`}>
                    {lastResult.correct ? "정답!" : "오답"}
                  </p>
                  {lastResult.isKorean && !lastResult.correct && (
                    <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                      한국어 답변 감지됨
                    </span>
                  )}
                </div>

                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-foreground/70 leading-relaxed">{lastResult.feedback}</p>

                  {/* Expected English answer + Korean translation */}
                  {!lastResult.correct && lastResult.expectedEN && (
                    <div className="rounded-xl bg-white/70 border border-border p-3 space-y-2">
                      <p className="text-xs font-bold text-foreground">정답 영어 응답:</p>
                      <p className="text-xs text-foreground/90 leading-relaxed font-medium italic">
                        {lastResult.expectedEN}
                      </p>
                      {lastResult.expectedKR && (
                        <div className="border-t border-border/50 pt-2">
                          <p className="text-xs font-bold text-foreground/60 mb-1">한국어 해석:</p>
                          <p className="text-xs text-foreground/70 leading-relaxed">
                            {lastResult.expectedKR}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alt English for Korean answers */}
                  {lastResult.isKorean && lastResult.altEN && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-bold text-amber-700 mb-1.5">
                        💡 내 답변을 영어로 표현하면:
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {lastResult.altEN}
                      </p>
                    </div>
                  )}

                  {/* Correct answer: show sample for reference with bilingual */}
                  {lastResult.correct && lastResult.expectedEN && (currentQuestion.type === 'short-answer' || currentQuestion.type === 'kr-to-en') && (
                    <div className="rounded-xl bg-white/50 border border-[oklch(0.82_0.22_130/30%)] p-3 space-y-2">
                      <p className="text-xs font-bold text-[oklch(0.35_0.15_130)]">참고 답안 (영어):</p>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">{lastResult.expectedEN}</p>
                      {lastResult.expectedKR && (
                        <div className="border-t border-[oklch(0.82_0.22_130/20%)] pt-2">
                          <p className="text-xs font-bold text-[oklch(0.45_0.15_130)] mb-1">한국어 해석:</p>
                          <p className="text-xs text-foreground/70 leading-relaxed">{lastResult.expectedKR}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="mt-5">
            {quizState === 'question' ? (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full py-4 rounded-2xl font-bold text-base btn-press transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: userAnswer.trim() ? "oklch(0.82 0.22 130)" : "oklch(0.93 0.005 240)",
                  color: userAnswer.trim() ? "#1a2e00" : "oklch(0.55 0.012 240)",
                  boxShadow: userAnswer.trim() ? "0 6px 20px oklch(0.82 0.22 130 / 25%)" : "none",
                }}
              >
                확인하기
              </button>
            ) : quizState === 'feedback' ? (
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-base btn-press flex items-center justify-center gap-2"
                style={{
                  background: "oklch(0.82 0.22 130)",
                  color: "#1a2e00",
                  boxShadow: "0 6px 20px oklch(0.82 0.22 130 / 25%)"
                }}
              >
                {currentIndex + 1 >= totalQuestions ? "결과 보기" : "다음 문제"}
                <ChevronRight size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Question Card Component ──

function QuestionCard({
  question, userAnswer, setUserAnswer, quizState, lastResult,
  showHint, onSubmit, onKeyDown, inputRef
}: {
  question: QuizQuestion;
  userAnswer: string;
  setUserAnswer: (v: string) => void;
  quizState: QuizState;
  lastResult: CheckResult | null;
  showHint: boolean;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}) {
  const isAnswered = quizState === 'feedback';
  const sentence = ALL_SENTENCES.find(s => s.id === question.sentenceId);

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
      {/* Question type label */}
      <div className="mb-4">
        {question.type === 'fill-blank' && (
          <FillBlankQuestion
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnswered={isAnswered}
            lastResult={lastResult}
            showHint={showHint}
            onKeyDown={onKeyDown}
            inputRef={inputRef as React.MutableRefObject<HTMLInputElement>}
          />
        )}
        {question.type === 'multiple-choice' && (
          <MultipleChoiceQuestion
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnswered={isAnswered}
            lastResult={lastResult}
          />
        )}
        {question.type === 'short-answer' && (
          <ShortAnswerQuestion
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnswered={isAnswered}
            showHint={showHint}
            onKeyDown={onKeyDown}
            inputRef={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
          />
        )}
        {question.type === 'kr-to-en' && (
          <TranslationQuestion
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnswered={isAnswered}
            showHint={showHint}
            onKeyDown={onKeyDown}
            inputRef={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
            direction="kr-to-en"
          />
        )}
        {question.type === 'en-to-kr' && (
          <TranslationQuestion
            question={question}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isAnswered={isAnswered}
            showHint={showHint}
            onKeyDown={onKeyDown}
            inputRef={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
            direction="en-to-kr"
          />
        )}
      </div>

      {/* Hint */}
      {showHint && question.hint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 rounded-xl text-xs text-muted-foreground"
          style={{ background: "oklch(0.82 0.22 130 / 8%)" }}
        >
          <Lightbulb size={12} className="inline mr-1.5 text-[oklch(0.45_0.18_130)]" />
          {question.hint}
        </motion.div>
      )}
    </div>
  );
}

// ── Fill Blank ──
function FillBlankQuestion({ question, userAnswer, setUserAnswer, isAnswered, lastResult, showHint, onKeyDown, inputRef }: {
  question: QuizQuestion; userAnswer: string; setUserAnswer: (v: string) => void;
  isAnswered: boolean; lastResult: CheckResult | null; showHint: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.MutableRefObject<HTMLInputElement>;
}) {
  const parts = (question.displayText ?? '').split('___');
  const sentence = ALL_SENTENCES.find(s => s.id === question.sentenceId);

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">빈칸 채우기</p>
      {/* Student sentence bilingual display */}
      {sentence && (
        <div className="mb-4 p-3 rounded-xl border border-border bg-muted/60 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">학생 발언</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">"{sentence.studentEN}"</p>
          <p className="text-xs text-muted-foreground">({sentence.studentKR})</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">교수 응답에서 빈칸에 들어갈 디자인 용어를 입력하세요.</p>

      {/* Display text with blank */}
      <div className="p-4 rounded-xl bg-muted mb-4 text-sm leading-relaxed text-foreground">
        {parts[0]}
        <span className={`inline-block min-w-[80px] px-2 py-0.5 mx-1 rounded border-b-2 font-semibold text-center ${
          isAnswered
            ? lastResult?.correct
              ? "border-[oklch(0.82_0.22_130)] text-[oklch(0.35_0.15_130)] bg-[oklch(0.82_0.22_130/15%)]"
              : "border-rose-400 text-rose-600 bg-rose-50"
            : "border-foreground/30 text-muted-foreground"
        }`}>
          {isAnswered ? (lastResult?.correct ? userAnswer : question.blankedWord) : (userAnswer || '___')}
        </span>
        {parts[1]}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isAnswered}
        placeholder="빈칸에 들어갈 단어를 입력하세요..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.82_0.22_130/50%)] disabled:opacity-60 transition-all"
      />
    </div>
  );
}

// ── Multiple Choice ──
function MultipleChoiceQuestion({ question, userAnswer, setUserAnswer, isAnswered, lastResult }: {
  question: QuizQuestion; userAnswer: string; setUserAnswer: (v: string) => void;
  isAnswered: boolean; lastResult: CheckResult | null;
}) {
  const sentence = ALL_SENTENCES.find(s => s.id === question.sentenceId);
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">객관식</p>
      {/* Student sentence bilingual display */}
      {sentence && (
        <div className="mb-4 p-3 rounded-xl border border-border bg-muted/60 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">학생 발언</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">"{sentence.studentEN}"</p>
          <p className="text-xs text-muted-foreground">({sentence.studentKR})</p>
        </div>
      )}
      <p className="text-sm text-foreground leading-relaxed mb-5">교수가 사용해야 할 핵심 디자인 용어는?</p>

      <div className="grid grid-cols-1 gap-2">
        {question.options?.map((option, i) => {
          const isSelected = userAnswer === String(i);
          const isCorrect = i === question.correctIndex;
          let stateClass = "border-border bg-background hover:border-[oklch(0.82_0.22_130/50%)] hover:bg-[oklch(0.82_0.22_130/5%)]";

          if (isAnswered) {
            if (isCorrect) {
              stateClass = "border-[oklch(0.82_0.22_130)] bg-[oklch(0.82_0.22_130/12%)]";
            } else if (isSelected && !isCorrect) {
              stateClass = "border-rose-400 bg-rose-50";
            } else {
              stateClass = "border-border bg-background opacity-50";
            }
          } else if (isSelected) {
            stateClass = "border-[oklch(0.82_0.22_130)] bg-[oklch(0.82_0.22_130/10%)]";
          }

          return (
            <button
              key={i}
              onClick={() => !isAnswered && setUserAnswer(String(i))}
              disabled={isAnswered}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 btn-press ${stateClass}`}
            >
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                isAnswered && isCorrect
                  ? "bg-[oklch(0.82_0.22_130)] border-[oklch(0.82_0.22_130)] text-[#1a2e00]"
                  : isAnswered && isSelected && !isCorrect
                  ? "bg-rose-500 border-rose-500 text-white"
                  : isSelected
                  ? "bg-[oklch(0.82_0.22_130)] border-[oklch(0.82_0.22_130)] text-[#1a2e00]"
                  : "border-border text-muted-foreground"
              }`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="font-medium text-foreground">{option}</span>
              {isAnswered && isCorrect && <CheckCircle2 size={14} className="ml-auto text-[oklch(0.45_0.18_130)]" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={14} className="ml-auto text-rose-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Short Answer ──
function ShortAnswerQuestion({ question, userAnswer, setUserAnswer, isAnswered, showHint, onKeyDown, inputRef }: {
  question: QuizQuestion; userAnswer: string; setUserAnswer: (v: string) => void;
  isAnswered: boolean; showHint: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.MutableRefObject<HTMLTextAreaElement>;
}) {
  const sentence = ALL_SENTENCES.find(s => s.id === question.sentenceId);
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">주관식</p>
      {/* Student sentence bilingual display */}
      {sentence && (
        <div className="mb-4 p-3 rounded-xl border border-border bg-muted/60 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">학생 발언</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">"{sentence.studentEN}"</p>
          <p className="text-xs text-muted-foreground">({sentence.studentKR})</p>
        </div>
      )}
      <p className="text-sm text-foreground leading-relaxed mb-4 whitespace-pre-line">교수로서 영어로 어떻게 응답하겠습니까? (핵심 디자인 용어 포함 필수)</p>

      <textarea
        ref={inputRef}
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isAnswered}
        placeholder="영어로 교수 응답을 작성하세요... (핵심 디자인 용어 포함)"
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.82_0.22_130/50%)] disabled:opacity-60 transition-all resize-none leading-relaxed"
      />


    </div>
  );
}

// ── Translation ──
function TranslationQuestion({ question, userAnswer, setUserAnswer, isAnswered, showHint, onKeyDown, inputRef, direction }: {
  question: QuizQuestion; userAnswer: string; setUserAnswer: (v: string) => void;
  isAnswered: boolean; showHint: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.MutableRefObject<HTMLTextAreaElement>;
  direction: 'kr-to-en' | 'en-to-kr';
}) {
  const isKrToEn = direction === 'kr-to-en';

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {isKrToEn ? "🇰🇷 한국어 → 영어" : "🇺🇸 영어 → 한국어"}
      </p>
      <p className="text-sm text-muted-foreground mb-3">{question.prompt}</p>

      {/* Source text with bilingual companion */}
      <div className="p-4 rounded-xl border border-border bg-muted mb-4 space-y-2">
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {question.sourceText}
        </p>
        {question.sourceTextBilingual && (
          <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
            {question.sourceTextBilingual}
          </p>
        )}
      </div>

      <textarea
        ref={inputRef}
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isAnswered}
        placeholder={isKrToEn ? "영어로 번역하세요..." : "한국어로 번역하세요..."}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.82_0.22_130/50%)] disabled:opacity-60 transition-all resize-none leading-relaxed"
      />


    </div>
  );
}

// ── Helper Components ──

function QuizTypeBadge({ type }: { type: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    'fill-blank':      { label: '빈칸 채우기', color: 'bg-blue-100 text-blue-700' },
    'multiple-choice': { label: '객관식',      color: 'bg-purple-100 text-purple-700' },
    'short-answer':    { label: '주관식',      color: 'bg-orange-100 text-orange-700' },
    'kr-to-en':        { label: '한→영',       color: 'bg-teal-100 text-teal-700' },
    'en-to-kr':        { label: '영→한',       color: 'bg-pink-100 text-pink-700' },
  };
  const { label, color } = labels[type] ?? { label: type, color: 'bg-muted text-muted-foreground' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function ScoreCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? "bg-[oklch(0.82_0.22_130/15%)]" : "bg-muted"}`}>
      <div className={`text-xl font-bold ${highlight ? "text-[oklch(0.35_0.15_130)]" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}


