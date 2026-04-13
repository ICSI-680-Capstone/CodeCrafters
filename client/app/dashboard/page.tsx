"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { SERVER_URL } from "../CONSTANT";

interface DashboardStats {
  buildingsStarted: number;
  questionsSolved: number;
  buildingsComplete: number;
  pointsEarned: number;
}

const BUILDINGS = [
  { id: "library",      name: "Library",      emoji: "📚" },
  { id: "cafeteria",    name: "Cafeteria",    emoji: "🍽️" },
  { id: "playground",   name: "Playground",   emoji: "🏃" },
  { id: "gym",          name: "Gym",          emoji: "💪" },
  { id: "computer-lab", name: "Computer Lab", emoji: "💻" },
];

// Static progress — replace with API data once building-progress table exists
const BUILDING_PROGRESS: Record<string, { pct: number; label: string }> = {
  library:       { pct: 60,  label: "60%" },
  cafeteria:     { pct: 25,  label: "25%" },
  playground:    { pct: 100, label: "Complete!" },
  gym:           { pct: 0,   label: "Not started" },
  "computer-lab":{ pct: 0,   label: "Not started" },
};

const LEVELS = [
  {
    id: 1,
    badge: "Level 1",
    name: "Foundation",
    desc: "Variables, data types, print(), input() — the raw materials.",
    borderColor: "#22c55e",
    badgeColor: "#22c55e",
  },
  {
    id: 2,
    badge: "Level 2",
    name: "Walls",
    desc: "Conditionals, loops, lists — logic that makes it functional.",
    borderColor: "#f59e0b",
    badgeColor: "#f59e0b",
  },
  {
    id: 3,
    badge: "Level 3",
    name: "Roof",
    desc: "Functions with parameters and return values — the finish.",
    borderColor: "#ec4899",
    badgeColor: "#ec4899",
  },
];

