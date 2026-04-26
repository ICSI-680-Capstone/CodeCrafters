"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { SERVER_URL } from "../CONSTANT";
import StartGameModal from "./components/StartGameModal";
import {
  BookOpen, GraduationCap, Utensils, FlaskConical, Activity,
  Building2, Layers, Home,
  Sparkles, Zap, Trophy, Flame,
  Gamepad2, LogOut, Construction,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

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

interface DashboardActiveSession {
  id: string;
  stage: number;
  score: number;
  role: string;
}

export const BUILDINGS: { id: string; name: string; Icon: LucideIcon }[] = [
  { id: "library",     name: "Library",     Icon: BookOpen },
  { id: "classroom",   name: "Classroom",   Icon: GraduationCap },
  { id: "cafeteria",   name: "Cafeteria",   Icon: Utensils },
  { id: "science-lab", name: "Science Lab", Icon: FlaskConical },
  { id: "playground",  name: "Playground",  Icon: Activity },
];

const LEVEL_META = [
  { id: 1, short: "F", name: "Foundation", color: "#22c55e" },
  { id: 2, short: "W", name: "Walls",      color: "#f59e0b" },
  { id: 3, short: "R", name: "Roof",       color: "#ec4899" },
];

const EMPTY_PROGRESS: BuildingProgress = BUILDINGS.reduce(
  (acc, b) => ({ ...acc, [b.id]: { pct: 0, label: "Not started", completedLevels: [], inProgressLevel: null } }),
  {},
);

const DEFAULT_STATS: DashboardStats = {
  buildingsStarted: 0,
  questionsSolved: 0,
  buildingsComplete: 0,
  pointsEarned: 0,
  levelMastery: { foundation: 0, walls: 0, roof: 0 },
};

function getSuggestedNext(progress: BuildingProgress): string | null {
  for (const b of BUILDINGS) {
    const prog = progress[b.id];
    for (const lvl of [1, 2, 3]) {
      if (!prog.completedLevels.includes(lvl)) {
        const levelName = LEVEL_META.find(l => l.id === lvl)!.name;
        if (prog.inProgressLevel === lvl) return `Continue ${b.name} · ${levelName}`;
        return `Try ${levelName} for ${b.name}`;
      }
    }
  }
  return null;
}

function StarRating({ pct }: { pct: number }) {
  const stars = pct === 100 ? 3 : pct >= 67 ? 2 : pct > 0 ? 1 : 0;
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span key={i} className={`text-[14px] ${i < stars ? "text-[#fbbf24]" : "text-white/15"}`}>★</span>
      ))}
    </div>
  );
}

function LevelDot({ levelMeta, status }: {
  levelMeta: typeof LEVEL_META[number];
  status: "done" | "active" | "none";
}) {
  const bg     = status === "done" ? levelMeta.color : status === "active" ? `${levelMeta.color}40` : "rgba(255,255,255,0.06)";
  const border = status === "done" ? levelMeta.color : status === "active" ? levelMeta.color : "rgba(255,255,255,0.10)";
  const text   = status === "done" ? "#000" : status === "active" ? levelMeta.color : "rgba(255,255,255,0.25)";
  return (
    <span
      title={levelMeta.name}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border transition-all"
      style={{ background: bg, borderColor: border, color: text }}
    >
      {status === "done" ? "✓" : levelMeta.short}
    </span>
  );
}

