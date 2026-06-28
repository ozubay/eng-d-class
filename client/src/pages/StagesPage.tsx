// ============================================================
// StagesPage — dedicated list of all stages
// Shows progress + lock state, and a "이어서 하기" hint when a
// stage was interrupted mid-mission.
// ============================================================

import { Link } from "wouter";
import { motion } from "framer-motion";
import { STAGES } from "@/lib/courseData";
import { useProgress } from "@/hooks/useProgress";
import { getStageSession, stepLabel } from "@/lib/stageSession";
import { AppLayout } from "@/components/AppLayout";
import { Lock, CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";

export default function StagesPage() {
  const { progress } = useProgress();

  return (
    <AppLayout title="학습 스테이지" subtitle="10개 미션 · 각 10문장 · 3단계 학습">
      <div className="max-w-3xl mx-auto space-y-3">
        {STAGES.map((stage, i) => {
          const sp = progress.stages[stage.id];
          const unlocked = sp?.unlocked ?? stage.id === 1;
          const completed = sp?.completed ?? false;
          const mastery = sp?.masteryPercent ?? 0;
          const session = unlocked ? getStageSession(stage.id) : null;

          const body = (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={`bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 ${
                unlocked ? "card-hover cursor-pointer" : "opacity-60"
              }`}
            >
              {/* Icon / number */}
              <div
                className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl ${
                  completed ? "bg-[oklch(0.82_0.22_130)]" : "bg-muted"
                }`}
              >
                {unlocked ? stage.icon : <Lock size={18} className="text-muted-foreground" />}
              </div>

              {/* Title + mastery */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    STAGE {String(i + 1).padStart(2, "0")}
                  </span>
                  {completed && <CheckCircle2 size={13} className="text-[oklch(0.82_0.22_130)]" />}
                </div>
                <h3 className="font-bold text-sm text-foreground leading-tight truncate"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {stage.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{stage.titleKR}</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full rounded-full bg-[oklch(0.82_0.22_130)]"
                    style={{ width: `${mastery}%` }}
                  />
                </div>
              </div>

              {/* Right status */}
              <div className="flex-shrink-0 text-right">
                {!unlocked ? (
                  <span className="text-[10px] text-muted-foreground">잠김</span>
                ) : session ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.35_0.15_130)]">
                    <PlayCircle size={12} /> 이어서 · {stepLabel(session.step)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    {completed ? "완료" : "학습하기"} <ChevronRight size={11} />
                  </span>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">{mastery}%</div>
              </div>
            </motion.div>
          );

          return unlocked ? (
            <Link key={stage.id} href={`/stage/${stage.id}`}>
              {body}
            </Link>
          ) : (
            <div key={stage.id}>{body}</div>
          );
        })}
      </div>
    </AppLayout>
  );
}
