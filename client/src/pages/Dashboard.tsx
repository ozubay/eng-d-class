// ============================================================
// Dashboard Page
// Design: Neo-Minimal Workspace
// - Off-white background (#f5f5f3)
// - Lime green accent (#A8E63D)
// - Dark sidebar (near-black)
// - DM Sans headings + Noto Sans KR body
// - Soft card shadows, no heavy borders
// ============================================================

import { useProgress } from "@/hooks/useProgress";
import { STAGES } from "@/lib/courseData";
import { getStageSession, stepLabel } from "@/lib/stageSession";
import { Sidebar } from "@/components/Sidebar";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen, Zap, Flame, ChevronRight,
  Lock, CheckCircle2, Star, Target,
  Sparkles, AlertTriangle, RotateCcw, PlayCircle
} from "lucide-react";

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  lime:   { bg: "bg-[#A8E63D]",   text: "text-[#1a2e00]", border: "border-[#A8E63D]",   glow: "shadow-[0_0_24px_rgba(168,230,61,0.35)]" },
  blue:   { bg: "bg-blue-500",    text: "text-white",      border: "border-blue-500",    glow: "shadow-[0_0_24px_rgba(59,130,246,0.35)]" },
  purple: { bg: "bg-purple-500",  text: "text-white",      border: "border-purple-500",  glow: "shadow-[0_0_24px_rgba(168,85,247,0.35)]" },
  orange: { bg: "bg-orange-400",  text: "text-white",      border: "border-orange-400",  glow: "shadow-[0_0_24px_rgba(251,146,60,0.35)]" },
  teal:   { bg: "bg-teal-500",    text: "text-white",      border: "border-teal-500",    glow: "shadow-[0_0_24px_rgba(20,184,166,0.35)]" },
  red:    { bg: "bg-rose-500",    text: "text-white",      border: "border-rose-500",    glow: "shadow-[0_0_24px_rgba(244,63,94,0.35)]" },
  indigo: { bg: "bg-indigo-500",  text: "text-white",      border: "border-indigo-500",  glow: "shadow-[0_0_24px_rgba(99,102,241,0.35)]" },
  yellow: { bg: "bg-yellow-400",  text: "text-[#1a1a00]",  border: "border-yellow-400",  glow: "shadow-[0_0_24px_rgba(250,204,21,0.35)]" },
  pink:   { bg: "bg-pink-500",    text: "text-white",      border: "border-pink-500",    glow: "shadow-[0_0_24px_rgba(236,72,153,0.35)]" },
  gold:   { bg: "bg-amber-400",   text: "text-[#1a0e00]",  border: "border-amber-400",   glow: "shadow-[0_0_24px_rgba(251,191,36,0.35)]" },
};

