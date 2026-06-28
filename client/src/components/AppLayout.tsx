// ============================================================
// AppLayout — Sidebar + dark top bar + scrollable content
// Used by the secondary pages (stages / critique-notes / achievements)
// so they share the dashboard's chrome.
// ============================================================

import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";

export function AppLayout({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.968 0.003 240)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 border-b"
          style={{ background: "oklch(0.10 0.01 240)", borderColor: "oklch(1 0 0 / 8%)" }}
        >
          <div className="min-w-0">
            <h1
              className="text-sm font-semibold truncate"
              style={{ color: "oklch(0.82 0.22 130)" }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-xs text-white/40 truncate">{subtitle}</p>}
          </div>
          <div className="flex-1" />
          {right}
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
