"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { SERVER_URL } from "../CONSTANT";
import StartGameModal from "./components/StartGameModal";

interface DashboardStats {
  buildingsStarted: number;
  questionsSolved: number;
  buildingsComplete: number;
  pointsEarned: number;
  levelMastery: {
    foundation: number;
    walls: number;
    roof: number;
  };
}

interface BuildingProgressEntry {
  pct: number;
  label: string;
  completedLevels: number[];
  inProgressLevel: number | null;
}

type BuildingProgress = Record<string, BuildingProgressEntry>;

// Kept in lockstep with STAGES in client/lib/stages.ts (5 stages = 5 buildings)
const BUILDINGS = [
  { id: "library",     name: "Library",     emoji: "📚" },
  { id: "classroom",   name: "Classroom",   emoji: "🪑" },
  { id: "cafeteria",   name: "Cafeteria",   emoji: "🍽️" },
  { id: "science-lab", name: "Science Lab", emoji: "🧪" },
  { id: "playground",  name: "Playground",  emoji: "🏃" },
];

const LEVEL_META = [
  { id: 1, short: "F", name: "Foundation", color: "#22c55e" },
  { id: 2, short: "W", name: "Walls",      color: "#f59e0b" },
  { id: 3, short: "R", name: "Roof",       color: "#ec4899" },
];

const EMPTY_PROGRESS: BuildingProgress = BUILDINGS.reduce(
  (acc, b) => ({
    ...acc,
    [b.id]: { pct: 0, label: "Not started", completedLevels: [], inProgressLevel: null },
  }),
  {},
);

