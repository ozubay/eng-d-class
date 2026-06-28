// ============================================================
// CritiqueNotesPage — 크리틱 노트
// A searchable reference of every student→professor critique pair,
// grouped by stage, with English pronunciation. Built for a
// professor preparing to run design crits in English.
// ============================================================

import { useMemo, useState } from "react";
import { STAGES, Sentence } from "@/lib/courseData";
import { AppLayout } from "@/components/AppLayout";
import { SpeakButton } from "@/components/SpeakButton";
import { Search, X } from "lucide-react";

export default function CritiqueNotesPage() {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = (s: Sentence) =>
    !q ||
    s.studentEN.toLowerCase().includes(q) ||
    s.studentKR.toLowerCase().includes(q) ||
    s.professorEN.toLowerCase().includes(q) ||
    s.professorKR.toLowerCase().includes(q) ||
    s.keywords.some((k) => k.toLowerCase().includes(q));

  const filteredStages = useMemo(
    () =>
      STAGES.map((stage) => ({ stage, sentences: stage.sentences.filter(matches) })).filter(
        (g) => g.sentences.length > 0
      ),
    [q]
  );

  const totalHits = filteredStages.reduce((acc, g) => acc + g.sentences.length, 0);

  const searchBox = (
    <div className="relative w-64 max-w-[50vw]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="용어·표현 검색 (예: contrast, 대비)"
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[oklch(0.82_0.22_130/50%)]"
        style={{ background: "oklch(1 0 0 / 8%)" }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          title="지우기"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  return (
    <AppLayout
      title="크리틱 노트"
      subtitle={`디자인 크리틱 영어 표현 ${totalHits}개`}
      right={searchBox}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {filteredStages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            "{query}"에 해당하는 표현이 없습니다.
          </p>
        )}

        {filteredStages.map(({ stage, sentences }) => (
          <section key={stage.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{stage.icon}</span>
              <h2 className="text-base font-bold text-foreground"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {stage.title}
              </h2>
              <span className="text-xs text-muted-foreground">{stage.titleKR}</span>
            </div>

            <div className="space-y-3">
              {sentences.map((s) => (
                <div key={s.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                  {/* Student line */}
                  <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-muted/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground mb-0.5">학생 발언</p>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">
                        "{s.studentEN}"
                      </p>
                      <p className="text-xs text-muted-foreground">{s.studentKR}</p>
                    </div>
                    <SpeakButton text={s.studentEN}
                      className="text-muted-foreground hover:text-foreground p-1 mt-0.5" />
                  </div>

                  {/* Professor response */}
                  <div className="flex items-start gap-2 p-3 rounded-xl"
                    style={{ background: "oklch(0.82 0.22 130 / 8%)", border: "1px solid oklch(0.82 0.22 130 / 20%)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: "oklch(0.45 0.18 130)" }}>
                        교수 응답 (영어)
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed italic">
                        {s.professorEN}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 border-t border-border/50 pt-1.5">
                        {s.professorKR}
                      </p>
                    </div>
                    <SpeakButton text={s.professorEN}
                      className="text-[oklch(0.45_0.18_130)] hover:text-foreground p-1 mt-0.5" />
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.keywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setQuery(kw)}
                        className="keyword-highlight hover:opacity-80"
                        title={`"${kw}" 검색`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