const STAT_META = [
  { key: "buildingsStarted",  label: "BUILDINGS STARTED",  color: "#7c6ff7" },
  { key: "questionsSolved",   label: "QUESTIONS SOLVED",   color: "#f59e0b" },
  { key: "buildingsComplete", label: "BUILDINGS COMPLETE", color: "#22d3ee" },
  { key: "pointsEarned",      label: "POINTS EARNED",      color: "#ec4899" },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { updateState } = useGame();

  const [username, setUsername]             = useState("");
  const [stats, setStats]                   = useState<DashboardStats>({
    buildingsStarted: 0, questionsSolved: 0, buildingsComplete: 0, pointsEarned: 0,
  });
  const [playMode, setPlayMode]             = useState<"friend" | "ai">("friend");
  const [selectedBuilding, setSelectedBuilding] = useState("library");
  const [selectedLevel, setSelectedLevel]   = useState(1);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    if (!AUTH.isLoggedIn()) { router.replace("/login"); return; }
    setUsername(AUTH.getUsername() || "");

    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/dashboard/stats`, {
          headers: AUTH.authHeaders(),
        });
        if (res.ok) setStats(await res.json());
      } catch { /* network error — keep zeros */ }
    })();
  }, [router]);

  const handleLogout = () => { AUTH.clearAuth(); router.push("/login"); };

  const handleStartBuilding = async () => {
    setLoading(true);
    try {
      const endpoint = playMode === "ai" ? "/api/game/create-ai" : "/api/game/create";
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: AUTH.authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not create session."); return; }
      updateState({ playerName: AUTH.getUsername(), sessionId: data.sessionId, role: data.role, currentStage: 1 });
      // AI games skip the waiting room — go straight to the game
      router.push(playMode === "ai" ? "/game" : `/waiting?sessionId=${data.sessionId}&role=${data.role}`);
    } catch {
      alert("Could not connect to server.");
    } finally {
      setLoading(false);
    }
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

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ── Greeting ── */}
        <div>
          <h2 className="text-2xl font-black">
            Good to see you, <span className="text-[#f59e0b]">{username}!</span>
          </h2>
          <p className="text-white/60 mt-1 text-sm">
            Pick a building, choose your level, and find a partner to start building.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {STAT_META.map(({ key, label, color }) => (
            <div key={key} className="bg-[#13102a] rounded-xl p-5">
              <div className="text-4xl font-black" style={{ color }}>
                {stats[key]}
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-bold tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Play mode ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">HOW DO YOU WANT TO PLAY?</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Friend */}
            <button
              onClick={() => setPlayMode("friend")}
              className="rounded-2xl p-6 text-left transition-all"
              style={{
                background: "linear-gradient(135deg, #3b1d8e 0%, #1e1255 100%)",
                outline: playMode === "friend" ? "2px solid #7c6ff7" : "2px solid transparent",
              }}
            >
              <div className="text-3xl mb-3">👥</div>
              <div className="font-black text-lg mb-1">Play with a friend</div>
              <p className="text-white/65 text-sm mb-5">
                Get matched with another student picking the same building and level. Chat, code, and build together.
              </p>
              <span className="inline-block px-5 py-2 rounded-xl font-black text-sm bg-[#1a1040]">
                Find a partner
              </span>
            </button>

            {/* AI */}
            <button
              onClick={() => setPlayMode("ai")}
              className="rounded-2xl p-6 text-left transition-all"
              style={{
                background: "linear-gradient(135deg, #0d4a28 0%, #071a10 100%)",
                outline: playMode === "ai" ? "2px solid #22c55e" : "2px solid transparent",
              }}
            >
              <div className="text-3xl mb-3">🤖</div>
              <div className="font-black text-lg mb-1">Play with AI</div>
              <p className="text-white/65 text-sm mb-5">
                No partner needed. An AI buddy plays alongside you so you can practice anytime.
              </p>
              <span className="inline-block px-5 py-2 rounded-xl font-black text-sm bg-[#071a10]">
                Play with AI
              </span>
            </button>
          </div>
        </div>

        {/* ── Buildings ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">CHOOSE A BUILDING</h3>
          <div className="grid grid-cols-5 gap-3">
            {BUILDINGS.map((b) => {
              const prog       = BUILDING_PROGRESS[b.id];
              const isSelected = selectedBuilding === b.id;
              const isComplete = prog.pct === 100;
              const barColor   = isComplete ? "#22c55e" : prog.pct > 0 ? "#f59e0b" : "#374151";

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuilding(b.id)}
                  className="bg-[#13102a] rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#1c1840]"
                  style={{
                    outline: isSelected ? "2px solid #f59e0b" : "2px solid transparent",
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
                      style={{ color: isComplete ? "#22c55e" : "rgba(255,255,255,0.4)" }}
                    >
                      {prog.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Levels ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">CHOOSE YOUR LEVEL</h3>
          <div className="grid grid-cols-3 gap-4">
            {LEVELS.map((lv) => {
              const isSelected = selectedLevel === lv.id;
              return (
                <button
                  key={lv.id}
                  onClick={() => setSelectedLevel(lv.id)}
                  className="rounded-2xl p-5 text-left transition-all border-2"
                  style={{
                    background: "#13102a",
                    borderColor: isSelected ? lv.borderColor : `${lv.borderColor}33`,
                  }}
                >
                  <span
                    className="inline-block px-3 py-0.5 rounded-full text-xs font-black mb-3"
                    style={{ background: lv.badgeColor, color: "#000" }}
                  >
                    {lv.badge}
                  </span>
                  <div className="font-black text-lg">{lv.name}</div>
                  <p className="text-white/50 text-sm mt-1">{lv.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Start Building ── */}
        <button
          onClick={handleStartBuilding}
          disabled={loading}
          className="w-full py-4 bg-[#13102a] border border-white/20 rounded-2xl font-black text-lg hover:bg-[#1c1840] hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Session..." : "Start Building"}
        </button>
      </main>
    </div>
  );
}
