# SigStick — Drawdy extension

Search [SigStick](https://www.sigstick.com) sticker packs and put stickers on the board.

Install the extension, click the sticker icon, type a search, open a pack, then add a sticker.

## How to use

1. **Open the panel.** Click the sticker icon in the extension rail.
2. **Search.** Type in the box. The extension requests `https://www.sigstick.com/_next/data/Gr1V-1hyleuIsEkfWwJpP/stickers.json?keyword=` plus your text, and keeps at most 100 packs.
3. **Preview.** Each pack shows its cover, title, and the first four stickers.
4. **Open a pack.** The list shows every sticker. Click a sticker to put it on the board. **Discover more** is the other packs from that same response.
5. **Come back later.** **Add** keeps the pack on this device. **Remove** drops it. An empty search shows that list. Clicking a sticker also keeps the pack.

| Interaction | What happens |
| --- | --- |
| Click the rail icon | Opens the sticker panel |
| Type in the search box | Searches SigStick after a short pause |
| Click a pack | Opens the sticker list |
| Click a sticker | Places it in the middle of the view and saves the pack |
| Add / Remove | Puts the open pack on your list, or takes it off |
| Discover more | Opens another pack from the same search |
| Empty search | Shows packs saved on this device |
| Remove | Drops a saved pack from this device |

Saved packs are stored with this extension on this browser, not on the SigStick account.

## Develop

```bash
npm install
npm run check
npm run dev
```

On a **local** board, open the command palette and run **Add extension dev server** with `http://localhost:5173`.

Search goes through `https://backend.drawdy.io/api/sigstick/search`. SigStick does not send `Access-Control-Allow-Origin`, and the Drawdy worker origin is `null`.

## Credits

Stickers and search results come from [SigStick](https://www.sigstick.com).
