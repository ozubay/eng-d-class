// ============================================================
// StagePage
// Shows stage overview: sentences list, study mode selector,
// and start quiz button
// ============================================================

import { useParams, Link } from "wouter";
import { STAGES, QUIZ_TYPES, getQuizTypeLabel, getQuizTypeIcon } from "@/lib/courseData";
import { useProgress } from "@/hooks/useProgress";
import { getStageSession, clearStageSession, stepLabel } from "@/lib/stageSession";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, CheckCircle2,
  Lock, Zap, Target, PlayCircle, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StagePage() {
  const params = useParams<{ stageId: string }>();
  const stageId = parseInt(params.stageId ?? "1");
  const stage = STAGES.find(s => s.id === stageId);
  const { progress } = useProgress();
  const sp = progress.stages[stageId];
  const session = getStageSession(stageId);

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">스테이지를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!sp?.unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <Lock size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">이전 스테이지를 완료하면 잠금 해제됩니다.</p>
        <Link href="/">
          <Button variant="outline">대시보드로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const mastery = sp?.masteryPercent ?? 0;
  const completedSentences = Object.values(sp?.sentences ?? {}).filter(s => s.completed).length;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.968 0.003 240)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b"
        style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}
      >
        <Link href="/">
          <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm btn-press">
            <ArrowLeft size={16} />
            <span>대시보드</span>
          </button>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Stage {stageId}</span>
          <span className="text-white/20">/</span>
          <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.22 130)" }}>
            {stage.title}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stage Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="bg-card rounded-3xl p-6 border border-border shadow-sm mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{stage.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-muted-foreground">STAGE {stageId}</span>
                {sp?.completed && (
                  <span className="xp-badge">완료</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {stage.title}
              </h1>
              <p className="text-sm text-muted-foreground mb-1">{stage.titleKR}</p>
              <p className="text-sm text-foreground/70 leading-relaxed">{stage.descriptionKR}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{mastery}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">숙련도</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{completedSentences}/{stage.sentences.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">완료 문장</div>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{sp?.quizzesPassed ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-0.5">통과 퀴즈</div>
            </div>
          </div>

          {/* Mastery bar */}
          <div className="mt-4">
            <div className="h-2 rounded-full overflow-hidden bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "oklch(0.82 0.22 130)" }}
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              80% 이상 달성 시 이 스테이지가 '완료'로 표시됩니다
            </p>
          </div>
        </motion.div>

        {/* Learning Flow Steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
          className="mb-6"
        >
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Target size={14} />
            학습 단계
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: 1, icon: "🧠", label: "암기", desc: "카드 뒤집기로 한/영 문장 암기", color: "oklch(0.82 0.22 130 / 12%)" },
              { step: 2, icon: "🎯", label: "매칭", desc: "타이머 기반 한↔영 카드 연결", color: "oklch(0.7 0.2 50 / 10%)" },
              { step: 3, icon: "✏️", label: "퀴즈", desc: "5가지 유형으로 실력 검증", color: "oklch(0.6 0.2 280 / 10%)" },
            ].map(({ step, icon, label, desc, color }) => (
              <div key={step}
                className="rounded-xl p-3 border border-border text-center"
                style={{ background: color }}>
                <div className="text-2xl mb-1.5">{icon}</div>
                <div className="text-xs font-bold text-foreground mb-0.5">Step {step} · {label}</div>
                <div className="text-xs text-muted-foreground leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quiz Types */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen size={14} />
            퀴즈 유형 (Step 3)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {QUIZ_TYPES.map((type) => (
              <div key={type}
                className="bg-card rounded-xl p-3 border border-border text-center shadow-sm">
                <div className="text-lg mb-1">{getQuizTypeIcon(type)}</div>
                <div className="text-xs font-medium text-foreground">{getQuizTypeLabel(type)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sentence List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.12 }}
          className="mb-6"
        >
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen size={14} />
            학습 문장 미리보기
          </h2>
          <div className="space-y-2">
            {stage.sentences.map((sentence, i) => {
              const sentProg = sp?.sentences[sentence.id];
              const isCompleted = sentProg?.completed ?? false;
              const correctCount = sentProg?.correctCount ?? 0;

              return (
                <motion.div
                  key={sentence.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.03, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="bg-card rounded-xl p-4 border border-border shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                      isCompleted
                        ? "bg-[oklch(0.82_0.22_130)] text-[#1a2e00]"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {sentence.studentEN}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sentence.studentKR}
                      </p>
                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sentence.keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="keyword-highlight">{kw}</span>
                        ))}
                      </div>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[0, 1, 2].map(j => (
                        <div key={j} className={`w-2 h-2 rounded-full ${
                          j < correctCount
                            ? "bg-[oklch(0.82_0.22_130)]"
                            : "bg-muted"
                        }`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          {/* Resume CTA — 중단했던 단계에서 이어서 */}
          {session && (
            <Link href={`/stage/${stageId}/${session.step}`} className="flex-1">
              <button
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base btn-press transition-all duration-200"
                style={{
                  background: "oklch(0.82 0.22 130)",
                  color: "#1a2e00",
                  boxShadow: "0 8px 24px oklch(0.82 0.22 130 / 30%)"
                }}
              >
                <PlayCircle size={20} />
                이어서 하기 · {stepLabel(session.step)}
                <Zap size={16} />
              </button>
            </Link>
          )}
          <Link href={`/stage/${stageId}/flashcard`} className="flex-1">
            <button
              onClick={() => clearStageSession(stageId)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base btn-press transition-all duration-200 ${
                session ? "border border-border bg-card text-foreground" : ""
              }`}
              style={session ? undefined : {
                background: "oklch(0.82 0.22 130)",
                color: "#1a2e00",
                boxShadow: "0 8px 24px oklch(0.82 0.22 130 / 30%)"
              }}
            >
              {session ? <RotateCcw size={18} /> : <PlayCircle size={20} />}
              {session ? "처음부터 다시" : sp?.completed ? "다시 학습하기" : "Step 1 · 암기 시작"}
              {!session && <Zap size={16} />}
            </button>
          </Link>
          {sp?.completed && (
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/stage/${stageId}/match`}>
                <button className="w-full py-3 rounded-xl font-medium text-sm border border-border bg-card text-foreground btn-press hover:bg-muted transition-all">
                  🎯 매칭 게임만
                </button>
              </Link>
              <Link href={`/stage/${stageId}/quiz`}>
                <button className="w-full py-3 rounded-xl font-medium text-sm border border-border bg-card text-foreground btn-press hover:bg-muted transition-all">
                  ✏️ 퀴즈만
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
