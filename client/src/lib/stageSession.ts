// ============================================================
// Stage Session (resume state)
// Remembers, per stage, which step the user was on and the
// position within it, so an interrupted mission can be resumed.
// Persisted to localStorage, separate from learning progress.
// ============================================================

export type StageStep = "flashcard" | "match" | "quiz";

export interface StageSession {
  step: StageStep;
  index: number; // position within the step: card / batch / question index
  updatedAt: string;
}

const STORAGE_KEY = "gd_english_trainer_session";

type Sessions = Record<number, StageSession>;

function loadAll(): Sessions {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Sessions;
  } catch {
    // ignore
  }
  return {};
}

function saveAll(sessions: Sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function getStageSession(stageId: number): StageSession | null {
  return loadAll()[stageId] ?? null;
}

export function setStageSession(stageId: number, step: StageStep, index: number) {
  const sessions = loadAll();
  sessions[stageId] = { step, index, updatedAt: new Date().toISOString() };
  saveAll(sessions);
}

export function clearStageSession(stageId: number) {
  const sessions = loadAll();
  if (sessions[stageId]) {
    delete sessions[stageId];
    saveAll(sessions);
  }
}

// Path segment for a given step (used to route into the resumed page).
export function stepPath(step: StageStep): string {
  return step; // "flashcard" | "match" | "quiz" map 1:1 to route segments
}

// Korean label for a step (for resume CTA).
export function stepLabel(step: StageStep): string {
  switch (step) {
    case "flashcard":
      return "Step 1 · 암기";
    case "match":
      return "Step 2 · 매칭";
    case "quiz":
      return "Step 3 · 퀴즈";
  }
}
