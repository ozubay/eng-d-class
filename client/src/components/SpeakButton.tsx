// ============================================================
// SpeakButton — 발음 듣기
// Speaks the given text using the browser's Web Speech API
// (no backend required). Defaults to English (en-US).
// ============================================================

import { Volume2 } from "lucide-react";

export function SpeakButton({
  text,
  lang = "en-US",
  size = 14,
  className = "",
  title = "발음 듣기",
}: {
  text: string;
  lang?: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const speak = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger parent (e.g. card flip)
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    synth.cancel(); // stop any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.95;
    synth.speak(utter);
  };

  return (
    <button
      type="button"
      onClick={speak}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-full transition-colors btn-press ${className}`}
    >
      <Volume2 size={size} />
    </button>
  );
}
