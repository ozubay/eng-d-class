// ============================================================
// MatchingPage — Stage Step 2: Matching Game
// Shows 5 pairs at a time (student KR ↔ student EN, or professor KR ↔ EN)
// User taps a left card then a right card to match
// Timer counts up; bonus score for fast completion
// After all pairs matched → proceed to Quiz
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { STAGES, Sentence } from "@/lib/courseData";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Timer, Zap, CheckCircle2, XCircle, Trophy
} from "lucide-react";
import { Link } from "wouter";

type CardSide = 'left' | 'right';
type MatchMode = 'student' | 'professor';

interface Card {
  id: string;
  sentenceId: number;
  text: string;       // truncated display text
  fullText: string;   // original full text (shown on hover/expand)
  side: CardSide;
  lang: 'kr' | 'en';
  matched: boolean;
  selected: boolean;
  wrong: boolean;
}

// ── Text truncation helpers ──
// For professor mode: extract first sentence only (up to first period)
function truncateProfessorText(text: string, maxChars = 80): string {
  // Try to get the first sentence
  const firstPeriod = text.search(/\.(?:\s|$)/);
  const firstSentence = firstPeriod > 0 ? text.slice(0, firstPeriod + 1) : text;
  // If still too long, truncate at word boundary
  if (firstSentence.length <= maxChars) return firstSentence;
  const truncated = firstSentence.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

function truncateStudentText(text: string, maxChars = 60): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '…';
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BATCH_SIZE = 5;

export default function MatchingPage() {
  const params = useParams<{ stageId: string }>();
  const stageId = parseInt(params.stageId ?? "1");
  const stage = STAGES.find(s => s.id === stageId);
  const [, navigate] = useLocation();

  const [batchIndex, setBatchIndex] = useState(0);
  const [matchMode, setMatchMode] = useState<MatchMode>('student');
  const [leftCards, setLeftCards] = useState<Card[]>([]);
  const [rightCards, setRightCards] = useState<Card[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongPairs, setWrongPairs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'batch-done' | 'all-done'>('playing');
  const [totalTime, setTotalTime] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">스테이지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const totalBatches = Math.ceil(stage.sentences.length / BATCH_SIZE);
  const allBatchesDone = batchIndex >= totalBatches;

  // Build cards for current batch
  const buildBatch = useCallback((bIdx: number, mode: MatchMode) => {
    const start = bIdx * BATCH_SIZE;
    const batch = stage.sentences.slice(start, start + BATCH_SIZE);

    const left: Card[] = batch.map(s => ({
      id: `L-${s.id}`,
      sentenceId: s.id,
      text: mode === 'student'
        ? truncateStudentText(s.studentKR)
        : truncateProfessorText(s.professorKR),
      fullText: mode === 'student' ? s.studentKR : s.professorKR,
      side: 'left',
      lang: 'kr',
      matched: false,
      selected: false,
      wrong: false,
    }));

    const right: Card[] = shuffleArray(batch.map(s => ({
      id: `R-${s.id}`,
      sentenceId: s.id,
      text: mode === 'student'
        ? truncateStudentText(s.studentEN)
        : truncateProfessorText(s.professorEN),
      fullText: mode === 'student' ? s.studentEN : s.professorEN,
      side: 'right',
      lang: 'en',
      matched: false,
      selected: false,
      wrong: false,
    })));

    setLeftCards(left);
    setRightCards(right);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedCount(0);
    setWrongPairs(0);
    setElapsed(0);
    setPhase('playing');
  }, [stage]);

  // Init
  useEffect(() => {
    buildBatch(0, 'student');
  }, []);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const currentBatchSize = Math.min(BATCH_SIZE, stage.sentences.length - batchIndex * BATCH_SIZE);

  // Handle card selection
  const handleLeftClick = (cardId: string) => {
    if (phase !== 'playing') return;
    const card = leftCards.find(c => c.id === cardId);
    if (!card || card.matched) return;
    setSelectedLeft(cardId);
    setLeftCards(prev => prev.map(c => ({ ...c, selected: c.id === cardId, wrong: false })));
  };

  const handleRightClick = (cardId: string) => {
    if (phase !== 'playing') return;
    const card = rightCards.find(c => c.id === cardId);
    if (!card || card.matched) return;

    if (!selectedLeft) {
      setSelectedRight(cardId);
      setRightCards(prev => prev.map(c => ({ ...c, selected: c.id === cardId, wrong: false })));
      return;
    }

    // Check match
    const leftCard = leftCards.find(c => c.id === selectedLeft);
    const rightCard = rightCards.find(c => c.id === cardId);

    if (leftCard && rightCard && leftCard.sentenceId === rightCard.sentenceId) {
      // Correct!
      setLeftCards(prev => prev.map(c =>
        c.id === selectedLeft ? { ...c, matched: true, selected: false, wrong: false } : { ...c, selected: false }
      ));
      setRightCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, matched: true, selected: false, wrong: false } : { ...c, selected: false }
      ));
      setSelectedLeft(null);
      setSelectedRight(null);

      const newMatchedCount = matchedCount + 1;
      setMatchedCount(newMatchedCount);

      if (newMatchedCount >= currentBatchSize) {
        // Batch complete
        setTimeout(() => setPhase('batch-done'), 400);
      }
    } else {
      // Wrong!
      setLeftCards(prev => prev.map(c =>
        c.id === selectedLeft ? { ...c, wrong: true, selected: false } : c
      ));
      setRightCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, wrong: true, selected: false } : c
      ));
      setWrongPairs(w => w + 1);

      setTimeout(() => {
        setLeftCards(prev => prev.map(c => ({ ...c, wrong: false, selected: false })));
        setRightCards(prev => prev.map(c => ({ ...c, wrong: false, selected: false })));
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleNextBatch = () => {
    const nextBatch = batchIndex + 1;
    const nextMode: MatchMode = matchMode === 'student' ? 'professor' : 'student';

    setTotalTime(t => t + elapsed);
    setTotalWrong(w => w + wrongPairs);

    if (matchMode === 'student') {
      // Same batch, now match professor lines
      setMatchMode('professor');
      buildBatch(batchIndex, 'professor');
    } else {
      // Move to next batch, reset to student mode
      if (nextBatch >= totalBatches) {
        setPhase('all-done');
        setTotalTime(t => t + elapsed);
        setTotalWrong(w => w + wrongPairs);
      } else {
        setBatchIndex(nextBatch);
        setMatchMode('student');
        buildBatch(nextBatch, 'student');
      }
    }
  };

  const getScore = () => {
    const timeBonus = Math.max(0, 300 - totalTime);
    const wrongPenalty = totalWrong * 10;
    return Math.max(0, timeBonus - wrongPenalty + 100);
  };

  // ── All Done Screen ──
  if (phase === 'all-done') {
    const score = getScore();
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.968 0.003 240)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card rounded-3xl p-8 max-w-md w-full border border-border shadow-lg text-center"
        >
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            매칭 완료!
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            모든 문장 쌍을 성공적으로 연결했습니다.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{formatTime(totalTime)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">소요 시간</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{totalWrong}</div>
              <div className="text-xs text-muted-foreground mt-0.5">오답 횟수</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold" style={{ color: "oklch(0.45 0.18 130)" }}>{score}</div>
              <div className="text-xs text-muted-foreground mt-0.5">점수</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/stage/${stageId}/quiz`)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base btn-press"
              style={{
                background: "oklch(0.82 0.22 130)",
                color: "#1a2e00",
                boxShadow: "0 8px 24px oklch(0.82 0.22 130 / 30%)"
              }}
            >
              <Zap size={18} />
              퀴즈 시작하기
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => {
                setBatchIndex(0);
                setMatchMode('student');
                setTotalTime(0);
                setTotalWrong(0);
                buildBatch(0, 'student');
              }}
              className="w-full py-3 rounded-2xl font-medium text-sm border border-border bg-card text-foreground btn-press"
            >
              다시 도전하기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href={`/stage/${stageId}/flashcard`}>
            <button className="text-white/60 hover:text-white transition-colors btn-press">
              <ArrowLeft size={18} />
            </button>
          </Link>

          {/* Overall progress */}
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "oklch(0.82 0.22 130)" }}
              animate={{ width: `${((batchIndex * 2 + (matchMode === 'professor' ? 1 : 0)) / (totalBatches * 2)) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color: "oklch(0.82 0.22 130)" }}>
            <Timer size={14} />
            {formatTime(elapsed)}
          </div>

          {/* Wrong count */}
          {wrongPairs > 0 && (
            <div className="flex items-center gap-1 text-xs text-rose-400">
              <XCircle size={13} />
              {wrongPairs}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center p-4 py-8">
        <div className="w-full max-w-3xl">

          {/* Round label */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                Step 2 · 매칭 게임
              </p>
              <p className="text-sm font-semibold text-foreground">
                {matchMode === 'student' ? '학생 발언' : '교수 응답'} 매칭
                <span className="text-muted-foreground font-normal ml-2">
                  — 한국어와 영어를 연결하세요
                </span>
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {matchedCount}/{currentBatchSize} 완료
            </div>
          </div>

          {/* Batch done overlay */}
          <AnimatePresence>
            {phase === 'batch-done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "oklch(0 0 0 / 50%)" }}
              >
                <div className="bg-card rounded-3xl p-8 max-w-sm w-full border border-border shadow-xl text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {matchMode === 'student' ? '학생 발언 매칭 완료!' : '교수 응답 매칭 완료!'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    소요 시간: <strong>{formatTime(elapsed)}</strong> · 오답: <strong>{wrongPairs}회</strong>
                  </p>
                  {matchMode === 'student' && (
                    <p className="text-xs text-muted-foreground mb-5">
                      이번엔 교수 응답을 매칭해보세요!
                    </p>
                  )}
                  <button
                    onClick={handleNextBatch}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm btn-press"
                    style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}
                  >
                    {matchMode === 'student'
                      ? <><Zap size={16} /> 교수 응답 매칭하기</>
                      : batchIndex + 1 >= totalBatches
                        ? <><Trophy size={16} /> 결과 보기</>
                        : <><ChevronRight size={16} /> 다음 세트</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cards Grid */}
          <MatchCardGrid
            leftCards={leftCards}
            rightCards={rightCards}
            onLeftClick={handleLeftClick}
            onRightClick={handleRightClick}
            matchMode={matchMode}
          />

          {/* Instruction */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            왼쪽 한국어 카드를 선택한 후, 오른쪽에서 일치하는 영어 카드를 선택하세요
          </p>

          {/* Skip */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(`/stage/${stageId}/quiz`)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              매칭 건너뛰고 퀴즈로 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── MatchCardGrid Component ──
// Renders left/right card columns with equal heights per row.
// Cards show truncated text; if truncated, a small "…더보기" expand toggle is available.
// Professor mode cards get a slightly larger min-height to accommodate longer text.
function MatchCardGrid({
  leftCards,
  rightCards,
  onLeftClick,
  onRightClick,
  matchMode,
}: {
  leftCards: Card[];
  rightCards: Card[];
  onLeftClick: (id: string) => void;
  onRightClick: (id: string) => void;
  matchMode: MatchMode;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isTruncated = (card: Card) => card.text !== card.fullText;
  const isExpanded = (id: string) => expandedIds.has(id);

  // Card min-height based on mode
  const cardMinH = matchMode === 'professor' ? 'min-h-[88px]' : 'min-h-[64px]';

  const renderCard = (
    card: Card,
    index: number,
    side: 'left' | 'right',
    onClick: (id: string) => void
  ) => {
    const expanded = isExpanded(card.id);
    const truncated = isTruncated(card);
    const displayText = expanded ? card.fullText : card.text;

    const stateClass = card.matched
      ? 'opacity-40 cursor-default border-border bg-card text-foreground'
      : card.wrong
      ? 'border-rose-400 bg-rose-50 text-rose-700'
      : card.selected
      ? 'border-[oklch(0.82_0.22_130)] bg-[oklch(0.82_0.22_130/12%)] text-foreground shadow-sm'
      : 'border-border bg-card text-foreground hover:border-[oklch(0.82_0.22_130/50%)] hover:bg-muted';

    return (
      <motion.div
        key={card.id}
        initial={{ opacity: 0, x: side === 'left' ? -16 : 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className={`w-full rounded-xl border transition-all duration-150 ${stateClass} ${cardMinH} flex flex-col`}
      >
        {/* Main tap area */}
        <button
          onClick={() => !card.matched && onClick(card.id)}
          disabled={card.matched}
          className={`flex-1 w-full text-left px-4 pt-3 pb-1 text-sm leading-relaxed btn-press rounded-t-xl ${card.matched ? 'cursor-default' : ''}`}
        >
          <span className="flex items-start gap-1.5">
            {card.matched && (
              <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5 text-[oklch(0.45_0.18_130)]" />
            )}
            <span>{displayText}</span>
          </span>
        </button>

        {/* Expand toggle row */}
        {truncated && !card.matched && (
          <div className="px-4 pb-2 flex items-center justify-end">
            <button
              onClick={(e) => toggleExpand(e, card.id)}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
            >
              {expanded ? (
                <>접기 ▲</>
              ) : (
                <>전체 보기 ▼</>
              )}
            </button>
          </div>
        )}
        {!truncated && <div className="pb-2" />}
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left: Korean */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-wide mb-3">
          🇰🇷 한국어
        </p>
        {leftCards.map((card, i) => renderCard(card, i, 'left', onLeftClick))}
      </div>

      {/* Right: English */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-wide mb-3">
          🇺🇸 English
        </p>
        {rightCards.map((card, i) => renderCard(card, i, 'right', onRightClick))}
      </div>
    </div>
  );
}
