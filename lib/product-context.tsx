"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ActivityStep, AssistantResponse, Bookmark, ChatTurn, HotelResult, Reservation, SearchContext } from "@/lib/models";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthState = "loading" | "anonymous" | "authenticated";

type ProductValue = {
  authState: AuthState;
  user: User | null;
  authError: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  turns: ChatTurn[];
  activity: ActivityStep[];
  busy: boolean;
  sendMessage: (message: string, options?: { fresh?: boolean }) => Promise<void>;
  retryMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
  startFlow: (kind?: string, prompt?: string) => Promise<void>;
  reservations: Reservation[];
  bookmarks: Bookmark[];
  dataLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  createReservation: (hotel: HotelResult, context: SearchContext) => Promise<Reservation>;
  cancelReservation: (id: string) => Promise<Reservation>;
  reactivateReservation: (id: string) => Promise<Reservation>;
  toggleBookmark: (hotel: HotelResult) => Promise<void>;
  isBookmarked: (hotelKey: string) => boolean;
};

const ProductContext = createContext<ProductValue | null>(null);
export function ProductProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [activity, setActivity] = useState<ActivityStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let active = true;
    void (async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !sessionData.session) {
        setSession(null);
        setAuthState("anonymous");
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
      if (!active) return;
      if (!userError && userData.user) {
        setSession(sessionData.session);
        setAuthState("authenticated");
        return;
      }

      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (!active) return;
      if (refreshError || !refreshed.session) {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setAuthState("anonymous");
        return;
      }
      setSession(refreshed.session);
      setAuthState("authenticated");
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthState(nextSession ? "authenticated" : "anonymous");
      if (!nextSession) {
        setReservations([]);
        setBookmarks([]);
        setTurns([]);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const token = useCallback(async (forceRefresh = false) => {
    const supabase = createBrowserSupabaseClient();
    const result = forceRefresh ? await supabase.auth.refreshSession() : await supabase.auth.getSession();
    let nextSession = result.data.session;
    if (!forceRefresh && nextSession?.expires_at && nextSession.expires_at * 1000 <= Date.now() + 30_000) {
      const refreshed = await supabase.auth.refreshSession();
      nextSession = refreshed.data.session;
      if (refreshed.error) throw new Error("Your session expired. Please sign in again.");
    }
    if (result.error || !nextSession?.access_token) throw new Error("Please sign in to continue.");
    return nextSession.access_token;
  }, []);

  const authFetch = useCallback(async (url: string, init?: RequestInit) => {
    const request = async (accessToken: string) => {
      const headers = new Headers(init?.headers);
      if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
      headers.set("Authorization", `Bearer ${accessToken}`);
      return fetch(url, { ...init, headers, cache: "no-store", credentials: "same-origin" });
    };

    let response = await request(await token());
    if (response.status === 401) {
      try {
        response = await request(await token(true));
      } catch {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setAuthState("anonymous");
        throw new Error("Your session expired. Please sign in again.");
      }
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error || `StayAI returned ${response.status}.`);
    }
    return response;
  }, [token]);

  const refreshData = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const [reservationResponse, bookmarkResponse] = await Promise.all([
        authFetch("/api/reservations"),
        authFetch("/api/bookmarks"),
      ]);
      const reservationPayload = await reservationResponse.json() as { reservations: Reservation[] };
      const bookmarkPayload = await bookmarkResponse.json() as { bookmarks: Bookmark[] };
      setReservations(reservationPayload.reservations);
      setBookmarks(bookmarkPayload.bookmarks);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Your saved stays could not be loaded.");
    } finally { setDataLoading(false); }
  }, [authFetch, session]);

  useEffect(() => { if (authState === "authenticated") void refreshData(); }, [authState, refreshData]);

  const login = useCallback(async (username: string, password: string) => {
    setAuthError(null);
    if (username.trim().toUpperCase() !== "IO-DEMO") {
      setAuthError("Use the assigned StayAI demo account.");
      return false;
    }
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null) as { accessToken?: string; refreshToken?: string; error?: string } | null;
    if (!response.ok || !payload?.accessToken || !payload.refreshToken) {
      setAuthError(payload?.error || "Those details were not recognised.");
      return false;
    }
    const { data, error } = await createBrowserSupabaseClient().auth.setSession({ access_token: payload.accessToken, refresh_token: payload.refreshToken });
    if (error || !data.session) {
      setAuthError("The session could not be opened. Please try again.");
      return false;
    }
    setSession(data.session);
    setAuthState("authenticated");
    return true;
  }, []);

  const logout = useCallback(async () => {
    await createBrowserSupabaseClient().auth.signOut();
    setSession(null);
    setAuthState("anonymous");
  }, []);

  const sendMessage = useCallback(async (message: string, options?: { fresh?: boolean }) => {
    const clean = message.trim();
    if (!clean || busy) return;
    const userTurn: ChatTurn = { id: crypto.randomUUID(), role: "user", text: clean };
    const history = options?.fresh ? [] : turns;
    setTurns((current) => options?.fresh ? [userTurn] : [...current, userTurn]);
    setBusy(true);
    setActivity([{ id: crypto.randomUUID(), label: "Understanding your request", state: "active" }]);
    try {
      const response = await authFetch("/api/stayai/chat", { method: "POST", body: JSON.stringify({ message: clean, history }) });
      const reader = response.body?.getReader();
      if (!reader) throw new Error("StayAI returned no response stream.");
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResponse: AssistantResponse | null = null;
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: string; label?: string; response?: AssistantResponse; error?: string };
          if (event.type === "status" && event.label) {
            setActivity((current) => [...current.map((step) => ({ ...step, state: "complete" as const })), { id: crypto.randomUUID(), label: event.label!, state: "active" }]);
          } else if (event.type === "final" && event.response) finalResponse = event.response;
          else if (event.type === "error") throw new Error(event.error || "StayAI could not answer.");
        }
        if (done) break;
      }
      if (!finalResponse) throw new Error("StayAI did not finish its reply.");
      setTurns((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: finalResponse!.reply, response: finalResponse! }]);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "StayAI could not answer.";
      setTurns((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: messageText, isError: true, failedMessage: clean }]);
    } finally {
      setActivity([]);
      setBusy(false);
    }
  }, [authFetch, busy, turns]);

  const createReservation = useCallback(async (hotel: HotelResult, context: SearchContext) => {
    const response = await authFetch("/api/reservations", { method: "POST", body: JSON.stringify({ hotel, context }) });
    const payload = await response.json() as { reservation: Reservation };
    setReservations((current) => [payload.reservation, ...current]);
    return payload.reservation;
  }, [authFetch]);

  const cancelReservation = useCallback(async (id: string) => {
    const response = await authFetch(`/api/reservations/${id}/cancel`, { method: "POST", body: "{}" });
    const payload = await response.json() as { reservation: Reservation };
    setReservations((current) => current.map((item) => item.id === id ? payload.reservation : item));
    return payload.reservation;
  }, [authFetch]);

  const reactivateReservation = useCallback(async (id: string) => {
    const response = await authFetch(`/api/reservations/${id}/reactivate`, { method: "POST", body: "{}" });
    const payload = await response.json() as { reservation: Reservation };
    setReservations((current) => current.map((item) => item.id === id ? payload.reservation : item));
    return payload.reservation;
  }, [authFetch]);

  const toggleBookmark = useCallback(async (hotel: HotelResult) => {
    setDataError(null);
    const existing = bookmarks.find((item) => item.hotelKey === hotel.hotelKey);
    if (existing) {
      setBookmarks((current) => current.filter((item) => item.hotelKey !== hotel.hotelKey));
      try {
        await authFetch("/api/bookmarks", { method: "DELETE", body: JSON.stringify({ hotelKey: hotel.hotelKey }) });
      } catch (error) {
        setBookmarks((current) => [existing, ...current.filter((item) => item.hotelKey !== hotel.hotelKey)]);
        setDataError(error instanceof Error ? error.message : "The saved stay could not be updated.");
      }
    } else {
      const temporary: Bookmark = { id: `pending-${crypto.randomUUID()}`, hotelKey: hotel.hotelKey, hotel, createdAt: new Date().toISOString() };
      setBookmarks((current) => [temporary, ...current.filter((item) => item.hotelKey !== hotel.hotelKey)]);
      try {
        const response = await authFetch("/api/bookmarks", { method: "POST", body: JSON.stringify({ hotel }) });
        const payload = await response.json() as { bookmark: Bookmark };
        setBookmarks((current) => [payload.bookmark, ...current.filter((item) => item.hotelKey !== hotel.hotelKey)]);
      } catch (error) {
        setBookmarks((current) => current.filter((item) => item.hotelKey !== hotel.hotelKey));
        setDataError(error instanceof Error ? error.message : "The saved stay could not be updated.");
      }
    }
  }, [authFetch, bookmarks]);

  const clearConversation = useCallback(() => { setTurns([]); setActivity([]); }, []);
  const startFlow = useCallback(async (_kind?: string, prompt?: string) => {
    if (prompt) sessionStorage.setItem("stayai_pending_prompt", prompt);
    window.location.assign("/assistant");
  }, []);

  const value = useMemo<ProductValue>(() => ({
    authState, user: session?.user || null, authError, login, logout,
    turns, activity, busy, sendMessage, retryMessage: sendMessage, clearConversation, startFlow,
    reservations, bookmarks, dataLoading, dataError, refreshData, createReservation, cancelReservation, reactivateReservation,
    toggleBookmark, isBookmarked: (hotelKey) => bookmarks.some((item) => item.hotelKey === hotelKey),
  }), [authState, session, authError, login, logout, turns, activity, busy, sendMessage, clearConversation, startFlow, reservations, bookmarks, dataLoading, dataError, refreshData, createReservation, cancelReservation, reactivateReservation, toggleBookmark]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) throw new Error("useProduct must be used inside ProductProvider");
  return value;
}
