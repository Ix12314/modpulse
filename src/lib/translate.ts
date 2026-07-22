// Translation service for mod descriptions (en -> zh-CN).
// On-demand translation runs in the user's browser. Two free CORS-enabled
// providers are tried in order; results are cached in localStorage + memory
// to respect rate limits and avoid repeat requests.

const CACHE_KEY = "mp_tr_cache_v1";
const MAX_CACHE = 400;

type Cache = Record<string, string>;

let memoryCache: Cache = loadCache();

function loadCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function saveCache() {
  try {
    const entries = Object.entries(memoryCache);
    // Keep most recent MAX_CACHE entries (trim oldest if over).
    const trimmed = entries.slice(-MAX_CACHE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

function cacheKey(text: string, target: string): string {
  return `${target}::${text}`;
}

/** Detect if text already looks mostly Chinese (skip translation). */
export function isMostlyCJK(text: string): boolean {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  return cjk > 0 && cjk >= letters;
}

// Provider 1: Google translate unofficial gtx endpoint (best quality, CORS *).
async function googleTranslate(text: string, target: string): Promise<string> {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx" +
    `&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json, text/plain, */*" },
  });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const data = await res.json();
  // data[0] is an array of [translated, original, ...] segments.
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("google bad shape");
  }
  const out = data[0]
    .map((seg: unknown) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
    .join("");
  if (!out.trim()) throw new Error("google empty");
  return out;
}

// Provider 2: MyMemory (free, CORS-enabled, has daily anonymous quota).
async function myMemoryTranslate(text: string, target: string): Promise<string> {
  const langPair = `en|${target}`;
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=" +
    encodeURIComponent(langPair);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = await res.json();
  const out: string | undefined = data?.responseData?.translatedText;
  if (!out || out.startsWith("MYMEMORY WARNING") || out.startsWith("MYMEMORY ERROR")) {
    throw new Error("mymemory quota");
  }
  return out;
}

/**
 * Translate `text` to `target` (default zh-CN). Returns cached result when
 * available. Throws only if all providers fail.
 */
export async function translateText(
  text: string,
  target = "zh-CN",
): Promise<string> {
  const clean = text?.trim();
  if (!clean) return "";
  if (isMostlyCJK(clean)) return clean;

  const key = cacheKey(clean, target);
  if (memoryCache[key]) return memoryCache[key];

  // Google first, MyMemory fallback.
  let result: string;
  try {
    result = await googleTranslate(clean, target);
  } catch {
    result = await myMemoryTranslate(clean, target);
  }
  memoryCache[key] = result;
  saveCache();
  return result;
}

export function getCachedTranslation(text: string, target = "zh-CN"): string | null {
  const clean = text?.trim();
  if (!clean) return null;
  return memoryCache[cacheKey(clean, target)] ?? null;
}