const DEFAULT_STATS: DashboardStats = {
  buildingsStarted: 0,
  questionsSolved: 0,
  buildingsComplete: 0,
  pointsEarned: 0,
  levelMastery: { foundation: 0, walls: 0, roof: 0 },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getSuggestedNext(progress: BuildingProgress): string | null {
  const levelOrder = [1, 2, 3];
  // Find first building that has an incomplete level not yet in progress
  for (const b of BUILDINGS) {
    const prog = progress[b.id];
    for (const lvl of levelOrder) {
      if (!prog.completedLevels.includes(lvl)) {
        const levelName = LEVEL_META.find(l => l.id === lvl)!.name;
        if (prog.inProgressLevel === lvl) {
          return `Continue ${b.name} · ${levelName}`;
        }
        return `Try ${levelName} for ${b.name}`;
      }
    }
  }
  return null; // all buildings fully complete
}

// ── Sub-components ──────────────────────────────────────────────────────────

function LevelDot({ levelMeta, status }: {
  levelMeta: typeof LEVEL_META[number];
  status: "done" | "active" | "none";
}) {
  const bg =
    status === "done"   ? levelMeta.color :
    status === "active" ? `${levelMeta.color}55` :
    "rgba(255,255,255,0.08)";
  const border =
    status === "done"   ? levelMeta.color :
    status === "active" ? levelMeta.color :
    "rgba(255,255,255,0.12)";
  const text =
    status === "done"   ? "#000" :
    status === "active" ? levelMeta.color :
    "rgba(255,255,255,0.3)";

  return (
    <span
      title={levelMeta.name}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border"
      style={{ background: bg, borderColor: border, color: text }}
    >
      {status === "done" ? "✓" : levelMeta.short}
    </span>
  );
}

function BuildingCard({
  building,
  prog,
  isSelected,
  onClick,
}: {
  building: typeof BUILDINGS[number];
  prog: BuildingProgressEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isComplete = prog.pct === 100;
  const hasProgress = prog.pct > 0 || prog.inProgressLevel !== null;

  const barColor = isComplete
    ? "#22c55e"
    : prog.pct > 0
      ? "#7c6ff7"
      : "#374151";

  const statusColor = isComplete
    ? "#22c55e"
    : hasProgress
      ? "rgba(255,255,255,0.5)"
      : "rgba(255,255,255,0.25)";

  return (
    <button
      onClick={onClick}
      className="bg-[#13102a] rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#1c1840] text-left w-full"
      style={{
        outline: isSelected ? "2px solid #f59e0b" : "2px solid transparent",
      }}
    >
      {/* Emoji + complete badge */}
      <div className="relative">
        <span className="text-3xl">{building.emoji}</span>
        {isComplete && (
          <span className="absolute -top-1 -right-2 text-[10px] bg-[#22c55e] text-black font-black px-1 rounded-full">
            ✓
          </span>
        )}
      </div>

      <span className="text-sm font-bold text-center leading-tight">{building.name}</span>

      {/* F / W / R level dots */}
      <div className="flex gap-1.5">
        {LEVEL_META.map(lv => {
          const status =
            prog.completedLevels.includes(lv.id) ? "done" :
            prog.inProgressLevel === lv.id ? "active" :
            "none";
          return <LevelDot key={lv.id} levelMeta={lv} status={status} />;
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${prog.pct}%`, background: barColor }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px]" style={{ color: statusColor }}>
            {prog.label}
          </span>
          <span className="text-[10px] font-black" style={{ color: statusColor }}>
            {prog.pct}%
          </span>
        </div>
      </div>
    </button>
  );
}

function LevelMasteryBar({ count, color }: { count: number; color: string }) {
  const pct = Math.round((count / 5) * 100);
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { updateState, resetState } = useGame();

  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [selectedBuilding, setSelectedBuilding] = useState("library");
  const [modalOpen, setModalOpen] = useState(false);
  const [buildingProgress, setBuildingProgress] =
    useState<BuildingProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    if (!AUTH.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUsername(AUTH.getUsername() || "");

    (async () => {
      try {
        const [statsRes, buildingsRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/dashboard/stats`,     { headers: AUTH.authHeaders() }),
          fetch(`${SERVER_URL}/api/dashboard/buildings`, { headers: AUTH.authHeaders() }),
        ]);
        if (statsRes.ok)     setStats(await statsRes.json());
        if (buildingsRes.ok) {
          const live = (await buildingsRes.json()) as BuildingProgress;
          setBuildingProgress({ ...EMPTY_PROGRESS, ...live });
        }
      } catch {
        /* network error — keep zeros */
      }
    })();
  }, [router]);

  const handleLogout = () => {
    AUTH.clearAuth();
    resetState();
    router.push("/login");
  };

  const suggestion = getSuggestedNext(buildingProgress);

  // Overall campus progress (unique level-building combos out of 15 total)
  const totalCombos = BUILDINGS.reduce(
    (sum, b) => sum + (buildingProgress[b.id]?.completedLevels.length ?? 0),
    0,
  );
  const campusPct = Math.round((totalCombos / 15) * 100);

  return (
    <div className="min-h-screen bg-[#0d0b1e] text-white">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <h1 className="text-2xl font-black">
          <span className="text-white">Code</span>
          <span className="text-[#7c6ff7]">Crafters!</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#7c6ff7] flex items-center justify-center font-black text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold">Welcome, {username}</span>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1 text-sm bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Greeting + Campus Progress ── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Good to see you, <span className="text-[#f59e0b]">{username}!</span>
            </h2>
            <p className="text-white/50 mt-1 text-sm">
              Pick a building, choose your level, and find a partner to start building.
            </p>
          </div>
          {/* Campus-wide progress pill */}
          <div className="flex-shrink-0 bg-[#13102a] rounded-xl px-5 py-3 text-right min-w-[160px]">
            <div className="text-[11px] font-black tracking-widest text-white/50 mb-1">CAMPUS PROGRESS</div>
            <div className="text-2xl font-black text-[#7c6ff7]">{campusPct}%</div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${campusPct}%`, background: "#7c6ff7" }}
              />
            </div>
            <div className="text-[10px] text-white/30 mt-1">{totalCombos} / 15 levels done</div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/50 mb-3">YOUR STATS</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color: "#7c6ff7" }}>
                {stats.buildingsStarted}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">BUILDINGS STARTED</div>
            </div>
            <div className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color: "#f59e0b" }}>
                {stats.questionsSolved}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">LEVELS COMPLETED</div>
            </div>
            <div className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color: "#22d3ee" }}>
                {stats.buildingsComplete}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">BUILDINGS COMPLETE</div>
              <div className="text-[10px] text-white/30 mt-1">Foundation + Walls + Roof</div>
            </div>
            <div className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color: "#ec4899" }}>
                {stats.pointsEarned}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">POINTS EARNED</div>
            </div>
          </div>
        </div>

        {/* ── Level Mastery ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/50 mb-3">LEVEL MASTERY</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "foundation" as const, label: "Foundation", desc: "Variables · Data types · I/O", color: "#22c55e" },
              { key: "walls"      as const, label: "Walls",      desc: "Conditionals · Loops · Lists", color: "#f59e0b" },
              { key: "roof"       as const, label: "Roof",       desc: "Functions · Parameters · Return", color: "#ec4899" },
            ].map(({ key, label, desc, color }) => {
              const count = stats.levelMastery?.[key] ?? 0;
              return (
                <div key={key} className="bg-[#13102a] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm" style={{ color }}>{label}</span>
                    <span className="text-white/40 text-xs font-bold">{count} / 5 buildings</span>
                  </div>
                  <div className="text-[10px] text-white/30 mb-2">{desc}</div>
                  <LevelMasteryBar count={count} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Building Progress ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/50 mb-1">BUILDING PROGRESS</h3>
          <p className="text-[11px] text-white/30 mb-3">
            Each building requires Foundation · Walls · Roof to be fully complete.
          </p>
          <div className="grid grid-cols-5 gap-3">
            {BUILDINGS.map(b => (
              <BuildingCard
                key={b.id}
                building={b}
                prog={buildingProgress[b.id] ?? EMPTY_PROGRESS[b.id]}
                isSelected={selectedBuilding === b.id}
                onClick={() => setSelectedBuilding(b.id)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {LEVEL_META.map(lv => (
              <div key={lv.id} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: lv.color }}
                />
                <span className="text-[11px] text-white/40">{lv.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
              <span className="text-[11px] text-white/40">Not started</span>
            </div>
          </div>
        </div>

        {/* ── Suggested Next Step ── */}
        {suggestion && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4 border border-[#7c6ff7]/30"
            style={{ background: "linear-gradient(135deg, #1a1540 0%, #13102a 100%)" }}
          >
            <div>
              <div className="text-[11px] font-black tracking-widest text-[#7c6ff7] mb-0.5">SUGGESTED NEXT STEP</div>
              <div className="font-black text-base">{suggestion}</div>
            </div>
            <button
              onClick={() => {
                // Pre-select the building that matches the suggestion
                const match = BUILDINGS.find(b => suggestion.includes(b.name));
                if (match) setSelectedBuilding(match.id);
                setModalOpen(true);
              }}
              className="ml-4 px-4 py-2 bg-[#7c6ff7] rounded-xl font-black text-sm hover:bg-[#6c5fd7] transition-colors flex-shrink-0"
            >
              Let's go →
            </button>
          </div>
        )}

        {/* ── Start Building ── */}
        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-4 bg-[#13102a] border border-white/20 rounded-2xl font-black text-lg hover:bg-[#1c1840] hover:border-white/40 transition-all"
        >
          Start Building
        </button>

        <StartGameModal
          isModalOpen={modalOpen}
          handleModal={setModalOpen}
          preselectedBuilding={selectedBuilding}
        />
      </main>
    </div>
  );
}
