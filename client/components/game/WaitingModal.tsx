"use client";

import { ChatMessage } from "@/types";

interface WaitingModalProps {
  messages: ChatMessage[];
}

const ENCOURAGEMENTS = [
  "Great work! You nailed it!",
  "Your partner is almost there...",
  "Teamwork makes the dream work!",
  "Python master in the making 🐍",
];

export default function WaitingModal({ messages }: WaitingModalProps) {
  const encouragement = ENCOURAGEMENTS[Math.floor(Date.now() / 1000) % ENCOURAGEMENTS.length];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div
        className="relative rounded-3xl py-7 px-7 max-w-[400px] w-[92%] text-white anim-pop"
        style={{
          background: "linear-gradient(160deg, #1a1040 0%, #0d0b1e 100%)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <h2
          className="text-center text-[1.2rem] mb-1"
          style={{ fontFamily: "var(--font-display)", color: "#22c55e" }}
        >
          ✅ You're done!
        </h2>
        <p className="text-center text-white/45 text-[12px] font-bold mb-5">
          {encouragement}
        </p>

        {/* Status rows */}
        <div
          className="rounded-2xl p-4 mb-4 space-y-2.5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3 text-[13px] font-black">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-[#22c55e] bg-[#22c55e]"
            />
            <span className="text-[#22c55e]">YOU</span>
            <span className="ml-auto text-[#22c55e] text-[11px]">READY ✓</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] font-black">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 border-[3px] border-t-[#f97316]"
              style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "#f97316", animation: "spin 0.9s linear infinite" }}
            />
            <span className="text-white/50">PARTNER</span>
            <span className="ml-auto text-white/30 text-[11px]">WORKING...</span>
          </div>
        </div>

        {/* Mini chat log */}
        {messages.length > 0 && (
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[10px] font-black tracking-widest text-white/30 mb-2">CHAT</p>
            <div className="max-h-[80px] overflow-y-auto flex flex-col gap-1 text-[0.72rem]">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-1.5">
                  {!m.isSystem && (
                    <span className="text-[#7c6ff7] font-black flex-shrink-0">{m.sender}:</span>
                  )}
                  <span className={`font-bold leading-snug ${m.isSystem ? "text-white/35 italic" : "text-white/65"}`}>
                    {m.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#7c6ff7]/50"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
