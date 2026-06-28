// ============================================================
// useProgress Hook
// Manages user progress, XP, streaks, and stage completion
// Persists to localStorage
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { STAGES } from '@/lib/courseData';

export interface SentenceProgress {
  sentenceId: number;
  completed: boolean;
  correctCount: number;
  attempts: number;
  lastAttemptAt?: string;
}

export interface StageProgress {
  stageId: number;
  unlocked: boolean;
  completed: boolean;
  sentences: Record<number, SentenceProgress>;
  quizzesPassed: number;
  totalQuizzes: number;
  masteryPercent: number;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  stages: Record<number, StageProgress>;
  completedStages: number[];
  wrongSentenceIds: number[];   // accumulated wrong sentence IDs for review
  masteredWrongIds: number[];  // wrong sentences that were later corrected
}

const STORAGE_KEY = 'gd_english_trainer_progress';

const XP_PER_CORRECT = 10;
const XP_PER_STAGE_COMPLETE = 100;
const LEVEL_XP_THRESHOLD = 200;

function initStageProgress(stageId: number): StageProgress {
  const stage = STAGES.find(s => s.id === stageId);
  const sentences: Record<number, SentenceProgress> = {};
  stage?.sentences.forEach(s => {
    sentences[s.id] = { sentenceId: s.id, completed: false, correctCount: 0, attempts: 0 };
  });
  return {
    stageId,
    unlocked: true, // 모든 스테이지 항상 도전 가능 (순차 잠금 없음)
    completed: false,
    sentences,
    quizzesPassed: 0,
    totalQuizzes: (stage?.sentences.length ?? 0) * 3, // 3 quiz rounds per sentence
    masteryPercent: 0,
  };
}

function initProgress(): UserProgress {
  const stages: Record<number, StageProgress> = {};
  STAGES.forEach(s => {
    stages[s.id] = initStageProgress(s.id);
  });
  return {
    totalXP: 0,
    level: 1,
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    stages,
    completedStages: [],
    wrongSentenceIds: [],
    masteredWrongIds: [],
  };
}

function loadProgress(): UserProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as UserProgress;
      // Ensure all stages exist (in case new stages were added)
      STAGES.forEach(s => {
        if (!parsed.stages[s.id]) {
          parsed.stages[s.id] = initStageProgress(s.id);
        }
        // Migration: 모든 스테이지 잠금 해제 (순차 잠금 폐지)
        parsed.stages[s.id].unlocked = true;
      });
      // Ensure new fields exist for backward compat
      if (!parsed.wrongSentenceIds) parsed.wrongSentenceIds = [];
      if (!parsed.masteredWrongIds) parsed.masteredWrongIds = [];
      return parsed;
    }
  } catch {
    // ignore
  }
  return initProgress();
}

function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Persist on change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Update streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      setProgress(prev => ({
        ...prev,
        streak: prev.lastActiveDate === yesterday ? prev.streak + 1 : 1,
        lastActiveDate: today,
      }));
    }
  }, []);

  const recordCorrect = useCallback((stageId: number, sentenceId: number) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      const stage = { ...newProgress.stages[stageId] };
      const sentence = { ...stage.sentences[sentenceId] };

      sentence.correctCount += 1;
      sentence.attempts += 1;
      sentence.lastAttemptAt = new Date().toISOString();
      if (sentence.correctCount >= 3) {
        sentence.completed = true;
        // If this was a wrong sentence and now mastered, mark as mastered
        if ((newProgress.wrongSentenceIds ?? []).includes(sentenceId)) {
          const masteredSet = new Set(newProgress.masteredWrongIds ?? []);
          masteredSet.add(sentenceId);
          newProgress.masteredWrongIds = Array.from(masteredSet);
        }
      }

      stage.sentences = { ...stage.sentences, [sentenceId]: sentence };
      stage.quizzesPassed += 1;

      // Recalculate mastery
      const completedCount = Object.values(stage.sentences).filter(s => s.completed).length;
      stage.masteryPercent = Math.round((completedCount / Object.keys(stage.sentences).length) * 100);

      // Check stage completion
      const wasCompleted = stage.completed;
      stage.completed = stage.masteryPercent >= 80;

      newProgress.stages = { ...newProgress.stages, [stageId]: stage };

      // Add XP
      newProgress.totalXP += XP_PER_CORRECT;
      if (!wasCompleted && stage.completed) {
        newProgress.totalXP += XP_PER_STAGE_COMPLETE;
        const completedSet = new Set(newProgress.completedStages);
        completedSet.add(stageId);
        newProgress.completedStages = Array.from(completedSet);
        // Unlock next stage
        const nextStageId = stageId + 1;
        if (newProgress.stages[nextStageId]) {
          newProgress.stages = {
            ...newProgress.stages,
            [nextStageId]: { ...newProgress.stages[nextStageId], unlocked: true },
          };
        }
      }

      // Update level
      newProgress.level = Math.floor(newProgress.totalXP / LEVEL_XP_THRESHOLD) + 1;

      return newProgress;
    });
  }, []);

  const recordWrong = useCallback((stageId: number, sentenceId: number) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      const stage = { ...newProgress.stages[stageId] };
      const sentence = { ...stage.sentences[sentenceId] };

      sentence.attempts += 1;
      sentence.lastAttemptAt = new Date().toISOString();

      stage.sentences = { ...stage.sentences, [sentenceId]: sentence };
      newProgress.stages = { ...newProgress.stages, [stageId]: stage };

      // Accumulate wrong sentence IDs (deduplicated)
      const wrongSet = new Set(newProgress.wrongSentenceIds ?? []);
      wrongSet.add(sentenceId);
      newProgress.wrongSentenceIds = Array.from(wrongSet);

      return newProgress;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = initProgress();
    setProgress(fresh);
  }, []);

  const getStageProgress = useCallback((stageId: number): StageProgress => {
    return progress.stages[stageId] ?? initStageProgress(stageId);
  }, [progress]);

  const getOverallProgress = useCallback(() => {
    const totalSentences = STAGES.reduce((acc, s) => acc + s.sentences.length, 0);
    const completedSentences = Object.values(progress.stages).reduce((acc, stage) => {
      return acc + Object.values(stage.sentences).filter(s => s.completed).length;
    }, 0);
    return {
      totalSentences,
      completedSentences,
      percent: Math.round((completedSentences / totalSentences) * 100),
    };
  }, [progress]);

  const getWrongSentences = useCallback(() => {
    const wrongIds = progress.wrongSentenceIds ?? [];
    const masteredIds = new Set(progress.masteredWrongIds ?? []);
    // Return sentences that were wrong and not yet fully mastered
    return wrongIds
      .filter(id => !masteredIds.has(id))
      .map(id => {
        for (const stage of Object.values(progress.stages)) {
          if (stage.sentences[id]) {
            return { sentenceId: id, stageProgress: stage.sentences[id] };
          }
        }
        return null;
      })
      .filter(Boolean) as { sentenceId: number; stageProgress: SentenceProgress }[];
  }, [progress]);

  const clearWrongSentences = useCallback(() => {
    setProgress(prev => ({ ...prev, wrongSentenceIds: [], masteredWrongIds: [] }));
  }, []);

  return {
    progress,
    recordCorrect,
    recordWrong,
    resetProgress,
    getStageProgress,
    getOverallProgress,
    getWrongSentences,
    clearWrongSentences,
  };
}
