/**
 * SigStick panel. Plain DOM, inlined so Drawdy's esbuild can bundle it
 * without a Vite plugin. `acquireDrawdyApi()` is injected at runtime.
 * `/*__DRAWDY_TOKENS__* /` is replaced with the current `--dd-*` tokens.
 */
export const WEBVIEW_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root { /*__DRAWDY_TOKENS__*/ }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  font-family: var(--dd-font-sans), ui-sans-serif, system-ui, sans-serif;
  background: var(--dd-surface-panel, #fff);
  color: var(--dd-text-primary, #111);
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header.bar { padding: var(--dd-space-12, 12px) var(--dd-space-16, 16px) var(--dd-space-8, 8px); }
.brand {
  font-size: var(--dd-type-label-size, 12px);
  line-height: var(--dd-type-label-line, 16px);
  font-weight: var(--dd-type-label-weight, 500);
  color: var(--dd-text-secondary, #555);
  margin-bottom: var(--dd-space-8, 8px);
}
#search {
  width: 100%;
  height: var(--dd-control-md, 36px);
  padding: 0 var(--dd-space-12, 12px);
  font: inherit;
  font-size: var(--dd-type-body-size, 12px);
  color: var(--dd-text-primary, #111);
  background: var(--dd-surface-section, #f6f6f6);
  border: 1px solid var(--dd-border-subtle, #e6e6e6);
  border-radius: var(--dd-radius-lg, 8px);
  outline: none;
}
#search::placeholder { color: var(--dd-text-tertiary, #888); }
#search:focus-visible { box-shadow: 0 0 0 2px var(--dd-focus-ring, #888); }
#status {
  min-height: 16px;
  margin: 6px 0 0;
  font-size: var(--dd-type-caption-size, 11px);
  line-height: 16px;
  color: var(--dd-text-tertiary, #888);
}
main { flex: 1; overflow-y: auto; padding: 4px var(--dd-space-16, 16px) var(--dd-space-16, 16px); }
.section-label {
  font-size: var(--dd-type-label-size, 12px);
  font-weight: var(--dd-type-label-weight, 500);
  color: var(--dd-text-secondary, #555);
  margin: 8px 0;
}
.pack {
  display: flex;
  align-items: flex-start;
  gap: var(--dd-space-12, 12px);
  width: 100%;
  text-align: left;
  padding: 10px 4px;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: var(--dd-radius-lg, 8px);
  color: inherit;
  cursor: pointer;
  font: inherit;
  overflow: hidden;
}
.pack:hover, .discover-card:hover {
  background:
    linear-gradient(var(--dd-interaction-hover, transparent), var(--dd-interaction-hover, transparent)),
    var(--dd-surface-elevated, transparent);
}
.cover, .thumb, .discover-card img.cover {
  background: var(--dd-surface-section, transparent);
  object-fit: contain;
}
.cover {
  width: 76px;
  height: 76px;
  flex: none;
  border-radius: var(--dd-radius-md, 6px);
  border: 1px solid var(--dd-divider, #eee);
}
.frame {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.frame img.pending { opacity: 0; }
.spin {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--dd-border-medium, #ddd);
  border-top-color: var(--dd-text-tertiary, #888);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.thumb .spin { width: 12px; height: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.cell .frame { width: 100%; aspect-ratio: 1; }
.pack > .frame.cover {
  width: 96px;
  height: 96px;
  flex: none;
  border: 0;
  border-radius: 16px;
}
.pack > .frame.cover img { object-fit: cover; }
.pack-copy { min-width: 0; flex: 1; padding-top: 2px; }
.pack-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--dd-accent, #3b6cff);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pack-author, .meta {
  margin: 0;
  font-size: var(--dd-type-caption-size, 11px);
  line-height: 16px;
  color: var(--dd-text-tertiary, #888);
}
.pack-author {
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pack-author.is-link, .author-link { cursor: pointer; }
.pack-author.is-link:hover, .author-link:hover { text-decoration: underline; }
.thumbs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.pack .thumbs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
}
.thumb {
  width: 44px;
  height: 44px;
  border-radius: var(--dd-radius-sm, 4px);
  border: 1px solid var(--dd-divider, #eee);
}
.pack .thumb {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border: 0;
  border-radius: 8px;
}
.pack .thumb img { object-fit: cover; }
.row-actions { display: flex; justify-content: flex-end; margin-top: 4px; }
.linkish {
  border: 0;
  background: transparent;
  color: var(--dd-text-secondary, inherit);
  font: inherit;
  font-size: var(--dd-type-caption-size, 11px);
  line-height: var(--dd-type-caption-line, 16px);
  cursor: pointer;
  padding: 2px 0;
}
.linkish.is-add { color: var(--dd-accent-text, inherit); }
.linkish:hover { color: var(--dd-text-primary, inherit); }
.empty {
  padding: 28px 8px;
  text-align: center;
  color: var(--dd-text-secondary, #666);
  font-size: var(--dd-type-body-size, 12px);
}
#modal[hidden] { display: none; }
#modal { position: fixed; inset: 0; z-index: 2; }
.scrim { position: absolute; inset: 0; background: var(--dd-surface-overlay, rgba(0,0,0,0.45)); }
.dialog {
  position: absolute;
  inset: 10px;
  display: flex;
  flex-direction: column;
  background: var(--dd-surface-panel, #fff);
  border-radius: var(--dd-radius-lg, 8px);
  border: 1px solid var(--dd-border-subtle, #e6e6e6);
  overflow: hidden;
}
.modal-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: var(--dd-space-12, 12px);
  row-gap: 10px;
  align-items: start;
  padding: var(--dd-space-12, 12px) var(--dd-space-16, 16px);
  border-bottom: 1px solid var(--dd-divider, #eee);
}
.modal-head .cover { width: 72px; height: 72px; border-radius: 12px; }
.modal-head .titles { min-width: 0; }
#modal-title {
  margin: 0;
  font-size: var(--dd-type-heading-size, 14px);
  line-height: var(--dd-type-heading-line, 20px);
  font-weight: var(--dd-type-heading-weight, 600);
  color: var(--dd-text-primary, inherit);
  overflow-wrap: break-word;
}
#modal-author { overflow-wrap: break-word; }
.modal-actions { grid-column: 1 / -1; display: flex; gap: 6px; justify-content: flex-end; }
button.solid, button.ghost {
  height: var(--dd-control-sm, 30px);
  padding: 0 10px;
  border-radius: var(--dd-radius-md, 6px);
  font: inherit;
  font-size: var(--dd-type-label-size, 12px);
  font-weight: var(--dd-type-label-weight, 500);
  cursor: pointer;
}
button.solid {
  border: 0;
  background: var(--dd-accent, #3b6cff);
  color: var(--dd-on-accent, #fff);
}
button.solid:hover { background: var(--dd-accent-hover, var(--dd-accent, #3b6cff)); }
button.solid:active { background: var(--dd-accent-pressed, var(--dd-accent, #3b6cff)); }
button.ghost {
  border: 1px solid var(--dd-border-medium, #ccc);
  background: transparent;
  color: var(--dd-text-primary, inherit);
}
button.ghost:hover { background: var(--dd-interaction-hover, transparent); }
button.ghost:active { background: var(--dd-interaction-pressed, transparent); }
.modal-scroll { flex: 1; overflow: auto; padding: var(--dd-space-12, 12px) var(--dd-space-16, 16px) var(--dd-space-16, 16px); }
.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--dd-space-8, 8px);
}
.cell {
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--dd-divider, #eee);
  border-radius: var(--dd-radius-md, 6px);
  background: var(--dd-surface-section, transparent);
  cursor: grab;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.cell.dragging { cursor: grabbing; }
.cell img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border: 0;
  border-radius: 0;
}
.cell:hover { outline: 2px solid var(--dd-accent, #3b6cff); outline-offset: 1px; }
.cell:focus-visible { outline: 2px solid var(--dd-focus-ring, #888); outline-offset: 1px; }
#discover { margin-top: var(--dd-space-16, 16px); }
#discover h3 {
  margin: 0 0 8px;
  font-size: var(--dd-type-label-size, 12px);
  line-height: var(--dd-type-label-line, 16px);
  font-weight: var(--dd-type-label-weight, 500);
  color: var(--dd-text-secondary, inherit);
}
.discover-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.discover-card {
  flex: none;
  width: 168px;
  text-align: left;
  border: 1px solid var(--dd-border-subtle, #e8e8e8);
  background: var(--dd-surface-elevated, #fff);
  border-radius: var(--dd-radius-lg, 8px);
  padding: 8px;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.discover-card .cover { width: 100%; height: 72px; }
.discover-card .thumbs { margin-top: 6px; }
.discover-card .thumb { width: 32px; height: 32px; }
</style>
</head>
<body>
<header class="bar">
  <div class="brand">SigStick</div>
  <input id="search" type="search" placeholder="Search stickers" aria-label="Search stickers" autocomplete="off">
  <p id="status" role="status"></p>
</header>
<main id="main"></main>
<div id="modal" hidden>
  <div class="scrim" id="scrim"></div>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-head">
      <img id="modal-cover" class="cover" alt="">
      <div class="titles">
        <h2 id="modal-title"></h2>
        <p id="modal-author" class="meta"></p>
      </div>
      <div class="modal-actions">
        <button id="save-pack" class="solid" type="button">Add</button>
        <button id="close-modal" class="ghost" type="button">Close</button>
      </div>
    </div>
    <div class="modal-scroll">
      <div id="sticker-grid" class="sticker-grid"></div>
      <section id="discover">
        <h3>Discover more</h3>
        <div id="discover-row" class="discover-row"></div>
      </section>
    </div>
  </div>
</div>
<script>
(function () {
  var api = acquireDrawdyApi();
  var library = [];
  var trending = [];
  var results = [];
  var listPacks = [];
  var requestSeq = 0;
  var activeRequest = 0;
  var openPack = null;
  var siblings = [];
  var timer = 0;
  var statusTimer = 0;

  var search = document.getElementById("search");
  var status = document.getElementById("status");
  var main = document.getElementById("main");
  var modal = document.getElementById("modal");
  var themeStyle = document.createElement("style");
  themeStyle.id = "theme";
  document.head.appendChild(themeStyle);

  function setStatus(text, sticky) {
    status.textContent = text || "";
    clearTimeout(statusTimer);
    if (text && !sticky) {
      statusTimer = setTimeout(function () { status.textContent = ""; }, 2500);
    }
  }

  function savedIds() {
    var ids = {};
    for (var i = 0; i < library.length; i++) ids[library[i].id] = true;
    return ids;
  }

  var files = {};
  var fileBlobs = {};
  var localUrls = [];

  function sniffType(bytes) {
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return "image/gif";
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
    return "application/octet-stream";
  }

  var fileAnim = {};
  var fileNet = {};
  var filePng = {};

  // GIF and animated WebP loop from the https response. blob: cannot be seeked,
  // so those formats play once. An APNG with num_plays 1 is patched below and
  // shown from the patched bytes — the CDN file would stop after one run.
  function repeatsFromNetwork(bytes) {
    var type = sniffType(bytes);
    return type === "image/gif" || type === "image/webp";
  }

  function crc32(bytes, start, end) {
    var c = ~0;
    for (var i = start; i < end; i++) {
      c ^= bytes[i];
      for (var k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  }

  function u32be(bytes, at) {
    return ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
  }

  function apngPlaysAt(bytes) {
    if (bytes.length < 8 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return -1;
    var at = 8;
    for (var n = 0; n < 8 && at + 20 <= bytes.length; n++) {
      var size = u32be(bytes, at);
      var id = String.fromCharCode(bytes[at + 4], bytes[at + 5], bytes[at + 6], bytes[at + 7]);
      if (id === "acTL" && size === 8) return at + 12;
      if (id === "IDAT" || id === "IEND") return -1;
      if (size > bytes.length - at - 12) return -1;
      at += 12 + size;
    }
    return -1;
  }

  function loopApng(bytes) {
    var plays = apngPlaysAt(bytes);
    if (plays < 0 || u32be(bytes, plays) === 0) return bytes;
    var out = new Uint8Array(bytes);
    out[plays] = out[plays + 1] = out[plays + 2] = out[plays + 3] = 0;
    var crc = crc32(out, plays - 8, plays + 4);
    out[plays + 4] = crc >>> 24;
    out[plays + 5] = (crc >>> 16) & 255;
    out[plays + 6] = (crc >>> 8) & 255;
    out[plays + 7] = crc & 255;
    return out;
  }

  function bytesToDataUrl(bytes, mime) {
    var binary = "";
    for (var i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return "data:" + mime + ";base64," + btoa(binary);
  }

  // ponytail: 4 downloads at a time. The CDN rate-limits a full pack grid.
  var fetchWait = [];
  var fetchActive = 0;

  function pumpFetches() {
    while (fetchActive < 4 && fetchWait.length) {
      fetchActive++;
      fetchWait.shift()();
    }
  }

  function holdFile(url) {
    if (!files[url]) {
      files[url] = new Promise(function (resolve, reject) {
        fetchWait.push(function () {
          fetch(url).then(function (res) {
            if (!res.ok) throw new Error(String(res.status));
            return res.arrayBuffer();
          }).then(function (buffer) {
            var shown = loopApng(new Uint8Array(buffer));
            fileNet[url] = repeatsFromNetwork(shown);
            fileAnim[url] = fileNet[url] || apngPlaysAt(shown) >= 0;
            if (fileAnim[url] && !fileNet[url]) filePng[url] = shown;
            var blob = new Blob([shown], { type: sniffType(shown) });
            fileBlobs[url] = blob;
            resolve(blob);
          }).catch(function (err) {
            delete files[url];
            reject(err);
          }).then(function () {
            fetchActive--;
            pumpFetches();
          });
        });
      });
      pumpFetches();
    }
    return files[url];
  }

  var lazy = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      lazy.unobserve(entries[i].target);
      var start = entries[i].target._load;
      if (start) start();
    }
  }, { rootMargin: "160px" }) : null;

  function releaseHeld() {
    for (var i = 0; i < localUrls.length; i++) URL.revokeObjectURL(localUrls[i]);
    localUrls = [];
  }

  function makeImg(url, className, alt, held) {
    var frame = document.createElement("span");
    frame.className = "frame" + (className ? " " + className : "");
    var spin = document.createElement("span");
    spin.className = "spin";
    spin.setAttribute("aria-hidden", "true");
    frame.appendChild(spin);
    var image = document.createElement("img");
    image.className = "pending";
    image.alt = alt || "";
    image.draggable = false;
    image.referrerPolicy = "no-referrer";
    frame.appendChild(image);
    function finish(ok) {
      spin.remove();
      if (ok) image.classList.remove("pending");
      else image.removeAttribute("src");
    }
    function use(src) {
      image.addEventListener("load", function () { finish(true); });
      image.addEventListener("error", function () { finish(false); });
      image.src = src;
      if (image.complete) finish(image.naturalWidth > 0);
    }
    function load() {
      holdFile(url).then(function (blob) {
        var png = filePng[url];
        if (png) {
          use(bytesToDataUrl(png, "image/png"));
          return;
        }
        if (fileNet[url]) {
          use(url);
          return;
        }
        var local = URL.createObjectURL(blob);
        localUrls.push(local);
        use(local);
      }, function () {
        use(url);
      });
    }
    if (!held) use(url);
    else if (!lazy) load();
    else {
      frame._load = load;
      lazy.observe(frame);
    }
    return frame;
  }

  // Still stickers: one decoded frame for the ghost. Animated ones keep the
  // network URL; drawing them here freezes the list image in Safari.
  function listedImage(img, still) {
    var width = img && img.naturalWidth;
    var height = img && img.naturalHeight;
    if (!width || !height) return null;
    if (!still) return { width: width, height: height, src: "" };
    var scale = 180 / Math.max(width, height);
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    var src = "";
    try {
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      src = canvas.toDataURL("image/png");
    } catch (e) {
      src = "";
    }
    if (src.length > 200000) src = "";
    return { width: width, height: height, src: src };
  }

  function thumb256(url) {
    return url.replace(/(\.[a-z0-9]+)$/i, ".thumb256$1");
  }

  function thumbs(pack, className) {
    var row = document.createElement("div");
    row.className = "thumbs";
    var n = Math.min(4, pack.stickers.length);
    for (var i = 0; i < n; i++) {
      row.appendChild(makeImg(thumb256(pack.stickers[i].url), className, "", true));
    }
    return row;
  }

  function packCard(pack, saved, list) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pack";
    button.appendChild(makeImg(thumb256(pack.coverUrl), "cover", pack.title, true));
    var copy = document.createElement("div");
    copy.className = "pack-copy";
    var title = document.createElement("p");
    title.className = "pack-title";
    title.textContent = pack.title;
    var author = document.createElement("p");
    author.className = "pack-author";
    author.textContent = pack.author;
    bindAuthor(author, pack.author);
    copy.appendChild(title);
    copy.appendChild(author);
    copy.appendChild(thumbs(pack, "thumb"));
    var actions = document.createElement("div");
    actions.className = "row-actions";
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = saved ? "linkish" : "linkish is-add";
    toggle.textContent = saved ? "Remove" : "Add";
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      if (saved) api.postMessage({ type: "forget", id: pack.id });
      else api.postMessage({ type: "save", pack: pack });
    });
    actions.appendChild(toggle);
    copy.appendChild(actions);
    button.appendChild(copy);
    button.addEventListener("click", function () {
      openModal(pack, saved ? [] : list);
    });
    return button;
  }

  function others(id) {
    var out = [];
    for (var i = 0; i < listPacks.length; i++) {
      if (listPacks[i].id !== id) out.push(listPacks[i]);
    }
    return out;
  }

  function section(title) {
    var label = document.createElement("div");
    label.className = "section-label";
    label.textContent = title;
    main.appendChild(label);
  }

  function renderMain() {
    main.innerHTML = "";
    var query = search.value.trim();
    if (!query) {
      if (library.length === 0 && trending.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Search SigStick to find a pack.";
        main.appendChild(empty);
        return;
      }
      var ids = savedIds();
      if (library.length) {
        section("Your list");
        for (var i = 0; i < library.length; i++) main.appendChild(packCard(library[i], true, []));
      }
      var fresh = [];
      for (var t = 0; t < trending.length; t++) {
        if (!ids[trending[t].id]) fresh.push(trending[t]);
      }
      if (fresh.length) {
        section("Trending");
        for (var u = 0; u < fresh.length; u++) main.appendChild(packCard(fresh[u], false, fresh));
      }
      return;
    }
    if (results.length === 0) {
      var none = document.createElement("div");
      none.className = "empty";
      none.textContent = status.textContent || "No packs for that search.";
      main.appendChild(none);
      return;
    }
    var ids = savedIds();
    for (var j = 0; j < results.length; j++) {
      main.appendChild(packCard(results[j], !!ids[results[j].id], results));
    }
  }

  function paintSave() {
    var button = document.getElementById("save-pack");
    var on = !!(openPack && savedIds()[openPack.id]);
    button.textContent = on ? "Remove" : "Add";
    button.className = on ? "ghost" : "solid";
    button.disabled = false;
  }

  var DRAG_THRESHOLD = 5;

  function sendAdd(url, x, y) {
    var body = { type: "add", url: url, pack: openPack };
    if (typeof x === "number") {
      body.x = x;
      body.y = y;
    }
    var pending = files[url];
    if (!pending) {
      api.postMessage(body);
      return;
    }
    pending.then(function (blob) {
      return blob.arrayBuffer();
    }).then(function (buffer) {
      body.bytes = buffer;
      api.postMessage(body, [buffer]);
    }, function () {
      api.postMessage(body);
    });
  }

  function bindPlace(cell, url) {
    var startX = 0;
    var startY = 0;
    var hoverX = 0;
    var hoverY = 0;
    var pressing = false;
    var dragging = false;
    var fromPointer = false;
    var previewSent = false;
    var previewFrame = 0;

    function queuePreview(x, y) {
      hoverX = x;
      hoverY = y;
      if (previewFrame) return;
      previewFrame = requestAnimationFrame(function () {
        previewFrame = 0;
        if (!pressing || !dragging) return;
        if (!previewSent) {
          previewSent = true;
          var shot = listedImage(cell.querySelector("img"), !fileAnim[url]);
          var message = { type: "preview", url: url, pack: openPack, x: hoverX, y: hoverY };
          if (shot) {
            message.width = shot.width;
            message.height = shot.height;
            if (shot.src) message.src = shot.src;
          }
          var png = filePng[url];
          if (png && png.length <= 1400000) message.src = bytesToDataUrl(png, "image/png");
          api.postMessage(message);
        } else {
          api.postMessage({ type: "preview-move", x: hoverX, y: hoverY });
        }
      });
    }

    cell.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      pressing = true;
      dragging = false;
      previewSent = false;
      startX = e.clientX;
      startY = e.clientY;
      cell.setPointerCapture(e.pointerId);
    });

    cell.addEventListener("pointermove", function (e) {
      if (!pressing) return;
      if (!dragging) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        dragging = true;
        cell.classList.add("dragging");
      }
      queuePreview(e.clientX, e.clientY);
    });

    function release(e) {
      if (cell.hasPointerCapture(e.pointerId)) cell.releasePointerCapture(e.pointerId);
      cell.classList.remove("dragging");
      if (previewFrame) cancelAnimationFrame(previewFrame);
      previewFrame = 0;
    }

    cell.addEventListener("pointerup", function (e) {
      release(e);
      if (!pressing) return;
      pressing = false;
      fromPointer = true;
      previewSent = false;
      if (dragging) sendAdd(url, e.clientX, e.clientY);
      else sendAdd(url);
    });

    cell.addEventListener("pointercancel", function (e) {
      release(e);
      pressing = false;
      dragging = false;
      if (previewSent) api.postMessage({ type: "preview-end" });
      previewSent = false;
    });

    cell.addEventListener("click", function (e) {
      if (fromPointer) {
        fromPointer = false;
        e.preventDefault();
        return;
      }
      sendAdd(url);
    });
  }

  function renderModal() {
    if (!openPack) return;
    releaseHeld();
    var cover = document.getElementById("modal-cover");
    var coverUrl = openPack.coverUrl;
    cover.alt = openPack.title;
    cover.removeAttribute("src");
    holdFile(coverUrl).then(function () {
      if (!openPack || openPack.coverUrl !== coverUrl) return;
      var png = filePng[coverUrl];
      cover.src = png ? bytesToDataUrl(png, "image/png") : coverUrl;
    }, function () {
      if (openPack && openPack.coverUrl === coverUrl) cover.src = coverUrl;
    });
    document.getElementById("modal-title").textContent = openPack.title;
    var count = openPack.stickers.length === 1 ? "1 sticker" : openPack.stickers.length + " stickers";
    var authorLine = document.getElementById("modal-author");
    authorLine.textContent = "";
    if (openPack.author) {
      var name = document.createElement("span");
      name.className = "author-link";
      name.textContent = openPack.author;
      bindAuthor(name, openPack.author);
      authorLine.appendChild(name);
      authorLine.appendChild(document.createTextNode(" · " + count));
    } else {
      authorLine.textContent = count;
    }
    paintSave();
    var grid = document.getElementById("sticker-grid");
    grid.innerHTML = "";
    for (var i = 0; i < openPack.stickers.length; i++) {
      var sticker = openPack.stickers[i];
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", openPack.title);
      cell.title = "Drag onto the board, or click to place in the center";
      cell.appendChild(makeImg(thumb256(sticker.url), "", openPack.title, false));
      bindPlace(cell, sticker.url);
      grid.appendChild(cell);
    }
    var discover = document.getElementById("discover");
    var row = document.getElementById("discover-row");
    row.innerHTML = "";
    if (siblings.length === 0) {
      discover.hidden = true;
      return;
    }
    discover.hidden = false;
    for (var k = 0; k < siblings.length; k++) {
      var pack = siblings[k];
      var card = document.createElement("button");
      card.type = "button";
      card.className = "discover-card";
      card.appendChild(makeImg(thumb256(pack.coverUrl), "cover", pack.title, true));
      var title = document.createElement("p");
      title.className = "pack-title";
      title.textContent = pack.title;
      var author = document.createElement("p");
      author.className = "pack-author";
      author.textContent = pack.author;
      bindAuthor(author, pack.author);
      card.appendChild(title);
      card.appendChild(author);
      card.appendChild(thumbs(pack, "thumb"));
      card.addEventListener("click", function (next) {
        return function () { openModal(next, listPacks); };
      }(pack));
      row.appendChild(card);
    }
  }

  function openModal(pack, list) {
    listPacks = list || [];
    openPack = pack;
    siblings = others(pack.id);
    modal.hidden = false;
    renderModal();
    api.postMessage({ type: "open", id: pack.id });
  }

  function closeModal() {
    releaseHeld();
    openPack = null;
    siblings = [];
    modal.hidden = true;
  }

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("scrim").addEventListener("click", closeModal);
  document.getElementById("save-pack").addEventListener("click", function () {
    if (!openPack) return;
    if (savedIds()[openPack.id]) {
      api.postMessage({ type: "forget", id: openPack.id });
    } else {
      api.postMessage({ type: "save", pack: openPack });
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  function searchAuthor(name) {
    var author = (name || "").trim();
    if (!author) return;
    closeModal();
    clearTimeout(timer);
    search.value = author;
    activeRequest = ++requestSeq;
    setStatus("Searching…", true);
    api.postMessage({ type: "search", requestId: activeRequest, keyword: author, author: author });
  }

  function bindAuthor(node, name) {
    if (!name) return;
    if (node.classList.contains("pack-author")) node.classList.add("is-link");
    node.addEventListener("click", function (event) {
      event.stopPropagation();
      event.preventDefault();
      searchAuthor(name);
    });
  }

  search.addEventListener("input", function () {
    clearTimeout(timer);
    var keyword = search.value.trim();
    if (!keyword) {
      results = [];
      activeRequest = 0;
      setStatus("");
      renderMain();
      return;
    }
    timer = setTimeout(function () {
      activeRequest = ++requestSeq;
      setStatus("Searching…", true);
      api.postMessage({ type: "search", requestId: activeRequest, keyword: keyword });
    }, 300);
  });

  api.onMessage(function (raw) {
    if (!raw || !raw.type) return;
    if (raw.type === "theme") {
      themeStyle.textContent = ":root{" + raw.css + "}";
      return;
    }
    if (raw.type === "library") {
      library = raw.packs || [];
      renderMain();
      if (openPack) paintSave();
      return;
    }
    if (raw.type === "trending") {
      trending = raw.packs || [];
      if (!search.value.trim()) renderMain();
      return;
    }
    if (raw.type === "pack") {
      if (!openPack || !raw.pack || raw.pack.id !== openPack.id) return;
      openPack = raw.pack;
      renderModal();
      return;
    }
    if (raw.type === "status") {
      setStatus(raw.message || "");
      return;
    }
    if (raw.type === "error") {
      if (raw.requestId !== activeRequest) return;
      results = [];
      setStatus(raw.message || "Search failed.", true);
      renderMain();
      return;
    }
    if (raw.type === "results") {
      if (raw.requestId !== activeRequest) return;
      if (raw.keyword !== search.value.trim()) return;
      results = raw.packs || [];
      setStatus("");
      renderMain();
      main.scrollTop = 0;
      return;
    }
  });

  renderMain();
  search.focus();
  api.postMessage({ type: "ready" });
})();
</script>
</body>
</html>
`;