function BuildingCard({ building, prog, isSelected, onClick }: {
  building: typeof BUILDINGS[number];
  prog: BuildingProgressEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isComplete = prog.pct === 100;
  const barColor = isComplete ? "#22c55e" : prog.pct > 0 ? "#7c6ff7" : "#2d2b50";
  const { Icon } = building;

  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.03] w-full group"
      style={{
        background: isSelected ? "linear-gradient(145deg, #1e1a42, #16133a)" : "linear-gradient(145deg, #13102a, #0f0d24)",
        outline: isSelected ? "2px solid #7c6ff7" : "2px solid transparent",
        outlineOffset: "2px",
      }}
    >
      {isComplete && <div className="absolute inset-0 rounded-2xl bg-[#22c55e]/5 pointer-events-none" />}

      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/6 group-hover:bg-white/10 transition-colors">
        <Icon size={22} className="text-white/70 group-hover:text-white transition-colors" />
        {isComplete && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center">
            <CheckCircle2 size={10} className="text-black" />
          </span>
        )}
      </div>

      <span className="text-[13px] font-black text-center leading-tight text-white/90">{building.name}</span>
      <StarRating pct={prog.pct} />

      <div className="flex gap-1.5">
        {LEVEL_META.map(lv => {
          const status = prog.completedLevels.includes(lv.id) ? "done" : prog.inProgressLevel === lv.id ? "active" : "none";
          return <LevelDot key={lv.id} levelMeta={lv} status={status} />;
        })}
      </div>

      <div className="w-full">
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prog.pct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[9px] text-white/35 font-bold truncate max-w-[70%]">{prog.label}</span>
          <span className="text-[9px] font-black text-white/40">{prog.pct}%</span>
        </div>
      </div>
    </button>
  );
}

