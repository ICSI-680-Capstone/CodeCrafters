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

const BUILDINGS = [
  { id: "library", name: "Library", emoji: "📚" },
  { id: "classroom", name: "Classroom", emoji: "🪑" },
  { id: "cafeteria", name: "Cafeteria", emoji: "🍽️" },
  { id: "science-lab", name: "Science Lab", emoji: "🧪" },
  { id: "playground", name: "Playground", emoji: "🏃" },
];

export default function StartGameModal({
  isModalOpen,
  handleModal,
}: {
  isModalOpen: boolean;
  handleModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { updateState } = useGame();

  const [playMode, setPlayMode] = useState<"friend" | "ai" | "">("");
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [loading, setLoading] = useState(false);

  const canStart = playMode !== "" && selectedBuilding !== "" && selectedLevel !== 0;

  const handleClose = () => {
    setPlayMode("");
    setSelectedLevel(0);
    setSelectedBuilding("");
    handleModal(false);
  };

  const handleStartBuilding = async () => {
    if (!canStart) return;
    setLoading(true);
    try {
      const startStage = Math.max(
        1,
        BUILDINGS.findIndex((b) => b.id === selectedBuilding) + 1,
      );

      const endpoint =
        playMode === "ai" ? "/api/game/create-ai" : "/api/game/create";

      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "POST",
        headers: AUTH.authHeaders(),
        body: JSON.stringify({ startStage, level: selectedLevel }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not create session.");
        return;
      }
      updateState({
        playerName: AUTH.getUsername(),
        sessionId: data.sessionId,
        role: data.role,
        currentStage: data.stage ?? startStage,
        level: (data.level ?? selectedLevel) as 1 | 2 | 3,
        completedStages: (data.stage ?? startStage) - 1,
      });
      router.push(
        playMode === "ai"
          ? "/game"
          : `/waiting?sessionId=${data.sessionId}&role=${data.role}`,
      );
    } catch {
      alert("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <div
      className={`${isModalOpen ? "" : "hidden"} fixed inset-0 flex justify-center items-center z-50 bg-black/70`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-10/12 max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-[#0d0b1e] text-white space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Start Building</h2>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white text-2xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Partner ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
            HOW DO YOU WANT TO PLAY?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPlayMode("friend")}
              className="rounded-2xl border-2 cursor-pointer p-5 text-left transition-all"
              style={{
                background: "linear-gradient(135deg, #3b1d8e 0%, #1e1255 100%)",
                borderColor: playMode === "friend" ? "#7c6ff7" : "transparent",
              }}
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-black text-base mb-1">Play with a friend</div>
              <p className="text-white/65 text-sm">
                Get matched with another student picking the same building and level.
              </p>
            </button>

            <button
              onClick={() => setPlayMode("ai")}
              className="rounded-2xl border-2 cursor-pointer p-5 text-left transition-all"
              style={{
                background: "linear-gradient(135deg, #0d4a28 0%, #071a10 100%)",
                borderColor: playMode === "ai" ? "#22c55e" : "transparent",
              }}
            >
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-black text-base mb-1">Play with AI</div>
              <p className="text-white/65 text-sm">
                No partner needed. An AI buddy plays alongside you anytime.
              </p>
            </button>
          </div>
        </div>

        {/* ── Building ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
            CHOOSE A BUILDING
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {BUILDINGS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuilding(b.id)}
                className="bg-[#13102a] rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-[#1c1840]"
                style={{
                  outline: selectedBuilding === b.id
                    ? "2px solid #f59e0b"
                    : "2px solid transparent",
                }}
              >
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-sm font-bold">{b.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Level ── */}
        <div>
          <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
            CHOOSE YOUR LEVEL
          </h3>
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

        {/* ── Start Button ── */}
        <button
          onClick={handleStartBuilding}
          disabled={!canStart || loading}
          className="w-full py-4 bg-[#7c6ff7] border border-white/20 rounded-2xl font-black text-lg hover:bg-[#6c5fd7] hover:border-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Session..." : canStart ? "Start Building" : "Select all options to continue"}
        </button>
      </div>
    </div>
  );
}
