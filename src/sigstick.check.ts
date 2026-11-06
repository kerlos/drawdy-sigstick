import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WEBVIEW_HTML } from "./webview-html.ts";
import {
    LIBRARY_CAP,
    MAX_RESULTS,
    PREVIEW_COUNT,
    SEARCH_API,
    asPack,
    fittedSize,
    imageMime,
    isAnimatedImage,
    loopApng,
    stickerBytes,
    packApiUrl,
    packFromDetail,
    packsFromSearch,
    packsFromStorage,
    parseFromWebview,
    previewStickers,
    authorApiUrl,
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
assert.equal(packsFromSearch({ data: { packs: [packs[1]] } })[0]?.id, "p0");
assert.equal(packsFromSearch({ status: "ok", data: [packs[1]] })[0]?.id, "p0");
assert.equal(
    packApiUrl("ejCaa2dm9k7rvk6p5qaC"),
    "https://api.sigstick.com/v1/stickerPack/ejCaa2dm9k7rvk6p5qaC",
);
assert.equal(
    packFromDetail({
        status: "ok",
        data: {
            id: "ej",
            title: "wuwa",
            author: "waaa",
            cover: { url: "https://cdn.example/c.png" },
            stickers: [{ url: "https://cdn.example/0.png" }],
        },
    })?.stickers[0]?.url,
    "https://cdn.example/0.png",
);
assert.equal(packFromDetail({ pageProps: { pack: packs[1] } })?.id, "p0");
assert.equal(packFromDetail({ pack: packs[1] })?.id, "p0");
assert.equal(packFromDetail({ status: "error" }), null);
assert.deepEqual(parseFromWebview({ type: "open", id: "ejCaa2dm9k7rvk6p5qaC" }), {
    type: "open",
    id: "ejCaa2dm9k7rvk6p5qaC",
});
assert.equal(parseFromWebview({ type: "open", id: "../x" }), null);

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
const shot = "data:image/png;base64,aaaa";
assert.deepEqual(
    parseFromWebview({
        type: "preview",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: 1,
        y: 2,
        width: 64,
        height: 32,
        src: shot,
    }),
    {
        type: "preview",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: 1,
        y: 2,
        width: 64,
        height: 32,
        src: shot,
    },
);
assert.equal(
    parseFromWebview({
        type: "preview",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: 1,
        y: 2,
        src: "javascript:alert(1)",
    })?.src,
    undefined,
);
assert.equal(
    parseFromWebview({
        type: "preview",
        url: views[0]!.stickers[0]!.url,
        pack: views[0],
        x: 1,
        y: 2,
        src: "data:image/gif;base64,R0lGOD",
    })?.src,
    "data:image/gif;base64,R0lGOD",
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
assert.equal(imageMime(ascii("GIF89a")), "image/gif");
assert.equal(stickerBytes(new Uint8Array([1, 2]))?.length, 2);
assert.equal(stickerBytes(new ArrayBuffer(0)), undefined);
const carried = parseFromWebview({
    type: "add",
    url: views[0]!.stickers[0]!.url,
    pack: views[0],
    bytes: new Uint8Array([9]),
});
assert.equal(carried?.type === "add" && carried.bytes?.[0], 9);
assert.equal(isAnimatedImage(ascii("GIF89a")), true);
assert.equal(isAnimatedImage(png("IHDR")), false);
assert.equal(isAnimatedImage(png("acTL")), true);
assert.equal(isAnimatedImage(webp(0x10)), false);
assert.equal(isAnimatedImage(webp(0x02)), true);
assert.equal(isAnimatedImage(webp(0x00, "ANIM\0\0\0\0")), true);
assert.equal(isAnimatedImage(ascii("not-an-image")), false);
assert.equal(parseFromWebview({ type: "search", requestId: "1", keyword: "cat" }), null);
assert.equal(authorApiUrl(" pgyuuun "), "https://api.sigstick.com/v1/stickerPack?author=pgyuuun");
assert.equal(
    parseFromWebview({ type: "search", requestId: 1, keyword: "x", author: " pgyuuun " })?.author,
    "pgyuuun",
);

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

const script = WEBVIEW_HTML.slice(
    WEBVIEW_HTML.indexOf("function sniffType"),
    WEBVIEW_HTML.indexOf("function holdFile"),
);
const loops = new Function(`${script} return { repeatsFromNetwork, loopApng };`)() as {
    repeatsFromNetwork: (bytes: Uint8Array) => boolean;
    loopApng: (bytes: Uint8Array) => Uint8Array;
};
assert.equal(loops.repeatsFromNetwork(ascii("GIF89a")), true);
assert.equal(loops.repeatsFromNetwork(png("acTL")), false);
assert.equal(loops.repeatsFromNetwork(png("IHDR")), false);
assert.equal(loops.repeatsFromNetwork(webp(0x02)), true);
assert.equal(loops.repeatsFromNetwork(ascii("not-an-image")), false);
assert.match(WEBVIEW_HTML, /if \(fileNet\[url\]\)/);
assert.match(WEBVIEW_HTML, /held \|\| \/\\.png\$\/i\.test\(url\)/);
const driver = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
assert.match(driver, /dataUrl\(shown\)/);
assert.match(driver, /animatedSchema\(url,/);

// Real acTL from cdn2 LstgBavd8KjXOKmwtra2/0-1.png: 8 frames, play once.
const once = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x08, 0x61, 0x63, 0x54,
    0x4c, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0xce, 0x3a, 0xbb, 0x47,
]);
const forever = loopApng(once);
assert.notEqual(forever, once);
assert.equal(forever[20] | forever[21] | forever[22] | forever[23], 0);
assert.deepEqual(Array.from(forever.subarray(24, 28)), [0xb9, 0x3d, 0x8b, 0xd1]);
assert.equal(loopApng(forever), forever);
assert.equal(loops.loopApng(once)[23], 0);
assert.deepEqual(Array.from(loops.loopApng(once).subarray(24, 28)), [0xb9, 0x3d, 0x8b, 0xd1]);
const gif = ascii("GIF89a");
assert.equal(loopApng(gif), gif);

console.log("sigstick check ok");
