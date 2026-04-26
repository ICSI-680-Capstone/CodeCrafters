"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH } from "@/lib/auth";
import { useGame } from "@/lib/game-context";
import { SERVER_URL } from "@/app/CONSTANT";
import {
  Layers, Hammer, Terminal, Trophy, Bot,
  KeyRound, UserPlus, User, Lock, Rocket,
  AlertCircle, Play,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetState } = useGame();
  const [tab, setTab] = useState<"login" | "register">("login");

  const inviteSessionId = (searchParams.get("sessionId") || AUTH.getPendingInviteSessionId() || "").trim().toUpperCase();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (AUTH.isRemembered()) {
      setLoginUsername(AUTH.getSavedUsername());
      setLoginPassword(AUTH.getSavedPassword());
      setRememberMe(true);
    }
  }, []);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async () => {
    setLoginError("");
    if (!loginUsername || !loginPassword) { setLoginError("Please fill in all fields."); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "Login failed."); return; }
      AUTH.setAuth(data.token, data.username);
      if (rememberMe) { AUTH.saveCredentials(loginUsername, loginPassword); AUTH.setRememberMe(true); }
      else AUTH.clearSavedCredentials();
      resetState();
      if (inviteSessionId) {
        AUTH.setPendingInviteSessionId(inviteSessionId);
        router.push(`/lobby?sessionId=${encodeURIComponent(inviteSessionId)}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setLoginError("Could not connect to server.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegError("");
    if (!regUsername || !regPassword) { setRegError("Please fill in all fields."); return; }
    setRegLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setRegError(data.error || "Registration failed."); return; }
      AUTH.setAuth(data.token, data.username);
      resetState();
      if (inviteSessionId) {
        AUTH.setPendingInviteSessionId(inviteSessionId);
        router.push(`/lobby?sessionId=${encodeURIComponent(inviteSessionId)}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setRegError("Could not connect to server.");
    } finally {
      setRegLoading(false);
    }
  };

  const inputCls =
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold text-[0.95rem] outline-none placeholder:text-white/40 focus:border-[#fbbf24] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.18)] focus:bg-white/[0.18] transition-all duration-200";

  const features = [
    { Icon: Layers,   text: "Play as Architect or Builder", sub: "Two roles, one team" },
    { Icon: Terminal, text: "Learn Python step by step",    sub: "From print() to functions" },
    { Icon: Trophy,   text: "5 buildings · 500 XP total",  sub: "Library to Playground" },
    { Icon: Bot,      text: "AI Tutor gives you hints",     sub: "Never get stuck alone" },
  ];

  return (
    <div className="flex w-full h-screen min-h-screen overflow-hidden relative">
      {/* LEFT — hero image */}
      <div
        className="flex-none max-w-[72%] self-stretch shrink-0 border-r border-white/10 min-h-screen relative overflow-hidden bg-[#0d0a1e]"
        style={{ width: "calc(100vh * 16 / 9)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/images/Background.jpeg")',
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d0a1e]/80 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-3 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-white/80 text-sm font-bold">Learn while you build</span>
          </div>
          <p
            className="text-white text-3xl leading-tight drop-shadow-lg"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            Code your school.<br />
            <span className="text-[#fbbf24]">One building at a time.</span>
          </p>
        </div>
      </div>

      {/* RIGHT — dark auth panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto relative z-10"
        style={{ background: "linear-gradient(160deg, #1a0a2e 0%, #2d1069 50%, #1a0a2e 100%)" }}
      >
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#7c3aed]/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-16 left-6 w-24 h-24 rounded-full bg-[#fbbf24]/10 blur-2xl pointer-events-none" />

        <div className="w-full max-w-[340px] relative z-10">
          {/* Brand */}
          <div className="mb-5">
            <h1
              className="text-[38px] text-white leading-none mb-1"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 3px 24px rgba(124,58,237,0.6)" }}
            >
              Code<span className="text-[#fbbf24]">Crafters!</span>
            </h1>
            <p className="text-white/60 text-[13px] font-bold">
              The Python game where you build a whole school
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-2 mb-5">
            {features.map(({ Icon, text, sub }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-xl px-3.5 py-2.5 hover:bg-white/[0.12] hover:translate-x-1 transition-all duration-150 cursor-default"
              >
                <Icon size={18} className="flex-shrink-0 text-[#a78bfa]" />
                <div>
                  <p className="text-white text-[12.5px] font-extrabold leading-tight">{text}</p>
                  <p className="text-white/40 text-[11px] font-bold">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Role badges */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-[#fbbf24] border-2 border-white/30 rounded-xl py-2 text-[12px] font-black text-[#1a1a1a]">
              <Layers size={14} />
              Architect
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-[#7c3aed] border-2 border-[#1a1a1a] rounded-xl py-2 text-[12px] font-black text-white">
              <Hammer size={14} />
              Builder
            </div>
          </div>

          {/* Auth box */}
          <div className="bg-white/[0.07] border border-white/15 rounded-2xl px-5 py-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); t === "login" ? setLoginError("") : setRegError(""); }}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13.5px] font-black cursor-pointer border-2 transition-all duration-150",
                    tab === t
                      ? "bg-[#7c3aed] text-white border-[#7c3aed] shadow-[0_2px_12px_rgba(124,58,237,0.5)]"
                      : "bg-white/[0.07] text-white/55 border-white/15 hover:bg-white/[0.13] hover:text-white",
                  ].join(" ")}
                >
                  {t === "login"
                    ? <><KeyRound size={13} /> Login</>
                    : <><UserPlus size={13} /> Sign Up</>}
                </button>
              ))}
            </div>

            {/* Login Form */}
            {tab === "login" && (
              <div className="anim-slide-up">
                <p className="text-[19px] font-black text-white mb-0.5">Welcome back!</p>
                <p className="text-[12px] text-white/50 font-bold mb-4">Pick up right where you left off</p>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Username"
                      maxLength={24}
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className={inputCls + " pl-9"}
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className={inputCls + " pl-9 pr-16"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/90 text-[12px] font-bold transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#7c3aed] cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-[12px] text-white/55 font-bold cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <button
                  disabled={loginLoading}
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#7c3aed] text-white border-2 border-[#1a1a1a] rounded-xl font-black text-[0.9rem] cursor-pointer shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a] hover:bg-[#6d28d9] active:translate-y-px active:shadow-[2px_2px_0_#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-100"
                >
                  <Play size={14} className={loginLoading ? "hidden" : ""} />
                  {loginLoading ? "Logging in..." : "Play Now"}
                </button>
                {loginError && (
                  <div className="mt-3 flex items-center gap-2 text-[#ff6b6b] text-[0.82rem] font-extrabold bg-red-500/15 border border-red-400/30 rounded-lg px-3 py-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {loginError}
                  </div>
                )}
              </div>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <div className="anim-slide-up">
                <p className="text-[19px] font-black text-white mb-0.5">Join for free!</p>
                <p className="text-[12px] text-white/50 font-bold mb-4">No credit card needed — just code</p>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Choose a username"
                      maxLength={24}
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      className={inputCls + " pl-9"}
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password (min 6 chars)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      className={inputCls + " pl-9 pr-16"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/90 text-[12px] font-bold transition-colors"
                      tabIndex={-1}
                    >
                      {showRegPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  disabled={regLoading}
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#7c3aed] text-white border-2 border-[#1a1a1a] rounded-xl font-black text-[0.9rem] cursor-pointer shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1a1a1a] hover:bg-[#6d28d9] active:translate-y-px active:shadow-[2px_2px_0_#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-100"
                >
                  <Rocket size={14} className={regLoading ? "hidden" : ""} />
                  {regLoading ? "Creating account..." : "Start Building Free"}
                </button>
                {regError && (
                  <div className="mt-3 flex items-center gap-2 text-[#ff6b6b] text-[0.82rem] font-extrabold bg-red-500/15 border border-red-400/30 rounded-lg px-3 py-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {regError}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-white/30 text-[11px] font-bold mt-4">
            Trusted by students learning Python
          </p>
        </div>
      </div>
    </div>
  );
}
