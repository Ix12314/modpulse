import { useCallback, useState } from "react";
import { getCachedTranslation, translateText } from "@/lib/translate";

type Status = "idle" | "loading" | "done" | "error";

interface TranslationState {
  status: Status;
  translated: string | null;
  error: string | null;
}

/**
 * On-demand translation hook. Translates the given source text to zh-CN when
 * `translate()` is called. Cached translations show instantly. Caches results
 * across components via the shared translate module cache.
 */
export function useTranslation(sourceText: string, target = "zh-CN") {
  const [state, setState] = useState<TranslationState>(() => {
    const cached = getCachedTranslation(sourceText, target);
    return cached
      ? { status: "done", translated: cached, error: null }
      : { status: "idle", translated: null, error: null };
  });

  const translate = useCallback(async () => {
    if (state.status === "done") {
      // Toggle back to original on a second click handled by caller; here we
      // just expose current translation.
      return state.translated;
    }
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const out = await translateText(sourceText, target);
      setState({ status: "done", translated: out, error: null });
      return out;
    } catch (err) {
      setState({
        status: "error",
        translated: null,
        error: err instanceof Error ? err.message : "翻译失败",
      });
      return null;
    }
  }, [sourceText, target, state.status, state.translated]);

  const reset = useCallback(() => {
    setState({ status: "idle", translated: null, error: null });
  }, []);

  return { ...state, translate, reset };
}
