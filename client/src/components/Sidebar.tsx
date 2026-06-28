// ============================================================
// Sidebar — shared left navigation rail
// Wires the dashboard/stages/critique-notes/achievements routes
// with active-state highlighting based on the current location.
// ============================================================

import { Link, useLocation } from "wouter";
import { useProgress } from "@/hooks/useProgress";
import { BarChart3, Layers, MessageSquare, Trophy, GraduationCap } from "lucide-react";

const NAV_ITEMS = [
  { icon: BarChart3, label: "대시보드", href: "/" },
  { icon: Layers, label: "스테이지", href: "/stages" },
  { icon: MessageSquare, label: "크리틱 노트", href: "/critique-notes" },
  { icon: Trophy, label: "성취", href: "/achievements" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { progress } = useProgress();

  return (
    <aside
      className="w-[64px] flex-shrink-0 flex flex-col items-center py-6 gap-4 sticky top-0 h-screen z-20"
      style={{ background: "oklch(0.10 0.01 240)" }}
    >
      {/* Logo mark → home */}
      <Link href="/">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 btn-press"
          style={{ background: "oklch(0.82 0.22 130)" }}
          title="홈"
        >
          <GraduationCap size={18} className="text-[#1a2e00]" />
        </button>
      </Link>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <button
              className={`sidebar-icon-btn btn-press ${active ? "active" : ""}`}
              title={item.label}
            >
              <Icon size={18} />
            </button>
          </Link>
        );
      })}

      <div className="flex-1" />

      {/* Level indicator */}
      <Link href="/achievements">
        <button className="flex flex-col items-center gap-1 btn-press" title="성취">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "oklch(0.82 0.22 130)", color: "#1a2e00" }}
          >
            {progress.level}
          </div>
          <span className="text-[10px] text-white/40">Lv.</span>
        </button>
      </Link>
    </aside>
  );
}
