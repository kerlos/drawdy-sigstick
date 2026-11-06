import type { PackView } from "./types.ts";

export type { PackView };

/** api.sigstick.com sends Access-Control-Allow-Origin: *. */
export const TRENDING_API = "https://api.sigstick.com/v1/stickerPack/trending?region=th";
export const SEARCH_API = "https://api.sigstick.com/v1/stickerPack?keyword=";
const PACK_API = "https://api.sigstick.com/v1/stickerPack/";

export const MAX_RESULTS = 100;
export const PREVIEW_COUNT = 6;
/** ponytail: device library stops at 100 packs, newest first. Drop the tail. */
export const LIBRARY_CAP = 100;
/** ponytail: ignore a pack that claims more stickers than SigStick serves (~20). */
const MAX_STICKERS = 500;

export function searchApiUrl(keyword: string): string {
    return SEARCH_API + encodeURIComponent(keyword.trim().slice(0, 200));
}

export function authorApiUrl(author: string): string {
    return "https://api.sigstick.com/v1/stickerPack?author=" + encodeURIComponent(author.trim().slice(0, 200));
}

export function packApiUrl(id: string): string {
    return PACK_API + encodeURIComponent(id);
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

function rawPacks(data: unknown): unknown[] {
    if (!data || typeof data !== "object") return [];
    const record = data as Record<string, unknown>;
    const page = record.pageProps;
    if (page && typeof page === "object") {
        const packs = (page as Record<string, unknown>).packs;
        if (Array.isArray(packs)) return packs;
    }
    if (Array.isArray(record.packs)) return record.packs;
    const inner = record.data;
    if (Array.isArray(inner)) return inner;
    if (inner && typeof inner === "object") {
        const box = inner as Record<string, unknown>;
        if (Array.isArray(box.packs)) return box.packs;
        if (Array.isArray(box.stickerPacks)) return box.stickerPacks;
    }
    return [];
}

function viewFromRow(pack: unknown): PackView | null {
    if (!pack || typeof pack !== "object") return null;
    const row = pack as {
        id?: unknown;
        title?: unknown;
        author?: unknown;
        cover?: { url?: unknown };
        stickers?: unknown;
    };
    return asPack({
        id: row.id,
        title: row.title,
        author: row.author,
        coverUrl: row.cover?.url,
        stickers: row.stickers,
    });
}

export function packsFromSearch(data: unknown): PackView[] {
    const out: PackView[] = [];
    for (const pack of rawPacks(data)) {
        if (out.length >= MAX_RESULTS) break;
        const view = viewFromRow(pack);
        if (view) out.push(view);
    }
    return out;
}

function detailRecord(data: unknown): Record<string, unknown> | null {
    if (!data || typeof data !== "object") return null;
    return data as Record<string, unknown>;
}

/** One pack from the Drawdy proxy `{ pack }` or a Next `{ pageProps.pack }`. */
export function packFromDetail(data: unknown): PackView | null {
    const record = detailRecord(data);
    if (!record) return null;
    const page = record.pageProps;
    if (page && typeof page === "object" && "pack" in page) {
        return viewFromRow((page as { pack: unknown }).pack);
    }
    if (record.pack && typeof record.pack === "object") return viewFromRow(record.pack);
    const inner = record.data;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) return viewFromRow(inner);
    return null;
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

async function fetchJson(url: string, what: string): Promise<unknown> {
    let res: Response;
    try {
        res = await fetch(url);
    } catch {
        throw new Error(`Could not reach SigStick ${what}.`);
    }
    if (!res.ok) throw new Error(`SigStick ${what} failed (HTTP ${res.status}).`);
    return await res.json();
}

export const fetchTrending = (): Promise<unknown> => fetchJson(TRENDING_API, "trending");

export const fetchSearch = (keyword: string): Promise<unknown> =>
    fetchJson(searchApiUrl(keyword), "search");

export const fetchAuthor = (author: string): Promise<unknown> =>
    fetchJson(authorApiUrl(author), "author");

export const fetchPack = (id: string): Promise<unknown> => fetchJson(packApiUrl(id), "pack");

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

const crc32 = (bytes: Uint8Array, start: number, end: number) => {
    let c = ~0;
    for (let i = start; i < end; i++) {
        c ^= bytes[i]!;
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
};

/** Offset of an APNG `num_plays` field, or -1. A count of 0 means loop forever. */
const apngPlaysAt = (bytes: Uint8Array): number => {
    if (bytes.length < 8 || bytes[0] !== 0x89 || FOUR(bytes, 1) !== "PNG\r") return -1;
    let at = 8;
    for (let n = 0; n < 8 && at + 20 <= bytes.length; n++) {
        const size = u32be(bytes, at);
        const id = FOUR(bytes, at + 4);
        if (id === "acTL" && size === 8) return at + 12;
        if (id === "IDAT" || id === "IEND") return -1;
        if (size > bytes.length - at - 12) return -1;
        at += 12 + size;
    }
    return -1;
};

/**
 * SigStick APNGs set `num_plays` to 1, so the browser stops after one run.
 * 0 means forever. The chunk CRC covers the type and those eight data bytes.
 */
export function loopApng(bytes: Uint8Array): Uint8Array {
    const plays = apngPlaysAt(bytes);
    if (plays < 0 || u32be(bytes, plays) === 0) return bytes;
    const out = new Uint8Array(bytes);
    out[plays] = out[plays + 1] = out[plays + 2] = out[plays + 3] = 0;
    const crc = crc32(out, plays - 8, plays + 4);
    out[plays + 4] = crc >>> 24;
    out[plays + 5] = (crc >>> 16) & 0xff;
    out[plays + 6] = (crc >>> 8) & 0xff;
    out[plays + 7] = crc & 0xff;
    return out;
}

export function imageMime(bytes: Uint8Array): string {
    if (bytes.length >= 6 && FOUR(bytes, 0) === "GIF8") return "image/gif";
    if (bytes.length >= 8 && bytes[0] === 0x89 && FOUR(bytes, 1) === "PNG\r") return "image/png";
    if (bytes.length >= 12 && FOUR(bytes, 0) === "RIFF" && FOUR(bytes, 8) === "WEBP") return "image/webp";
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
    return "application/octet-stream";
}

/** ponytail: one sticker file, not a pack. Bigger files fall back to a fresh download. */
const MAX_FILE = 12_000_000;

export function stickerBytes(value: unknown): Uint8Array | undefined {
    const bytes =
        value instanceof Uint8Array
            ? value
            : value instanceof ArrayBuffer
              ? new Uint8Array(value)
              : undefined;
    if (!bytes || bytes.byteLength === 0 || bytes.byteLength > MAX_FILE) return undefined;
    return bytes;
}

/** Fit a sticker inside a square of `maxEdge` canvas units, keeping its aspect ratio. */
export function fittedSize(
    width: number,
    height: number,
    maxEdge: number,
): { width: number; height: number } {
    const scale = maxEdge / Math.max(width, height, 1);
    return {
        width: Math.max(8, width * scale),
        height: Math.max(8, height * scale),
    };
}

export type FromWebview =
    | { type: "ready" }
    | { type: "search"; requestId: number; keyword: string; author?: string }
    | { type: "open"; id: string }
    | { type: "add"; url: string; pack: PackView; x?: number; y?: number; bytes?: Uint8Array }
    | {
          type: "preview";
          url: string;
          pack: PackView;
          x: number;
          y: number;
          width?: number;
          height?: number;
          /** Data URL of the sticker already painted in the list. */
          src?: string;
      }
    | { type: "preview-move"; x: number; y: number }
    | { type: "preview-end" }
    | { type: "save"; pack: PackView }
    | { type: "forget"; id: string };

function finitePoint(x: unknown, y: unknown): { x: number; y: number } | null {
    if (typeof x !== "number" || typeof y !== "number") return null;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
}

function ownedSticker(body: Record<string, unknown>): { url: string; pack: PackView } | null {
    const pack = asPack(body.pack);
    const url = httpUrl(body.url);
    if (!pack || !url || !pack.stickers.some((sticker) => sticker.url === url)) return null;
    return { url, pack };
}

export function parseFromWebview(message: unknown): FromWebview | null {
    if (!message || typeof message !== "object") return null;
    const body = message as Record<string, unknown>;
    if (body.type === "ready") return { type: "ready" };
    if (body.type === "open") {
        return typeof body.id === "string" && /^[A-Za-z0-9]{1,64}$/.test(body.id)
            ? { type: "open", id: body.id }
            : null;
    }
    if (body.type === "search") {
        if (typeof body.requestId !== "number" || typeof body.keyword !== "string") {
            return null;
        }
        const author = typeof body.author === "string" ? body.author.trim().slice(0, 200) : "";
        return author
            ? { type: "search", requestId: body.requestId, keyword: author, author }
            : { type: "search", requestId: body.requestId, keyword: body.keyword.trim().slice(0, 200) };
    }
    if (body.type === "save") {
        const pack = asPack(body.pack);
        return pack ? { type: "save", pack } : null;
    }
    if (body.type === "forget") {
        return typeof body.id === "string" && body.id ? { type: "forget", id: body.id } : null;
    }
    if (body.type === "add") {
        const sticker = ownedSticker(body);
        if (!sticker) return null;
        const bytes = stickerBytes(body.bytes);
        const file = bytes ? { bytes } : {};
        const hasX = body.x !== undefined;
        const hasY = body.y !== undefined;
        if (!hasX && !hasY) return { type: "add", ...sticker, ...file };
        const point = finitePoint(body.x, body.y);
        return point ? { type: "add", ...sticker, ...point, ...file } : null;
    }
    if (body.type === "preview") {
        const sticker = ownedSticker(body);
        const point = finitePoint(body.x, body.y);
        if (!sticker || !point) return null;
        const width = body.width;
        const height = body.height;
        const sized =
            typeof width === "number" &&
            typeof height === "number" &&
            width >= 1 &&
            height >= 1 &&
            width <= 4096 &&
            height <= 4096 &&
            Number.isFinite(width) &&
            Number.isFinite(height);
        const src =
            typeof body.src === "string" &&
            /^data:image\/(png|gif|webp);base64,/.test(body.src) &&
            body.src.length <= 2_000_000
                ? body.src
                : undefined;
        return {
            type: "preview",
            ...sticker,
            ...point,
            ...(sized ? { width, height } : {}),
            ...(src ? { src } : {}),
        };
    }
    if (body.type === "preview-move") {
        const point = finitePoint(body.x, body.y);
        return point ? { type: "preview-move", ...point } : null;
    }
    if (body.type === "preview-end") return { type: "preview-end" };
    return null;
}
