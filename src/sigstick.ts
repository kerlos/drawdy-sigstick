import type { PackView, SigStickSearchResultResponse } from "./types.ts";

export type { PackView };

/** Drawdy backend proxy. SigStick itself sends no Access-Control-Allow-Origin. */
export const SEARCH_API =
    "https://backend.drawdy.io/api/sigstick/search?keyword=";

export const MAX_RESULTS = 100;
export const PREVIEW_COUNT = 6;
/** ponytail: device library stops at 100 packs, newest first. Drop the tail. */
export const LIBRARY_CAP = 100;
/** ponytail: ignore a pack that claims more stickers than SigStick serves (~20). */
const MAX_STICKERS = 500;

export function searchApiUrl(keyword: string): string {
    return SEARCH_API + encodeURIComponent(keyword.trim().slice(0, 200));
}

function httpUrl(value: unknown): string | null {
    if (typeof value !== "string") return null;
    if (value.startsWith("https://") || value.startsWith("http://")) return value;
    return null;
}

export function asPack(value: unknown): PackView | null {
    if (!value || typeof value !== "object") return null;
    const pack = value as Record<string, unknown>;
    const id = pack.id;
    const coverUrl = httpUrl(pack.coverUrl);
    if (typeof id !== "string" || id.length === 0 || !coverUrl) return null;
    const rawStickers = Array.isArray(pack.stickers) ? pack.stickers : [];
    const stickers: Array<{ url: string }> = [];
    for (const sticker of rawStickers) {
        if (stickers.length >= MAX_STICKERS) break;
        if (!sticker || typeof sticker !== "object") continue;
        const url = httpUrl((sticker as { url?: unknown }).url);
        if (url) stickers.push({ url });
    }
    return {
        id,
        title: typeof pack.title === "string" && pack.title ? pack.title : "Untitled",
        author: typeof pack.author === "string" ? pack.author : "",
        coverUrl,
        stickers,
    };
}

export function packsFromSearch(data: unknown): PackView[] {
    if (!data || typeof data !== "object") return [];
    const record = data as {
        pageProps?: { packs?: unknown };
        packs?: unknown;
    };
    const packs = record.pageProps?.packs ?? record.packs;
    if (!Array.isArray(packs)) return [];
    const out: PackView[] = [];
    for (const pack of packs) {
        if (out.length >= MAX_RESULTS) break;
        if (!pack || typeof pack !== "object") continue;
        const row = pack as SigStickSearchResultResponse["pageProps"]["packs"][number];
        const view = asPack({
            id: row.id,
            title: row.title,
            author: row.author,
            coverUrl: row.cover?.url,
            stickers: row.stickers,
        });
        if (view) out.push(view);
    }
    return out;
}

export function previewStickers(pack: PackView): Array<{ url: string }> {
    return pack.stickers.slice(0, PREVIEW_COUNT);
}

export function packsFromStorage(got: Record<string, unknown> | undefined): PackView[] {
    const raw = got?.packs;
    if (!Array.isArray(raw)) return [];
    const out: PackView[] = [];
    for (const item of raw) {
        if (out.length >= LIBRARY_CAP) break;
        const pack = asPack(item);
        if (pack) out.push(pack);
    }
    return out;
}

export function upsertPack(packs: PackView[], pack: PackView): PackView[] {
    return [pack, ...packs.filter((item) => item.id !== pack.id)].slice(0, LIBRARY_CAP);
}

export function tokensCss(tokens: object): string {
    return Object.entries(tokens as Record<string, unknown>)
        .filter(([name, value]) => name.startsWith("--") && typeof value === "string")
        .map(([name, value]) => `${name}:${(value as string).replace(/[;{}]/g, "")};`)
        .join("");
}

/** Older hosts send camelCase colors. Newer hosts also send `--dd-*` tokens. */
const LEGACY_TOKEN: Record<string, string> = {
    background: "--dd-surface-panel",
    foreground: "--dd-text-primary",
    surface: "--dd-surface-elevated",
    surface2: "--dd-surface-section",
    mutedForeground: "--dd-text-tertiary",
    primary: "--dd-accent",
    primaryForeground: "--dd-on-accent",
    accent: "--dd-accent-text",
    border: "--dd-border-subtle",
    ring: "--dd-focus-ring",
    radiusSm: "--dd-radius-sm",
    radiusMd: "--dd-radius-md",
    radiusLg: "--dd-radius-lg",
};

