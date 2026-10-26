import assert from "node:assert/strict";
import {
    LIBRARY_CAP,
    MAX_RESULTS,
    PREVIEW_COUNT,
    SEARCH_API,
    asPack,
    fittedSize,
    isAnimatedImage,
    packsFromSearch,
    packsFromStorage,
    parseFromWebview,
    previewStickers,
    searchApiUrl,
    stylingCss,
    upsertPack,
} from "./sigstick.ts";

const url = searchApiUrl("  wu wa  ");
assert.equal(url, SEARCH_API + encodeURIComponent("wu wa"));
assert.equal(
    searchApiUrl("x".repeat(300)).length,
    SEARCH_API.length + encodeURIComponent("x".repeat(200)).length,
);

const stickers = [0, 1, 2, 3, 4, 5].map((n) => ({
    emoji: null,
    url: `https://cdn.example/p/${n}.png`,
}));
const packs = Array.from({ length: 120 }, (_, i) => ({
    id: `p${i}`,
    title: `Title ${i}`,
    author: "author",
    cover: { url: `https://cdn.example/p${i}/cover.png` },
    stickers,
}));
packs.unshift({
    id: "no-cover",
    title: "skip",
    author: "a",
    cover: { url: "javascript:alert(1)" },
    stickers,
});

const views = packsFromSearch({ pageProps: { packs } });
assert.equal(views.length, MAX_RESULTS);
assert.equal(views[0]?.id, "p0");
assert.equal(views[0]?.coverUrl, "https://cdn.example/p0/cover.png");
assert.equal(previewStickers(views[0]!).length, PREVIEW_COUNT);
assert.equal(previewStickers(views[0]!)[5]?.url, "https://cdn.example/p/5.png");
assert.equal(packsFromSearch({ pageProps: { packs: null } }).length, 0);
assert.equal(packsFromSearch(null).length, 0);
assert.equal(packsFromSearch({ packs: [packs[1]] })[0]?.id, "p0");

const saved = upsertPack(
    upsertPack([], views[1]!),
    views[0]!,
);
assert.deepEqual(saved.map((pack) => pack.id), ["p0", "p1"]);
assert.equal(upsertPack(saved, views[1]!)[0]?.id, "p1");

const capped = Array.from({ length: LIBRARY_CAP + 5 }, (_, i) => views[i % views.length]!);
assert.equal(upsertPack(capped, views[2]!).length, LIBRARY_CAP);

assert.equal(asPack({ id: "", title: "x", coverUrl: "https://cdn.example/c.png" }), null);
assert.deepEqual(packsFromStorage({ packs: [views[0], { id: "bad" }, views[1]] }).map((p) => p.id), [
    "p0",
    "p1",
]);

assert.deepEqual(parseFromWebview({ type: "ready" }), { type: "ready" });
assert.equal(parseFromWebview({ type: "add", url: "https://evil.example/x.png", pack: views[0] }), null);
assert.equal(
    parseFromWebview({ type: "add", url: views[0]!.stickers[0]!.url, pack: views[0] })?.type,
    "add",
);
assert.deepEqual(
    parseFromWebview({
        type: "add",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: -12,
        y: 40,
    }),
    { type: "add", url: views[0]!.stickers[0]!.url, pack: views[0], x: -12, y: 40 },
);
assert.equal(
    parseFromWebview({ type: "add", url: views[0]!.stickers[0]!.url, pack: views[0], x: 1 }),
    null,
);
assert.deepEqual(fittedSize(200, 100, 180), { width: 180, height: 90 });
assert.deepEqual(fittedSize(1, 1, 180), { width: 180, height: 180 });
assert.deepEqual(
    parseFromWebview({
        type: "preview",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: 12,
        y: 40,
    }),
    { type: "preview", url: views[0]!.stickers[0]!.url, pack: views[0], x: 12, y: 40 },
);
assert.equal(
    parseFromWebview({ type: "preview", url: "https://evil.example/x.png", pack: views[0], x: 1, y: 2 }),
    null,
);
assert.deepEqual(parseFromWebview({ type: "preview-move", x: 3, y: 4 }), {
    type: "preview-move",
    x: 3,
    y: 4,
});
assert.equal(parseFromWebview({ type: "preview-move", x: 1 }), null);
assert.deepEqual(parseFromWebview({ type: "preview-end" }), { type: "preview-end" });
assert.equal(
    parseFromWebview({
        type: "add",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: Number.NaN,
        y: 1,
    }),
    null,
);

const ascii = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const png = (id: string) => {
    const bytes = new Uint8Array(8 + 12);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    bytes.set(ascii(id), 12);
    return bytes;
};
const webp = (flags: number, extra = "") => {
    const head = ascii("RIFF\0\0\0\0WEBPVP8X");
    const tail = ascii(extra);
    const bytes = new Uint8Array(30 + tail.length);
    bytes.set(head);
    bytes[16] = 10;
    bytes[20] = flags;
    bytes.set(tail, 30);
    return bytes;
};
assert.equal(isAnimatedImage(ascii("GIF89a")), true);
assert.equal(isAnimatedImage(png("IHDR")), false);
assert.equal(isAnimatedImage(png("acTL")), true);
assert.equal(isAnimatedImage(webp(0x10)), false);
assert.equal(isAnimatedImage(webp(0x02)), true);
assert.equal(isAnimatedImage(webp(0x00, "ANIM\0\0\0\0")), true);
assert.equal(isAnimatedImage(ascii("not-an-image")), false);
assert.equal(parseFromWebview({ type: "search", requestId: "1", keyword: "cat" }), null);

const css = stylingCss({
    theme: "dark",
    background: "#111",
    tokens: { "--dd-accent": "#00f;x" },
});
assert.match(css, /color-scheme: dark;/);
assert.match(css, /--dd-surface-panel:#111;/);
assert.match(css, /--dd-accent:#00fx;/);
assert.match(css, /--dd-interaction-hover:rgba\(255,255,255,0\.08\)/);
const light = stylingCss({ theme: "light", mutedForeground: "#777", border: "#ccc" });
assert.match(light, /--dd-text-secondary:#777/);
assert.match(light, /--dd-divider:#ccc/);
assert.match(light, /--dd-interaction-hover:rgba\(0,0,0,0\.06\)/);

console.log("sigstick check ok");
