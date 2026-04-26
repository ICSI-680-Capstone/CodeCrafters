"use client";

import { STAGES } from "@/lib/stages";
import { Trophy, Zap, Sparkles, BookOpen, GraduationCap, Utensils, FlaskConical, Activity, type LucideIcon } from "lucide-react";

interface StageCompleteModalProps {
  completedStage: number;
  score: number;
  onNext: () => void;
}

const STAGE_ICONS: LucideIcon[] = [BookOpen, GraduationCap, Utensils, FlaskConical, Activity];
const XP_PER_STAGE = 100;

export default function StageCompleteModal({ completedStage, score, onNext }: StageCompleteModalProps) {
  const building = STAGES[completedStage - 1]?.building || "Building";
  const isLastStage = completedStage === 5;
  const progressPct = Math.round((completedStage / 5) * 100);
  const StageIcon = STAGE_ICONS[completedStage - 1] ?? BookOpen;
  const CelebIcon = isLastStage ? Trophy : Zap;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div
        className="relative rounded-3xl py-8 px-8 max-w-[420px] w-[92%] text-center text-white anim-pop"
        style={{
          background: "linear-gradient(160deg, #1a1040 0%, #0d0b1e 100%)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,111,247,0.2)",
        }}
      >
        {/* Celebration icon */}
        <CelebIcon
          size={48}
          className="mx-auto mb-2 anim-celebrate"
          style={{
            color: isLastStage ? "#fbbf24" : "#22c55e",
            filter: `drop-shadow(0 0 16px ${isLastStage ? "#fbbf2488" : "#22c55e88"})`,
          }}
        />

        {/* Title */}
        <h2
          className="text-[1.5rem] mb-1"
          style={{ fontFamily: "var(--font-display)", color: isLastStage ? "#fbbf24" : "#22c55e" }}
        >
          {isLastStage ? "Campus Built!" : `Stage ${completedStage} Done!`}
        </h2>

        {/* Building name */}
        <div className="flex items-center justify-center gap-1.5 text-white/50 text-sm font-bold mb-5">
          <StageIcon size={14} />
          {building} complete
        </div>

        {/* XP pill */}
        <div className="flex justify-center mb-5">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
          >
            <Sparkles size={14} />
            +{XP_PER_STAGE} XP earned!
          </span>
        </div>

        {/* Progress */}
        <div
          className="rounded-2xl px-5 py-4 mb-5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-black tracking-widest text-white/40">CAMPUS PROGRESS</span>
            <span className="text-[11px] font-black text-[#7c6ff7]">{completedStage}/5 stages</span>
          </div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #7c6ff7, #22c55e)" }}
            />
          </div>
          {/* Stage icons */}
          <div className="flex justify-between mt-1">
            {STAGE_ICONS.map((Icon, i) => (
              <Icon
                key={i}
                size={18}
                style={{
                  opacity: i < completedStage ? 1 : 0.2,
                  color: i < completedStage ? "#7c6ff7" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/8 flex justify-between items-center">
            <span className="text-[11px] text-white/40 font-bold">Team Score</span>
            <span className="text-[#7c6ff7] font-black text-lg">{score} XP</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-base text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(124,111,247,0.5)] active:translate-y-0"
          style={{
            background: isLastStage
              ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
              : "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "2px solid rgba(255,255,255,0.15)",
            color: isLastStage ? "#1a1a1a" : "white",
          }}
        >
          {isLastStage
            ? <><Trophy size={18} /> See Final Results!</>
            : <>Next Stage <Zap size={16} /></>}
        </button>
      </div>
    </div>
  );
}
