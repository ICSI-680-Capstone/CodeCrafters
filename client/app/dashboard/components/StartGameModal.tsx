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

  const handleStartBuilding = async () => {
    setLoading(true);
    try {
      // Map the selected building → its stage number (1..5) in STAGES.
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
      // AI games skip the waiting room — go straight to the game
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
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setPlayMode("");
      setSelectedLevel(0);
      setSelectedBuilding("");
      handleModal(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);
  console.log(playMode, selectedBuilding, selectedLevel);
  return (
    <div
      className={`${isModalOpen ? "" : "hidden"} fixed top-0 right-0 flex justify-center items-center w-screen h-screen bg-gray-400/70`}
    >
      <div className="w-10/12 min-h-1/4 p-8 rounded-2xl bg-[#0d0b1e] text-white">
        {/* ── Play mode ── */}
        {playMode == "" && (
          <div>
            <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
              HOW DO YOU WANT TO PLAY?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Friend */}
              <button
                onClick={() => setPlayMode("friend")}
                className="rounded-2xl border-2 border-transparent hover:border-[#7c6ff7] cursor-pointer p-6 text-left transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #3b1d8e 0%, #1e1255 100%)",
                }}
              >
                <div className="text-3xl mb-3">👥</div>
                <div className="font-black text-lg mb-1">
                  Play with a friend
                </div>
                <p className="text-white/65 text-sm mb-5">
                  Get matched with another student picking the same building and
                  level. Chat, code, and build together.
                </p>
                <span className="inline-block px-5 py-2 rounded-xl font-black text-sm bg-[#1a1040]">
                  Find a partner
                </span>
              </button>

              {/* AI */}
              <button
                onClick={() => setPlayMode("ai")}
                className="rounded-2xl border-2 border-transparent hover:border-[#22c55e] cursor-pointer p-6 text-left transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #0d4a28 0%, #071a10 100%)",
                }}
              >
                <div className="text-3xl mb-3">🤖</div>
                <div className="font-black text-lg mb-1">Play with AI</div>
                <p className="text-white/65 text-sm mb-5">
                  No partner needed. An AI buddy plays alongside you so you can
                  practice anytime.
                </p>
                <span className="inline-block px-5 py-2 rounded-xl font-black text-sm bg-[#071a10]">
                  Play with AI
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Building Choices── */}
        {playMode && !selectedBuilding && (
          <div>
            <h3 className="text-[11px] font-black tracking-widest text-white/60 mb-3">
              CHOOSE A BUILDING
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {BUILDINGS.map((b) => {
                const isSelected = selectedBuilding === b.id;

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
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Levels ── */}
        {playMode && selectedBuilding && (
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
                      borderColor: isSelected
                        ? lv.borderColor
                        : `${lv.borderColor}33`,
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
            {/* ── Start Game Button ── */}
            <button
              onClick={handleStartBuilding}
              disabled={loading}
              className="w-full my-4 py-4 bg-[#13102a] border border-white/20 rounded-2xl font-black text-lg hover:bg-[#1c1840] hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Session..." : "Start Building"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
