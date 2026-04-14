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
}

// Kept in lockstep with STAGES in client/lib/stages.ts (5 stages = 5 buildings)
const BUILDINGS = [
  { id: "library", name: "Library", emoji: "📚" },
  { id: "classroom", name: "Classroom", emoji: "🪑" },
  { id: "cafeteria", name: "Cafeteria", emoji: "🍽️" },
  { id: "science-lab", name: "Science Lab", emoji: "🧪" },
  { id: "playground", name: "Playground", emoji: "🏃" },
];

type BuildingProgress = Record<string, { pct: number; label: string }>;

// Shown until the server replies; every building starts at 0.
const EMPTY_PROGRESS: BuildingProgress = BUILDINGS.reduce(
  (acc, b) => ({ ...acc, [b.id]: { pct: 0, label: "Not started" } }),
  {},
);

const STAT_META = [
  { key: "buildingsStarted", label: "BUILDINGS STARTED", color: "#7c6ff7" },
  { key: "questionsSolved", label: "QUESTIONS SOLVED", color: "#f59e0b" },
  { key: "buildingsComplete", label: "BUILDINGS COMPLETE", color: "#22d3ee" },
  { key: "pointsEarned", label: "POINTS EARNED", color: "#ec4899" },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { updateState } = useGame();

  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    buildingsStarted: 0,
    questionsSolved: 0,
    buildingsComplete: 0,
    pointsEarned: 0,
  });
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
          fetch(`${SERVER_URL}/api/dashboard/stats`, {
            headers: AUTH.authHeaders(),
          }),
          fetch(`${SERVER_URL}/api/dashboard/buildings`, {
            headers: AUTH.authHeaders(),
          }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (buildingsRes.ok) {
          const live = (await buildingsRes.json()) as BuildingProgress;
          // Merge so any missing keys fall back to defaults
          setBuildingProgress({ ...EMPTY_PROGRESS, ...live });
        }
      } catch {
        /* network error — keep zeros */
      }
    })();
  }, [router]);

  const handleLogout = () => {
    AUTH.clearAuth();
    router.push("/login");
  };

  const handleStartBuilding = async () => {
    setModalOpen(true);
  };

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

      <main className="max-w-5xl relative mx-auto px-6 py-8 space-y-8">
        {/* ── Greeting ── */}
        <div>
          <h2 className="text-2xl font-black">
            Good to see you, <span className="text-[#f59e0b]">{username}!</span>
          </h2>
          <p className="text-white/60 mt-1 text-sm">
            Pick a building, choose your level, and find a partner to start
            building.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {STAT_META.map(({ key, label, color }) => (
            <div key={key} className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color }}>
                {stats[key]}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>
        {/* ── Building Progress── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
            BUILDING PROGRESS
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {BUILDINGS.map((b) => {
              const prog = buildingProgress[b.id] ?? {
                pct: 0,
                label: "Not started",
              };
              const isSelected = selectedBuilding === b.id;
              const isComplete = prog.pct === 100;
              const barColor = isComplete
                ? "#22c55e"
                : prog.pct > 0
                  ? "#f59e0b"
                  : "#374151";

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuilding(b.id)}
                  className="bg-[#13102a] rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#1c1840]"
                  style={{
                    outline: isSelected
                      ? "2px solid #f59e0b"
                      : "2px solid transparent",
                  }}
                >
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-sm font-bold">{b.name}</span>
                  <div className="w-full">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${prog.pct}%`, background: barColor }}
                      />
                    </div>
                    <div
                      className="text-[11px] text-center mt-1"
                      style={{
                        color: isComplete ? "#22c55e" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {prog.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* ── Start Building ── */}
        <button
          onClick={handleStartBuilding}
          className="w-full py-4 bg-[#13102a] border border-white/20 rounded-2xl font-black text-lg hover:bg-[#1c1840] hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Building
        </button>
        <StartGameModal isModalOpen={modalOpen} handleModal={setModalOpen} />
      </main>
    </div>
  );
}
