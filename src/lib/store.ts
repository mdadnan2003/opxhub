// Tiny in-memory client store for the wireframe (resets on reload — no backend).
import { useSyncExternalStore } from "react";
import { initialPosts, type Post } from "./mock-data";

type State = {
  posts: Post[];
  liked: Set<string>;
  saved: Set<string>;
  savedOpps: Set<string>;
  connected: Set<string>;
  pending: Set<string>;
  joined: Set<string>;
};

let state: State = {
  posts: initialPosts,
  liked: new Set(),
  saved: new Set(["p2"]),
  savedOpps: new Set(),
  connected: new Set(["meera", "kabir"]),
  pending: new Set(),
  joined: new Set(["web-dev", "iitm-bs"]),
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setState(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  emit();
}
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => sel(state),
    () => sel(state),
  );
}
export function toggleIn(key: "liked" | "saved" | "savedOpps" | "connected" | "pending" | "joined", id: string) {
  setState((s) => {
    const next = new Set(s[key]);
    next.has(id) ? next.delete(id) : next.add(id);
    return { [key]: next } as Partial<State>;
  });
}