export function stylingCss(styling: object): string {
    const record = styling as Record<string, unknown>;
    const parts: string[] = [];
    if (record.theme === "dark" || record.theme === "light") {
        parts.push(`color-scheme: ${record.theme};`);
    }
    for (const [key, token] of Object.entries(LEGACY_TOKEN)) {
        const value = record[key];
        if (typeof value !== "string") continue;
        parts.push(`${token}:${value.replace(/[;{}]/g, "")};`);
    }
    const muted = record.mutedForeground;
    if (typeof muted === "string") {
        parts.push(`--dd-text-secondary:${muted.replace(/[;{}]/g, "")};`);
    }
    const border = record.border;
    if (typeof border === "string") {
        const clean = border.replace(/[;{}]/g, "");
        parts.push(`--dd-border-medium:${clean};`, `--dd-divider:${clean};`);
    }
    const dark = record.theme === "dark";
    parts.push(
        `--dd-interaction-hover:${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};`,
        `--dd-interaction-pressed:${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)"};`,
    );
    if (record.tokens && typeof record.tokens === "object") parts.push(tokensCss(record.tokens));
    return parts.join("");
}

export async function fetchSearch(keyword: string): Promise<unknown> {
    let res: Response;
    try {
        res = await fetch(searchApiUrl(keyword));
    } catch {
        throw new Error("Could not reach SigStick search.");
    }
    if (!res.ok) throw new Error(`SigStick search failed (HTTP ${res.status}).`);
    return await res.json();
}

const FOUR = (bytes: Uint8Array, at: number) =>
    String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!);

const u32be = (bytes: Uint8Array, at: number) =>
    ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0;

const u32le = (bytes: Uint8Array, at: number) =>
    (bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16) | (bytes[at + 3]! << 24)) >>> 0;

/**
 * SigStick names animated stickers `.png` or `.webp` and often serves
 * `application/octet-stream`. Canvas image elements paint one frame, so the
 * board has to tell GIF, APNG, and animated WebP apart from the bytes.
 *
 * ponytail: at most 64 container chunks. ANIM and acTL sit in front of the
 * frame data; a sticker that hides them later needs a full walk.
 */
export function isAnimatedImage(bytes: Uint8Array): boolean {
    if (bytes.length >= 6 && FOUR(bytes, 0) === "GIF8") return true;
    if (bytes.length >= 8 && bytes[0] === 0x89 && FOUR(bytes, 1) === "PNG\r") {
        let at = 8;
        for (let n = 0; n < 64 && at + 8 <= bytes.length; n++) {
            const size = u32be(bytes, at);
            const id = FOUR(bytes, at + 4);
            if (id === "acTL") return true;
            if (id === "IDAT" || id === "IEND") return false;
            if (size > bytes.length - at - 12) return false;
            at += 12 + size;
        }
        return false;
    }
    if (bytes.length >= 12 && FOUR(bytes, 0) === "RIFF" && FOUR(bytes, 8) === "WEBP") {
        let at = 12;
        for (let n = 0; n < 64 && at + 8 <= bytes.length; n++) {
            const id = FOUR(bytes, at);
            const size = u32le(bytes, at + 4);
            if (id === "ANIM" || id === "ANMF") return true;
            // VP8X flag bit 1 is the animation bit (libwebp ANIMATION_FLAG).
            if (id === "VP8X" && at + 8 < bytes.length && (bytes[at + 8]! & 0x02) !== 0) return true;
            if (size > bytes.length - at - 8) return false;
            at += 8 + size + (size & 1);
        }
    }
    return false;
}

export type FromWebview =
    | { type: "ready" }
    | { type: "search"; requestId: number; keyword: string }
    | { type: "add"; url: string; pack: PackView; x?: number; y?: number }
    | { type: "save"; pack: PackView }
    | { type: "forget"; id: string };

export function parseFromWebview(message: unknown): FromWebview | null {
    if (!message || typeof message !== "object") return null;
    const body = message as Record<string, unknown>;
    if (body.type === "ready") return { type: "ready" };
    if (body.type === "search") {
        if (typeof body.requestId !== "number" || typeof body.keyword !== "string") {
            return null;
        }
        return {
            type: "search",
            requestId: body.requestId,
            keyword: body.keyword.trim().slice(0, 200),
        };
    }
    if (body.type === "save") {
        const pack = asPack(body.pack);
        return pack ? { type: "save", pack } : null;
    }
    if (body.type === "forget") {
        return typeof body.id === "string" && body.id ? { type: "forget", id: body.id } : null;
    }
    if (body.type === "add") {
        const pack = asPack(body.pack);
        const url = httpUrl(body.url);
        if (!pack || !url || !pack.stickers.some((sticker) => sticker.url === url)) {
            return null;
        }
        const hasX = body.x !== undefined;
        const hasY = body.y !== undefined;
        if (!hasX && !hasY) return { type: "add", url, pack };
        if (typeof body.x !== "number" || typeof body.y !== "number") return null;
        if (!Number.isFinite(body.x) || !Number.isFinite(body.y)) return null;
        return { type: "add", url, pack, x: body.x, y: body.y };
    }
    return null;
}
