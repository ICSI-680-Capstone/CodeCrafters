"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { ActiveSession } from "@/types";
import { SERVER_URL } from "../CONSTANT";

export default function LobbyPage() {
  return (
    <Suspense>
      <LobbyPageInner />
    </Suspense>
  );
}

function LobbyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateState, resetState } = useGame();

  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [showJoinPanel, setShowJoinPanel] = useState(false);
  const [sessionInput, setSessionInput] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [inviteHandled, setInviteHandled] = useState(false);

  const inviteSessionId = (searchParams.get("sessionId") || AUTH.getPendingInviteSessionId() || "").trim().toUpperCase();

  useEffect(() => {
    if (!AUTH.isLoggedIn()) {
      if (inviteSessionId) {
        AUTH.setPendingInviteSessionId(inviteSessionId);
        router.replace(`/login?sessionId=${encodeURIComponent(inviteSessionId)}`);
      } else {
        router.replace("/login");
      }
      return;
    }
    setUsername(AUTH.getUsername() || "");
    const fetchActive = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/game/active`, { headers: AUTH.authHeaders() });
        if (res.ok) {
          const { session } = await res.json();
          if (session) setActiveSession(session);
        }
      } catch { /* ignore */ }
    };
    fetchActive();
  }, [router, inviteSessionId]);

  useEffect(() => {
    if (!inviteSessionId) return;
    setShowJoinPanel(true);
    setSessionInput(inviteSessionId);
    setStatus("Invite link detected — joining...");
  }, [inviteSessionId]);

  const handleLogout = () => { AUTH.clearAuth(); resetState(); router.push("/login"); };

  const handleCreate = async () => {
    setCreateLoading(true);
    setStatus("Creating your session...");
    try {
      const res = await fetch(`${SERVER_URL}/api/game/create`, { method: "POST", headers: AUTH.authHeaders() });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not create session."); setStatus(""); return; }
      updateState({
        playerName: AUTH.getUsername(),
        sessionId: data.sessionId,
        role: data.role,
        level: (data.level ?? 1) as 1 | 2 | 3,
      });
      router.push(`/waiting?sessionId=${data.sessionId}&role=${data.role}`);
    } catch {
      alert("Could not connect to server."); setStatus("");
    } finally { setCreateLoading(false); }
  };

  const handleJoin = async () => {
    const id = (sessionInput || inviteSessionId).trim().toUpperCase();
    if (!id || id.length < 6) { alert("Enter a valid session ID!"); return; }
    setJoinLoading(true);
    setStatus("Joining session...");
    try {
      const res = await fetch(`${SERVER_URL}/api/game/join`, {
        method: "POST", headers: AUTH.authHeaders(), body: JSON.stringify({ sessionId: id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not join session."); setStatus(""); return; }
      AUTH.clearPendingInviteSessionId();
      updateState({
        playerName: AUTH.getUsername(),
        sessionId: data.sessionId,
        role: data.role,
        currentStage: data.stage,
        level: (data.level ?? 1) as 1 | 2 | 3,
        completedStages: Math.max(0, (data.stage ?? 1) - 1),
      });
      router.push("/game");
    } catch {
      alert("Could not connect to server."); setStatus("");
    } finally { setJoinLoading(false); }
  };

  useEffect(() => {
    if (!inviteSessionId || inviteHandled || joinLoading) return;
    if (!AUTH.isLoggedIn()) return;
    if (activeSession?.id && activeSession.id !== inviteSessionId) {
      setInviteHandled(true);
      setStatus("You already have an active game. Rejoin it first.");
      return;
    }
    setInviteHandled(true);
    handleJoin();
  }, [inviteSessionId, inviteHandled, joinLoading, activeSession]); // eslint-disable-line

  const handleRejoin = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/game/join`, {
        method: "POST", headers: AUTH.authHeaders(), body: JSON.stringify({ sessionId: activeSession.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      updateState({
        playerName: AUTH.getUsername(),
        sessionId: activeSession.id,
        role: data.role,
        currentStage: data.stage,
        level: (data.level ?? 1) as 1 | 2 | 3,
        completedStages: Math.max(0, (data.stage ?? 1) - 1),
      });
      router.push("/game");
    } catch { alert("Could not reconnect."); }
  };

  const inputCls =
    "flex-1 bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white font-bold text-[0.9rem] outline-none placeholder:text-white/35 focus:border-[#fbbf24] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.15)] focus:bg-white/[0.12] transition-all duration-200";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url("/images/Background.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[rgba(8,4,25,0.82)] z-0" />

      {/* Lobby card */}
      <div
        className="relative z-10 rounded-3xl px-8 py-8 w-full max-w-[440px] text-white anim-pop"
        style={{
          background: "rgba(10,8,32,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: "0 12px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.7rem] text-white" style={{ fontFamily: "var(--font-display)" }}>
              Code<span className="text-[#fbbf24]">Crafters!</span>
            </h1>
            <p className="text-white/45 text-[12px] font-bold mt-0.5">Hey {username}! Ready to build? 🚀</p>
          </div>
          <button
            onClick={handleLogout}
            className="py-1.5 px-3 text-[11px] bg-white/8 text-white/60 border border-white/15 rounded-xl font-bold hover:bg-white/15 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        {/* Active session banner */}
        {activeSession && (
          <div
            className="rounded-2xl p-4 mb-5 text-sm"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" }}
          >
            <p className="text-white/80 font-bold mb-2.5 text-[13px]">
              🎮 You have an active game — Stage <strong className="text-[#22c55e]">{activeSession.stage}</strong>/5
              (ID: <strong className="text-white">{activeSession.id}</strong>)
            </p>
            <button
              onClick={handleRejoin}
              className="w-full py-2.5 bg-[#22c55e] text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-xl font-black text-[13px] cursor-pointer shadow-[var(--shadow-sm)] hover:-translate-y-0.5 transition-all"
            >
              ▶ Rejoin Game
            </button>
          </div>
        )}

        {/* Create / Join buttons */}
        <div className="space-y-3 mb-4">
          <button
            disabled={createLoading}
            onClick={handleCreate}
            className="w-full py-3.5 bg-[#7c3aed] text-white border-2 border-[#1a1a1a] rounded-2xl font-black text-[0.9rem] cursor-pointer shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:bg-[#6d28d9] hover:shadow-[5px_5px_0_#1a1a1a] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
          >
            {createLoading ? "Creating..." : "🆕 Create New Game"}
          </button>

          <button
            onClick={() => setShowJoinPanel((v) => !v)}
            className="w-full py-3.5 bg-white/8 text-white border border-white/20 rounded-2xl font-black text-[0.9rem] cursor-pointer hover:bg-white/[0.14] hover:-translate-y-0.5 transition-all"
          >
            {showJoinPanel ? "▲ Hide Join Panel" : "🔗 Join with Session ID"}
          </button>
        </div>

        {/* Join panel */}
        {showJoinPanel && (
          <div className="flex gap-2 mb-4 anim-slide-up">
            <input
              type="text"
              placeholder="Enter Session ID..."
              maxLength={8}
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className={inputCls}
            />
            <button
              disabled={joinLoading}
              onClick={handleJoin}
              className="flex-none py-3 px-5 bg-[#7c3aed] text-white border-2 border-[#1a1a1a] rounded-xl font-black text-[0.85rem] cursor-pointer shadow-[var(--shadow-sm)] hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-100"
            >
              {joinLoading ? "..." : "Join"}
            </button>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="mt-4 px-4 py-3 bg-white/[0.06] border border-white/10 rounded-xl text-[12px] text-white/55 font-bold flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "#7c6ff7", animation: "spin 0.8s linear infinite" }}
            />
            {status}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/8 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[12px] text-white/35 font-bold hover:text-white/65 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
