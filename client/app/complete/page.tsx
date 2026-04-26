"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import dynamic from "next/dynamic";

const CampusCanvas = dynamic(() => import("@/components/campus/CampusCanvas"), { ssr: false });

function StarDisplay({ score }: { score: number }) {
  const stars = score >= 450 ? 3 : score >= 300 ? 2 : 1;
  return (
    <div className="flex justify-center gap-2 mb-2">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className="text-5xl transition-all"
          style={{
            filter: i <= stars ? "drop-shadow(0 0 8px #fbbf24)" : "none",
            opacity: i <= stars ? 1 : 0.15,
            animation: i <= stars ? `pop ${0.3 + i * 0.15}s cubic-bezier(.26,1.3,.6,1) both` : "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Achievement({ icon, label, earned }: { icon: string; label: string; earned: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
      style={{
        background: earned ? "rgba(124,111,247,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${earned ? "rgba(124,111,247,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: earned ? "#fff" : "rgba(255,255,255,0.25)",
      }}
    >
      <span className="text-lg" style={{ filter: earned ? "none" : "grayscale(1)", opacity: earned ? 1 : 0.4 }}>
        {icon}
      </span>
      <span className={earned ? "text-white/90" : "text-white/25"}>{label}</span>
      {earned && <span className="ml-auto text-[#22c55e] text-xs font-black">✓</span>}
    </div>
  );
}

export default function CompletePage() {
  const router = useRouter();
  const { state } = useGame();

  useEffect(() => {
    if (!AUTH.isLoggedIn()) router.replace("/login");
  }, [router]);

  const score = state.score ?? 0;
  const stars = score >= 450 ? 3 : score >= 300 ? 2 : 1;

  const rankLabel =
    stars === 3 ? "Python Legend! 🐍" :
    stars === 2 ? "Campus Builder! 🏗️" :
    "Rising Coder! ⚡";

  const rankMsg =
    stars === 3 ? "Perfect run — you absolutely crushed it!" :
    stars === 2 ? "Great teamwork! A few more XP for the top!" :
    "You built a campus! Keep playing to level up.";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(160deg, #0d0b1e 0%, #1a0a2e 50%, #0d0b1e 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full bg-[#fbbf24]/8 blur-3xl pointer-events-none" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-xl rounded-3xl overflow-hidden text-white anim-pop"
        style={{
          background: "rgba(13,11,30,0.9)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Gold header bar */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.12) 0%, transparent 100%)" }}
        >
          <div className="text-5xl mb-2 anim-celebrate">🎉</div>
          <h1
            className="text-[2rem] text-white mb-1"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 0 30px rgba(251,191,36,0.4)" }}
          >
            Campus Complete!
          </h1>
          <p className="text-white/50 text-sm font-bold">
            You and your partner built the entire school with Python!
          </p>
        </div>

        {/* Stars */}
        <div className="px-8 pb-4 text-center">
          <StarDisplay score={score} />
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-1"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            {rankLabel}
          </div>
          <p className="text-white/40 text-[12px] font-bold">{rankMsg}</p>
        </div>

        {/* Score */}
        <div className="mx-8 mb-5 rounded-2xl px-6 py-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] font-black tracking-widest text-white/40 mb-1">FINAL SCORE</p>
          <p className="text-5xl font-black" style={{ color: "#7c6ff7", textShadow: "0 0 20px rgba(124,111,247,0.4)" }}>
            {score}
          </p>
          <p className="text-white/30 text-[11px] font-bold mt-1">out of 500 XP</p>
        </div>

        {/* Campus render */}
        <div className="mx-8 mb-5 rounded-2xl overflow-hidden" style={{ height: 220, border: "2px solid rgba(255,255,255,0.1)" }}>
          <CampusCanvas
            completedStages={5}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Achievements */}
        <div className="mx-8 mb-6">
          <p className="text-[10px] font-black tracking-widest text-white/35 mb-2">ACHIEVEMENTS UNLOCKED</p>
          <div className="grid grid-cols-2 gap-2">
            <Achievement icon="🏗️" label="Built 5 buildings" earned={true} />
            <Achievement icon="🐍" label="Python coder" earned={true} />
            <Achievement icon="🤝" label="Team player" earned={true} />
            <Achievement icon="⭐" label="Perfect score" earned={score >= 450} />
          </div>
        </div>

        {/* CTAs */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white/70 border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/lobby")}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              border: "2px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
