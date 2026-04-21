export const AUTH = {
  PENDING_INVITE_KEY: "cc_pending_invite_session",

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cc_token");
  },
  getUsername: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cc_username");
  },
  setAuth: (token: string, username: string): void => {
    localStorage.setItem("cc_token", token);
    localStorage.setItem("cc_username", username);
  },
  clearAuth: (): void => {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_username");
  },
  saveCredentials: (username: string, password: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cc_saved_username", username);
    localStorage.setItem("cc_saved_password", password);
  },
  clearSavedCredentials: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("cc_saved_username");
    localStorage.removeItem("cc_saved_password");
    localStorage.removeItem("cc_remember_me");
  },
  getSavedUsername: (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("cc_saved_username") || "";
  },
  getSavedPassword: (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("cc_saved_password") || "";
  },
  setRememberMe: (value: boolean): void => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem("cc_remember_me", "true");
    } else {
      localStorage.removeItem("cc_remember_me");
    }
  },
  isRemembered: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cc_remember_me") === "true";
  },
  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("cc_token");
  },
  authHeaders: (): Record<string, string> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("cc_token") : null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  },
  setPendingInviteSessionId: (sessionId: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cc_pending_invite_session", sessionId.toUpperCase());
  },
  getPendingInviteSessionId: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cc_pending_invite_session");
  },
  clearPendingInviteSessionId: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("cc_pending_invite_session");
  },
};
