import { SERVER_URL } from "@/app/CONSTANT";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const LEVELS = [
  {
    id: 1,
    badge: "Level 1",
    name: "Foundation",
    icon: "🧱",
    desc: "Print, variables & data types — the basics.",
    skills: ["print()", "input()", "Variables", "Data types"],
    borderColor: "#22c55e",
    badgeColor: "#22c55e",
  },
  {
    id: 2,
    badge: "Level 2",
    name: "Walls",
    icon: "🏗️",
    desc: "Logic & loops — make your code think.",
    skills: ["if / else", "for loops", "while loops", "Lists"],
    borderColor: "#f59e0b",
    badgeColor: "#f59e0b",
  },
  {
    id: 3,
    badge: "Level 3",
    name: "Roof",
    icon: "🏠",
    desc: "Functions — write reusable, clean code.",
    skills: ["def", "Parameters", "return", "Scope"],
    borderColor: "#ec4899",
    badgeColor: "#ec4899",
  },
];

const BUILDINGS = [
  { id: "library",     name: "Library",     emoji: "📚" },
  { id: "classroom",   name: "Classroom",   emoji: "🪑" },
  { id: "cafeteria",   name: "Cafeteria",   emoji: "🍽️" },
  { id: "science-lab", name: "Science Lab", emoji: "🧪" },
  { id: "playground",  name: "Playground",  emoji: "🏃" },
];

export default function StartGameModal({
  isModalOpen,
  handleModal,
  preselectedBuilding,
}: {
  isModalOpen: boolean;
  handleModal: Dispatch<SetStateAction<boolean>>;
  preselectedBuilding: string;
}) {
  const router = useRouter();
  const { updateState } = useGame();

  const [playMode, setPlayMode] = useState<"friend" | "ai" | "">("");
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  const canStart = playMode !== "" && selectedLevel !== 0;
  const selectedBuildingData = BUILDINGS.find((b) => b.id === preselectedBuilding);

  const handleClose = () => { setPlayMode(""); setSelectedLevel(0); handleModal(false); };

  const handleStartBuilding = async () => {
    if (!canStart) return;
    setLoading(true);
    try {
      const startStage = Math.max(1, BUILDINGS.findIndex((b) => b.id === preselectedBuilding) + 1);
      const endpoint = playMode === "ai" ? "/api/game/create-ai" : "/api/game/create";
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: AUTH.authHeaders(),
        body: JSON.stringify({ startStage, level: selectedLevel }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not create session."); return; }
      updateState({
        playerName: AUTH.getUsername(),
        sessionId: data.sessionId,
        role: data.role,
        currentStage: data.stage ?? startStage,
        level: (data.level ?? selectedLevel) as 1 | 2 | 3,
        completedStages: (data.stage ?? startStage) - 1,
        isAI: playMode === "ai",
      });
      router.push(playMode === "ai" ? "/game" : `/waiting?sessionId=${data.sessionId}&role=${data.role}`);
    } catch {
      alert("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []); // eslint-disable-line

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-11/12 max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl text-white anim-pop"
        style={{
          background: "linear-gradient(160deg, #1a1040 0%, #0d0b1e 100%)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-white/8">
          <div>
            <h2 className="text-xl font-black">Start Building</h2>
            {selectedBuildingData && (
              <p className="text-white/45 text-[13px] font-bold mt-0.5">
                {selectedBuildingData.emoji} {selectedBuildingData.name}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-white/50 hover:text-white text-lg transition-all"
          >
            ✕
          </button>
        </div>

        <div className="px-7 py-6 space-y-7">

          {/* ── Play Mode ── */}
          <div>
            <h3 className="text-[11px] font-black tracking-widest text-white/40 mb-3">HOW DO YOU WANT TO PLAY?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlayMode("friend")}
                className="rounded-2xl border-2 cursor-pointer p-5 text-left transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #3b1d8e 0%, #1e1255 100%)",
                  borderColor: playMode === "friend" ? "#7c6ff7" : "transparent",
                  boxShadow: playMode === "friend" ? "0 0 0 1px #7c6ff7, 0 4px 20px rgba(124,111,247,0.3)" : "none",
                }}
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="font-black text-[15px] mb-1">Play with a Friend</div>
                <p className="text-white/50 text-[12px] leading-snug">
                  Create a session, share your ID, and code together in real time.
                </p>
                {playMode === "friend" && (
                  <span className="mt-2 inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[#7c6ff7] text-white">Selected ✓</span>
                )}
              </button>

              <button
                onClick={() => setPlayMode("ai")}
                className="rounded-2xl border-2 cursor-pointer p-5 text-left transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #0d4a28 0%, #071a10 100%)",
                  borderColor: playMode === "ai" ? "#22c55e" : "transparent",
                  boxShadow: playMode === "ai" ? "0 0 0 1px #22c55e, 0 4px 20px rgba(34,197,94,0.2)" : "none",
                }}
              >
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-black text-[15px] mb-1">Play with AI</div>
                <p className="text-white/50 text-[12px] leading-snug">
                  No partner needed — the AI plays alongside you anytime, day or night.
                </p>
                {playMode === "ai" && (
                  <span className="mt-2 inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[#22c55e] text-black">Selected ✓</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Level ── */}
          <div>
            <h3 className="text-[11px] font-black tracking-widest text-white/40 mb-3">CHOOSE YOUR DIFFICULTY</h3>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((lv) => {
                const isSelected = selectedLevel === lv.id;
                return (
                  <button
                    key={lv.id}
                    onClick={() => setSelectedLevel(lv.id)}
                    className="rounded-2xl p-4 text-left transition-all border-2 hover:scale-[1.02]"
                    style={{
                      background: "#13102a",
                      borderColor: isSelected ? lv.borderColor : `${lv.borderColor}22`,
                      boxShadow: isSelected ? `0 0 0 1px ${lv.borderColor}, 0 4px 16px ${lv.borderColor}25` : "none",
                    }}
                  >
                    <div className="text-2xl mb-2">{lv.icon}</div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black mb-2 border border-[#1a1a1a]"
                      style={{ background: lv.badgeColor, color: "#000" }}
                    >
                      {lv.badge}
                    </span>
                    <div className="font-black text-[15px] mb-1">{lv.name}</div>
                    <p className="text-white/45 text-[11px] mb-2 leading-snug">{lv.desc}</p>
                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lv.skills.map(s => (
                        <span
                          key={s}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: `${lv.badgeColor}18`, color: lv.badgeColor }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Start Button ── */}
          <button
            onClick={handleStartBuilding}
            disabled={!canStart || loading}
            className="w-full py-4 rounded-2xl font-black text-[1.05rem] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: canStart
                ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                : "rgba(255,255,255,0.08)",
              border: canStart ? "2px solid rgba(255,255,255,0.15)" : "2px solid rgba(255,255,255,0.06)",
              color: "white",
              boxShadow: canStart ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
            }}
          >
            {loading
              ? "⏳ Creating Session..."
              : canStart
              ? `🚀 Let's Build — ${playMode === "ai" ? "Play with AI" : "Find a Partner"}!`
              : "Select a mode and level to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
