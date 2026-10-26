import assert from "node:assert/strict";
import {
    LIBRARY_CAP,
    MAX_RESULTS,
    PREVIEW_COUNT,
    SEARCH_PREFIX,
    asPack,
    packsFromSearch,
    packsFromStorage,
    parseFromWebview,
    previewStickers,
    searchUrl,
    stylingCss,
    upsertPack,
} from "./sigstick.ts";

const url = searchUrl("  wu wa  ");
assert.equal(url, SEARCH_PREFIX + encodeURIComponent("wu wa"));
assert.equal(searchUrl("x".repeat(300)).length, SEARCH_PREFIX.length + encodeURIComponent("x".repeat(200)).length);

const stickers = [0, 1, 2, 3, 4].map((n) => ({
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
assert.equal(previewStickers(views[0]!)[3]?.url, "https://cdn.example/p/3.png");
assert.equal(packsFromSearch({ pageProps: { packs: null } }).length, 0);
assert.equal(packsFromSearch(null).length, 0);

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