function LevelMasteryBar({ count, color }: { count: number; color: string }) {
  const pct = Math.round((count / 5) * 100);
  return (
    <div className="h-2 bg-white/8 rounded-full overflow-hidden mt-2">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { updateState, resetState } = useGame();

  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [selectedBuilding, setSelectedBuilding] = useState("library");
  const [modalOpen, setModalOpen] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState<BuildingProgress>(EMPTY_PROGRESS);
  const [activeSession, setActiveSession] = useState<DashboardActiveSession | null>(null);
  const [abandonLoading, setAbandonLoading] = useState(false);

  useEffect(() => {
    if (!AUTH.isLoggedIn()) { router.replace("/login"); return; }
    setUsername(AUTH.getUsername() || "");
    (async () => {
      try {
        const [statsRes, buildingsRes, activeRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/dashboard/stats`,     { headers: AUTH.authHeaders() }),
          fetch(`${SERVER_URL}/api/dashboard/buildings`, { headers: AUTH.authHeaders() }),
          fetch(`${SERVER_URL}/api/game/active`,         { headers: AUTH.authHeaders() }),
        ]);
        if (statsRes.ok)     setStats(await statsRes.json());
        if (buildingsRes.ok) {
          const live = (await buildingsRes.json()) as BuildingProgress;
          setBuildingProgress({ ...EMPTY_PROGRESS, ...live });
        }
        if (activeRes.ok) {
          const { session } = await activeRes.json();
          setActiveSession(session ?? null);
        }
      } catch { /* keep zeros */ }
    })();
  }, [router]);

  const handleLogout = () => { AUTH.clearAuth(); resetState(); router.push("/login"); };

  const handleRejoin = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/game/join`, {
        method: "POST", headers: AUTH.authHeaders(), body: JSON.stringify({ sessionId: activeSession.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      updateState({
        playerName: AUTH.getUsername(), sessionId: activeSession.id, role: data.role,
        currentStage: data.stage, level: (data.level ?? 1) as 1 | 2 | 3,
        completedStages: Math.max(0, (data.stage ?? 1) - 1),
      });
      router.push("/game");
    } catch { alert("Could not reconnect."); }
  };

  const handleAbandon = async () => {
    if (!activeSession) return;
    if (!confirm("Abandon this session? Your partner will be notified.")) return;
    setAbandonLoading(true);
    try {
      await fetch(`${SERVER_URL}/api/game/abandon`, { method: "POST", headers: AUTH.authHeaders() });
      setActiveSession(null);
      resetState();
    } catch { /* ignore */ } finally { setAbandonLoading(false); }
  };

  const suggestion = getSuggestedNext(buildingProgress);
  const totalCombos = BUILDINGS.reduce((sum, b) => sum + (buildingProgress[b.id]?.completedLevels.length ?? 0), 0);
  const campusPct = Math.round((totalCombos / 15) * 100);
  const xpEarned = stats.pointsEarned;
  const xpPct = Math.min(100, Math.round((xpEarned / 500) * 100));

  const greetings = campusPct === 0
    ? "Ready to start? Let's build!"
    : campusPct === 100
    ? "You built the whole campus!"
    : `Keep building, ${username}!`;

  const statCards = [
    { value: stats.buildingsStarted,  label: "Buildings Started", Icon: Construction, color: "#7c6ff7" },
    { value: stats.questionsSolved,   label: "Levels Cleared",    Icon: Zap,          color: "#f59e0b" },
    { value: stats.buildingsComplete, label: "Fully Built",       Icon: Trophy,       color: "#22d3ee" },
    { value: stats.pointsEarned,      label: "XP Earned",        Icon: Sparkles,     color: "#ec4899" },
  ];

  const masteryLevels = [
    { key: "foundation" as const, label: "Foundation", badge: "Lvl 1", desc: "Variables · Data types · print()", color: "#22c55e", Icon: Layers },
    { key: "walls"      as const, label: "Walls",      badge: "Lvl 2", desc: "if/else · Loops · Lists",          color: "#f59e0b", Icon: Building2 },
    { key: "roof"       as const, label: "Roof",       badge: "Lvl 3", desc: "Functions · Parameters · Return",  color: "#ec4899", Icon: Home },
  ];

  return (
    <div className="min-h-screen bg-[#0d0b1e] text-white">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0d0b1e]/80 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-display)" }}>
          <span className="text-white">Code</span>
          <span className="text-[#7c6ff7]">Crafters!</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#13102a] border border-white/10 rounded-full pl-3 pr-4 py-1.5">
            <Sparkles size={13} className="text-[#fbbf24]" />
            <span className="text-sm font-black text-white">{xpEarned} XP</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c6ff7] to-[#ec4899] flex items-center justify-center font-black text-sm shadow-[0_0_0_2px_rgba(124,111,247,0.3)]">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-sm text-white/80 hidden md:block">{username}</span>
          <button
            onClick={handleLogout}
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-white/8 rounded-full border border-white/15 hover:bg-white/15 hover:text-white text-white/60 font-bold transition-all"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Active session banner */}
        {activeSession && (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 anim-slide-up"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.08) 100%)",
              border: "1px solid rgba(34,197,94,0.35)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                <Gamepad2 size={20} className="text-[#22c55e]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[#22c55e] font-black text-[13px]">Active Game in Progress</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
                </div>
                <p className="text-white/50 text-[12px] font-bold">
                  Session <strong className="text-white/70">{activeSession.id}</strong>
                  {" · "}Stage <strong className="text-white/70">{activeSession.stage}</strong>/5
                  {" · "}{activeSession.role}
                  {" · "}<strong className="text-[#fbbf24]">{activeSession.score} XP</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRejoin}
                className="px-4 py-2 bg-[#22c55e] text-[#1a1a1a] rounded-xl font-black text-[13px] hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
              >
                Rejoin →
              </button>
              <button
                onClick={handleAbandon}
                disabled={abandonLoading}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold text-white/40 hover:text-white/70 hover:bg-white/10 transition-all disabled:opacity-40"
              >
                {abandonLoading ? "..." : "Abandon"}
              </button>
            </div>
          </div>
        )}

        {/* Hero greeting + XP bar */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a1540 0%, #13102a 100%)", border: "1px solid rgba(124,111,247,0.2)" }}
        >
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-[#7c6ff7]/10 blur-3xl pointer-events-none" />
          <div className="flex items-end justify-between gap-4 relative z-10">
            <div className="flex-1">
              <p className="text-white/50 text-[11px] font-black tracking-widest mb-1">YOUR CAMPUS</p>
              <h2 className="text-2xl font-black mb-1">{greetings}</h2>
              <p className="text-white/45 text-sm font-bold">
                {campusPct === 100
                  ? "All 15 levels complete — Python master!"
                  : `${totalCombos}/15 levels done · ${15 - totalCombos} to go`}
              </p>
              <div className="mt-4 max-w-sm">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-black text-[#7c6ff7] tracking-wider">TOTAL XP</span>
                  <span className="text-[11px] font-black text-white/50">{xpEarned} / 500</span>
                </div>
                <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${xpPct}%`, background: "linear-gradient(90deg, #7c6ff7, #ec4899)" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-[#7c6ff7]/30 bg-[#7c6ff7]/10">
              <div className="text-3xl font-black text-[#7c6ff7]">{campusPct}%</div>
              <div className="text-[9px] font-black text-white/35 tracking-wider">DONE</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/40 mb-3">YOUR STATS</h3>
          <div className="grid grid-cols-4 gap-3">
            {statCards.map(({ value, label, Icon, color }) => (
              <div key={label} className="bg-[#13102a] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                <Icon size={20} className="mb-2" style={{ color }} />
                <div className="text-3xl font-black" style={{ color }}>{value}</div>
                <div className="text-[10px] text-white/40 mt-1 font-bold leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill mastery */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/40 mb-3">SKILL MASTERY</h3>
          <div className="grid grid-cols-3 gap-3">
            {masteryLevels.map(({ key, label, badge, desc, color, Icon }) => {
              const count = stats.levelMastery?.[key] ?? 0;
              return (
                <div key={key} className="bg-[#13102a] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} style={{ color }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-[13px]" style={{ color }}>{label}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                            {badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/30 mt-0.5">{desc}</div>
                      </div>
                    </div>
                    <span className="text-white/40 text-xs font-black">{count}/5</span>
                  </div>
                  <LevelMasteryBar count={count} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Buildings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[11px] font-black tracking-widest text-white/40">BUILDINGS</h3>
              <p className="text-[10px] text-white/25 mt-0.5">Each needs Foundation → Walls → Roof to complete</p>
            </div>
            <div className="flex gap-3">
              {LEVEL_META.map(lv => (
                <div key={lv.id} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: lv.color }} />
                  <span className="text-[10px] text-white/35 font-bold">{lv.name}</span>
                </div>
              ))}
            </div>
          </div>
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
        </div>

        {/* Suggestion + CTA */}
        <div className="space-y-3">
          {suggestion && (
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-4"
              style={{ background: "linear-gradient(135deg, #1e1a42 0%, #13102a 100%)", border: "1px solid rgba(124,111,247,0.3)" }}
            >
              <div>
                <div className="text-[10px] font-black tracking-widest text-[#7c6ff7] mb-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c6ff7] animate-pulse inline-block" />
                  SUGGESTED NEXT
                </div>
                <div className="font-black text-[15px] text-white">{suggestion}</div>
              </div>
              <button
                onClick={() => {
                  const match = BUILDINGS.find(b => suggestion.includes(b.name));
                  if (match) setSelectedBuilding(match.id);
                  setModalOpen(true);
                }}
                className="ml-4 flex items-center gap-1.5 px-5 py-2.5 bg-[#7c6ff7] rounded-xl font-black text-sm hover:bg-[#6c5fd7] hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(124,111,247,0.4)] flex-shrink-0"
              >
                Go <Flame size={14} />
              </button>
            </div>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-xl text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(124,111,247,0.4)] active:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)",
              backgroundSize: "200% auto",
              border: "2px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
            }}
          >
            <Construction size={22} />
            Start Building
          </button>
        </div>
      </main>

      <StartGameModal
        isModalOpen={modalOpen}
        handleModal={setModalOpen}
        preselectedBuilding={selectedBuilding}
      />
    </div>
  );
}
