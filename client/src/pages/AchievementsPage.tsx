// ============================================================
// AchievementsPage — 성취
// Surfaces XP / level / streak / completion stats and a set of
// earnable badges. Also offers a guarded progress reset.
// ============================================================

import { STAGES } from "@/lib/courseData";
import { useProgress } from "@/hooks/useProgress";
import { clearAllStageSessions } from "@/lib/stageSession";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Zap, Flame, Star, CheckCircle2, Target, Trophy, RotateCcw } from "lucide-react";

interface Badge {
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
}

export default function AchievementsPage() {
  const { progress, getOverallProgress, resetProgress } = useProgress();
  const overall = getOverallProgress();

  const completedStages = STAGES.filter((s) => progress.stages[s.id]?.completed).length;
  const masteredWrong = (progress.masteredWrongIds ?? []).length;

  const stats = [
    { icon: <Star size={16} />, label: "레벨", value: `Lv.${progress.level}` },
    { icon: <Zap size={16} />, label: "총 XP", value: `${progress.totalXP}` },
    { icon: <Flame size={16} />, label: "연속 학습", value: `${progress.streak}일` },
    { icon: <CheckCircle2 size={16} />, label: "완료 스테이지", value: `${completedStages}/${STAGES.length}` },
    { icon: <Target size={16} />, label: "전체 진도", value: `${overall.percent}%` },
    { icon: <Trophy size={16} />, label: "오답 정복", value: `${masteredWrong}` },
  ];

  const badges: Badge[] = [
    { icon: "🌱", title: "첫 발걸음", desc: "첫 스테이지 완료", earned: completedStages >= 1 },
    { icon: "⚡", title: "탄력", desc: "3일 연속 학습", earned: progress.streak >= 3 },
    { icon: "📈", title: "레벨 업", desc: "레벨 3 도달", earned: progress.level >= 3 },
    { icon: "💎", title: "XP 수집가", desc: "500 XP 달성", earned: progress.totalXP >= 500 },
    { icon: "🎯", title: "절반 정복", desc: "5개 스테이지 완료", earned: completedStages >= 5 },
    { icon: "📝", title: "오답 마스터", desc: "오답 5개 정복", earned: masteredWrong >= 5 },
    { icon: "🏆", title: "올 클리어", desc: "10개 스테이지 완료", earned: completedStages >= STAGES.length },
    { icon: "🔥", title: "불꽃 연속", desc: "7일 연속 학습", earned: progress.streak >= 7 },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  const handleReset = () => {
    if (window.confirm("모든 학습 진도와 기록을 초기화할까요? 되돌릴 수 없습니다.")) {
      resetProgress();
      clearAllStageSessions();
    }
  };

  return (
    <AppLayout title="성취" subtitle={`배지 ${earnedCount}/${badges.length} 획득`}>
      <div className="max-w-3xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                {s.icon}
                <span className="text-xs">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-muted-foreground" />
          <h2 className="text-base font-bold text-foreground"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            배지
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className={`rounded-2xl p-4 border text-center ${
                b.earned
                  ? "bg-card border-[oklch(0.82_0.22_130/40%)] shadow-sm"
                  : "bg-muted/40 border-border opacity-60"
              }`}
            >
              <div className={`text-3xl mb-2 ${b.earned ? "" : "grayscale"}`}>{b.icon}</div>
              <div className="text-xs font-bold text-foreground mb-0.5">{b.title}</div>
              <div className="text-[10px] text-muted-foreground leading-snug">{b.desc}</div>
              {b.earned && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.35_0.15_130)]">
                  <CheckCircle2 size={10} /> 획득
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-4 border border-dashed border-rose-200 bg-rose-50/50 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">진도 초기화</p>
            <p className="text-xs text-muted-foreground">XP·스테이지·오답·이어하기 기록을 모두 삭제합니다.</p>
          </div>
          <button
            onClick={handleReset}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 bg-white btn-press hover:bg-rose-50"
          >
            <RotateCcw size={14} />
            초기화
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
