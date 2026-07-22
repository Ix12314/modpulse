import { create } from "zustand";

export type Theme = "light" | "dark";
export type SortIndex = "downloads" | "follows" | "newest" | "updated" | "relevance";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  // Filter / search state (persisted across navigation via store)
  query: string;
  setQuery: (q: string) => void;

  loaders: string[]; // active loader facets
  toggleLoader: (l: string) => void;
  clearLoaders: () => void;

  projectType: string | null; // null = all
  setProjectType: (t: string | null) => void;

  sort: SortIndex;
  setSort: (s: SortIndex) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(t);
  try {
    localStorage.setItem("theme", t);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute("content", t === "dark" ? "#000000" : "#fbfbfd");
}

export const useStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "light" ? "dark" : "light";
      applyTheme(next);
      return { theme: next };
    }),
  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },

  query: "",
  setQuery: (q) => set({ query: q }),

  loaders: [],
  toggleLoader: (l) =>
    set((s) => ({
      loaders: s.loaders.includes(l)
        ? s.loaders.filter((x) => x !== l)
        : [...s.loaders, l],
    })),
  clearLoaders: () => set({ loaders: [] }),

  projectType: null,
  setProjectType: (t) => set({ projectType: t }),

  sort: "downloads",
  setSort: (s) => set({ sort: s }),
}));

// Apply theme on module load to keep DOM in sync with persisted state.
if (typeof window !== "undefined") {
  applyTheme(getInitialTheme());
  // Follow OS changes when user hasn't explicitly chosen.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    try {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light");
        useStore.setState({ theme: e.matches ? "dark" : "light" });
      }
    } catch {
      /* ignore */
    }
  });
}