export default function Dashboard() {
  const { progress, getOverallProgress } = useProgress();
  const overall = getOverallProgress();

  const completedStages = STAGES.filter(s => progress.stages[s.id]?.completed).length;

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top Header Bar ── */}
        <header
          className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 border-b"
          style={{
            background: "oklch(0.10 0.01 240)",
            borderColor: "oklch(1 0 0 / 8%)"
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Your Progress</span>
            <span className="text-white/30">·</span>
            <span className="text-sm font-semibold" style={{ color: "oklch(0.82 0.22 130)" }}>
              완료 {completedStages} / {STAGES.length}
            </span>
          </div>

          {/* Progress timeline */}
          <div className="flex-1 flex items-center gap-1 overflow-hidden">
            {STAGES.map((stage) => {
              const isCompleted = progress.stages[stage.id]?.completed;
              return (
                <div
                  key={stage.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-[oklch(0.82_0.22_130)]" : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "oklch(0.18 0.01 240)" }}>
              <Flame size={14} className="text-orange-400" />
              <span className="text-sm font-bold text-white">{progress.streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "oklch(0.82 0.22 130)" }}>
              <Zap size={14} className="text-[#1a2e00]" />
              <span className="text-sm font-bold text-[#1a2e00]">{progress.totalXP} XP</span>
            </div>
          </div>
        </header>

        {/* ── Page Body ── */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">

          {/* ── Hero Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="mb-8"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  GRAPHIC DESIGN
                  <span className="ml-3 px-3 py-0.5 rounded-lg text-sm font-semibold align-middle"
                    style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}>
                    English Trainer
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  대학교 3~4학년 그래픽디자인 수업을 영어로 진행하기 위한 교수 영어훈련 플랫폼
                </p>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 flex-wrap">
                <StatBadge icon={<CheckCircle2 size={14} />} label="완료 스테이지" value={`${completedStages}`} color="lime" />
                <StatBadge icon={<Target size={14} />} label="전체 진도" value={`${overall.percent}%`} color="blue" />
                <StatBadge icon={<Star size={14} />} label="레벨" value={`Lv.${progress.level}`} color="gold" />
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-5 p-4 rounded-2xl bg-card shadow-sm border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">전체 학습 진도</span>
                <span className="text-sm text-muted-foreground">
                  {overall.completedSentences} / {overall.totalSentences} 문장 완료
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "oklch(0.82 0.22 130)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overall.percent}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Continue / Start CTA ── */}
          <ContinueCard progress={progress} />

          {/* ── Stage Grid ── */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              학습 스테이지
            </h2>
            <span className="text-xs text-muted-foreground ml-1">각 스테이지 10문장 · 3라운드 학습</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {STAGES.map((stage, i) => {
              const sp = progress.stages[stage.id];
              const isUnlocked = sp?.unlocked ?? (stage.id === 1);
              const isCompleted = sp?.completed ?? false;
              const mastery = sp?.masteryPercent ?? 0;
              const colors = STAGE_COLORS[stage.colorClass] ?? STAGE_COLORS.lime;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                  {isUnlocked ? (
                    <Link href={`/stage/${stage.id}`}>
                      <StageCard
                        stage={stage}
                        isCompleted={isCompleted}
                        mastery={mastery}
                        colors={colors}
                        index={i}
                      />
                    </Link>
                  ) : (
                    <StageCard
                      stage={stage}
                      isCompleted={false}
                      mastery={0}
                      colors={colors}
                      index={i}
                      locked
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── Wrong Note Card ── */}
          <WrongNoteCard progress={progress} />

          {/* ── Mission Objectives (orientation) ── */}
          <MissionObjectives />

          {/* ── Bottom Tip ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 p-4 rounded-2xl border border-dashed border-border text-center"
          >
            <p className="text-xs text-muted-foreground">
              <BookOpen size={12} className="inline mr-1 mb-0.5" />
              각 스테이지는 <strong>빈칸 채우기 · 객관식 · 주관식 · 한→영 · 영→한</strong> 5가지 방식으로 반복 학습됩니다.
              모든 스테이지를 언제든 자유롭게 도전할 수 있고, 80% 이상 숙련 시 '완료'로 표시됩니다.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// ── Sub-components ──

// Primary call-to-action: resume the most recently interrupted stage,
// else start the first incomplete stage, else suggest review.
function ContinueCard({ progress }: { progress: ReturnType<typeof useProgress>["progress"] }) {
  let best: { stage: typeof STAGES[number]; session: NonNullable<ReturnType<typeof getStageSession>> } | null = null;
  for (const s of STAGES) {
    const sess = getStageSession(s.id);
    if (sess && (!best || sess.updatedAt > best.session.updatedAt)) best = { stage: s, session: sess };
  }
  const firstIncomplete = STAGES.find(s => !progress.stages[s.id]?.completed);

  let href: string, cta: string, title: string, subtitle: string;
  if (best) {
    href = `/stage/${best.stage.id}/${best.session.step}`;
    cta = "이어서 학습하기";
    title = best.stage.title;
    subtitle = `중단한 지점 · ${stepLabel(best.session.step)}`;
  } else if (firstIncomplete) {
    href = `/stage/${firstIncomplete.id}`;
    cta = "학습 시작하기";
    title = firstIncomplete.title;
    subtitle = firstIncomplete.titleKR;
  } else {
    href = "/stage/1";
    cta = "복습 시작하기";
    title = "모든 스테이지 완료!";
    subtitle = "복습으로 실력을 유지하세요";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.06 }}
      className="mb-8"
    >
      <Link href={href}>
        <div
          className="rounded-3xl p-5 sm:p-6 flex items-center gap-4 cursor-pointer btn-press"
          style={{ background: "oklch(0.82 0.22 130)", boxShadow: "0 10px 30px oklch(0.82 0.22 130 / 30%)" }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.10 0.01 240 / 12%)" }}>
            <PlayCircle size={26} className="text-[#1a2e00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1a2e00]/70">{cta}</p>
            <h2 className="text-lg sm:text-xl font-bold text-[#1a2e00] truncate"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {title}
            </h2>
            <p className="text-xs text-[#1a2e00]/70 truncate">{subtitle}</p>
          </div>
          <ChevronRight size={22} className="text-[#1a2e00] flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}

// Orientation: what this platform trains. Moved below the actionable
// content so the primary learning flow surfaces first.
function MissionObjectives() {
  const objectives = [
    { icon: "⚡", title: "시각 언어 구사", desc: "contrast, hierarchy, scale 등 핵심 용어를 영어로 자연스럽게 표현" },
    { icon: "💬", title: "크리틱 진행", desc: "학생 작업에 대해 구체적이고 전문적인 영어 피드백 제공" },
    { icon: "🎯", title: "개념-형식 연결", desc: "디자인 개념과 시각 형식의 관계를 영어로 논리적으로 설명" },
  ];
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Target size={16} className="text-muted-foreground" />
        <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          이 플랫폼이 훈련하는 것
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {objectives.map((obj) => (
          <div key={obj.title} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="text-2xl mb-2">{obj.icon}</div>
            <div className="font-semibold text-sm text-foreground mb-1">{obj.title}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{obj.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    lime: "bg-[oklch(0.82_0.22_130/12%)] text-[oklch(0.35_0.15_130)] border-[oklch(0.82_0.22_130/30%)]",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${colorMap[color] ?? colorMap.lime}`}>
      {icon}
      <span className="text-xs text-current/70 font-normal">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StageCard({
  stage, isCompleted, mastery, colors, index, locked
}: {
  stage: typeof STAGES[0];
  isCompleted: boolean;
  mastery: number;
  colors: { bg: string; text: string; border: string; glow: string };
  index: number;
  locked?: boolean;
}) {
  return (
    <div
      className={`
        relative bg-card rounded-2xl p-5 border border-border shadow-sm
        transition-all duration-200 ease-out
        ${locked ? "stage-locked" : "card-hover cursor-pointer"}
        ${isCompleted ? colors.glow : ""}
      `}
    >
      {/* Stage number */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isCompleted ? colors.bg : "bg-muted"}`}>
          {locked ? <Lock size={16} className="text-muted-foreground" /> : stage.icon}
        </div>
        <div className="flex items-center gap-1">
          {isCompleted && (
            <CheckCircle2 size={16} className="text-[oklch(0.82_0.22_130)]" />
          )}
          <span className="text-xs font-bold text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-sm text-foreground mb-0.5 leading-tight"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {stage.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-3">{stage.titleKR}</p>

      {/* Mastery bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">숙련도</span>
          <span className="text-[10px] font-bold text-foreground">{mastery}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isCompleted ? colors.bg : "bg-[oklch(0.82_0.22_130/60%)]"}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      {/* Sentence count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{stage.sentences.length}문장</span>
        {!locked && (
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${isCompleted ? "text-[oklch(0.35_0.15_130)]" : "text-muted-foreground"}`}>
            {isCompleted ? "완료" : "학습하기"}
            <ChevronRight size={10} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wrong Note Card ──
function WrongNoteCard({ progress }: { progress: ReturnType<typeof useProgress>['progress'] }) {
  const wrongCount = (progress.wrongSentenceIds ?? []).length;
  const masteredCount = (progress.masteredWrongIds ?? []).length;
  const pendingCount = wrongCount - masteredCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-rose-500" />
        <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          오답 노트
        </h2>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: "oklch(0.65 0.22 25)" }}>
            {pendingCount}개 복습 필요
          </span>
        )}
      </div>

      <Link href="/wrong-note">
        <div className={`
          relative rounded-2xl p-5 border cursor-pointer transition-all duration-200
          ${pendingCount > 0
            ? "bg-rose-50 border-rose-200 hover:shadow-[0_0_24px_rgba(239,68,68,0.15)] hover:border-rose-300"
            : "bg-card border-border hover:border-muted-foreground/30"
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${pendingCount > 0 ? "bg-rose-100" : "bg-muted"}`}>
                {pendingCount > 0 ? "📝" : "✅"}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {pendingCount > 0 ? `${pendingCount}개 문장 복습 필요` : "오답 없음 — 완벽합니다!"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {wrongCount > 0
                    ? `전체 오답 ${wrongCount}개 · 정복 ${masteredCount}개 완료`
                    : "퀴즈를 풀면 틀린 문장이 자동으로 모입니다"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {wrongCount > 0 && (
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">
                    {wrongCount > 0 ? `${Math.round((masteredCount / wrongCount) * 100)}%` : "0%"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">정복률</div>
                </div>
              )}
              <div className={`flex items-center gap-1 text-xs font-semibold ${pendingCount > 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                {pendingCount > 0 ? (
                  <>
                    <RotateCcw size={12} />
                    복습하기
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} />
                    확인하기
                  </>
                )}
                <ChevronRight size={12} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {wrongCount > 0 && (
            <div className="mt-4">
              <div className="h-1.5 rounded-full overflow-hidden bg-rose-100">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: masteredCount === wrongCount ? "oklch(0.82 0.22 130)" : "oklch(0.65 0.22 25)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((masteredCount / wrongCount) * 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
