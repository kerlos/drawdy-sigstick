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
  gap: var(--dd-space-12, 12px);
  width: 100%;
  text-align: left;
  padding: var(--dd-space-8, 8px);
  margin: 0 0 var(--dd-space-8, 8px);
  background: var(--dd-surface-elevated, #fff);
  border: 1px solid var(--dd-border-subtle, #e8e8e8);
  border-radius: var(--dd-radius-lg, 8px);
  color: inherit;
  cursor: pointer;
  font: inherit;
  overflow: hidden;
}
.pack:hover { background: var(--dd-interaction-hover, rgba(0,0,0,0.04)); }
.cover, .thumb, .sticker img, .discover-card img.cover {
  background: #fff;
  object-fit: contain;
}
.cover {
  width: 76px;
  height: 76px;
  flex: none;
  border-radius: var(--dd-radius-md, 6px);
  border: 1px solid var(--dd-divider, #eee);
}
.pack-copy { min-width: 0; flex: 1; }
.pack-title {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: var(--dd-accent-text, #2f6fed);
}
.pack-author, .meta {
  margin: 0;
  font-size: var(--dd-type-caption-size, 11px);
  line-height: 16px;
  color: var(--dd-text-tertiary, #888);
}
.thumbs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.thumb {
  width: 44px;
  height: 44px;
  border-radius: var(--dd-radius-sm, 4px);
  border: 1px solid var(--dd-divider, #eee);
}
.row-actions { display: flex; justify-content: flex-end; margin-top: 4px; }
.linkish {
  border: 0;
  background: transparent;
  color: var(--dd-text-secondary, #555);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 0;
}
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--dd-space-12, 12px);
  align-items: center;
  padding: var(--dd-space-12, 12px) var(--dd-space-16, 16px);
  border-bottom: 1px solid var(--dd-divider, #eee);
}
.modal-head .cover { width: 64px; height: 64px; }
.modal-head .titles { min-width: 0; flex: 1; }
#modal-title {
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dd-accent-text, #2f6fed);
}
.modal-actions { display: flex; gap: 6px; flex: none; }
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
button.solid:disabled { background: var(--dd-interaction-disabled, #ddd); color: var(--dd-text-disabled, #888); cursor: default; }
button.ghost {
  border: 1px solid var(--dd-border-medium, #ccc);
  background: transparent;
  color: var(--dd-text-primary, #111);
}
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
  background: #fff;
  cursor: pointer;
  overflow: hidden;
}
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
  font-size: var(--dd-type-heading-size, 14px);
  font-weight: 600;
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
  var results = [];
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

  function makeImg(url, className, alt) {
    var image = document.createElement("img");
    image.className = className;
    image.alt = alt || "";
    image.draggable = false;
    image.referrerPolicy = "no-referrer";
    image.src = url;
    return image;
  }

  function thumbs(pack, className) {
    var row = document.createElement("div");
    row.className = "thumbs";
    var n = Math.min(4, pack.stickers.length);
    for (var i = 0; i < n; i++) {
      row.appendChild(makeImg(pack.stickers[i].url, className, ""));
    }
    return row;
  }

  function packCard(pack, saved) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pack";
    button.appendChild(makeImg(pack.coverUrl, "cover", pack.title));
    var copy = document.createElement("div");
    copy.className = "pack-copy";
    var title = document.createElement("p");
    title.className = "pack-title";
    title.textContent = pack.title;
    var author = document.createElement("p");
    author.className = "pack-author";
    author.textContent = pack.author;
    copy.appendChild(title);
    copy.appendChild(author);
    copy.appendChild(thumbs(pack, "thumb"));
    if (saved) {
      var actions = document.createElement("div");
      actions.className = "row-actions";
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "linkish";
      remove.textContent = "Remove";
      remove.addEventListener("click", function (event) {
        event.stopPropagation();
        api.postMessage({ type: "forget", id: pack.id });
      });
      actions.appendChild(remove);
      copy.appendChild(actions);
    }
    button.appendChild(copy);
    button.addEventListener("click", function () {
      openModal(pack, saved ? [] : others(pack.id));
    });
    return button;
  }

  function others(id) {
    var out = [];
    for (var i = 0; i < results.length; i++) {
      if (results[i].id !== id) out.push(results[i]);
    }
    return out;
  }

  function renderMain() {
    main.innerHTML = "";
    var query = search.value.trim();
    if (!query) {
      if (library.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Search SigStick to find a pack.";
        main.appendChild(empty);
        return;
      }
      var label = document.createElement("div");
      label.className = "section-label";
      label.textContent = "Saved";
      main.appendChild(label);
      for (var i = 0; i < library.length; i++) main.appendChild(packCard(library[i], true));
      return;
    }
    if (results.length === 0) {
      var none = document.createElement("div");
      none.className = "empty";
      none.textContent = status.textContent || "No packs for that search.";
      main.appendChild(none);
      return;
    }
    for (var j = 0; j < results.length; j++) main.appendChild(packCard(results[j], false));
  }

  function paintSave() {
    var button = document.getElementById("save-pack");
    var on = !!(openPack && savedIds()[openPack.id]);
    button.textContent = on ? "Remove" : "Add";
    button.className = on ? "ghost" : "solid";
    button.disabled = false;
  }

  function renderModal() {
    if (!openPack) return;
    document.getElementById("modal-cover").src = openPack.coverUrl;
    document.getElementById("modal-cover").alt = openPack.title;
    document.getElementById("modal-title").textContent = openPack.title;
    var count = openPack.stickers.length === 1 ? "1 sticker" : openPack.stickers.length + " stickers";
    document.getElementById("modal-author").textContent = openPack.author ? openPack.author + " · " + count : count;
    paintSave();
    var grid = document.getElementById("sticker-grid");
    grid.innerHTML = "";
    for (var i = 0; i < openPack.stickers.length; i++) {
      var sticker = openPack.stickers[i];
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", openPack.title);
      cell.appendChild(makeImg(sticker.url, "", openPack.title));
      cell.addEventListener("click", function (url) {
        return function () {
          api.postMessage({ type: "add", url: url, pack: openPack });
        };
      }(sticker.url));
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
      card.appendChild(makeImg(pack.coverUrl, "cover", pack.title));
      var title = document.createElement("p");
      title.className = "pack-title";
      title.textContent = pack.title;
      var author = document.createElement("p");
      author.className = "pack-author";
      author.textContent = pack.author;
      card.appendChild(title);
      card.appendChild(author);
      card.appendChild(thumbs(pack, "thumb"));
      card.addEventListener("click", function (next) {
        return function () { openModal(next, others(next.id)); };
      }(pack));
      row.appendChild(card);
    }
  }

  function openModal(pack, nextSiblings) {
    openPack = pack;
    siblings = nextSiblings;
    modal.hidden = false;
    renderModal();
  }

  function closeModal() {
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
      if (!search.value.trim()) renderMain();
      if (openPack) paintSave();
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
