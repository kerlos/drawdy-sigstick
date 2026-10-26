# SigStick — Drawdy extension

Search [SigStick](https://www.sigstick.com) sticker packs and put stickers on the board.

Install the extension, click the sticker icon, type a search, open a pack, then add a sticker.

## How to use

1. **Click the sticker icon.** The sticker panel opens.
2. **Type in Search stickers.** Matching packs show up.
3. **Click a pack.** Every sticker in that pack is listed.
4. **Click a sticker.** It goes on the board.
5. **Click Add or Remove.** Add keeps the pack. Remove drops it.
6. **Clear the search.** Packs you kept show up.
7. **Click Discover more.** Another pack from the results opens.

## Develop

```bash
npm install
npm run check
npm run dev
```

On a **local** board, open the command palette and run **Add extension dev server** with `http://localhost:5173`.

Search calls `https://backend.drawdy.io/api/sigstick/search` from the driver, the same way [Klipy](https://github.com/drawdyio/drawdy-official-extension-klipy) calls `/api/klipy`. Drawdy runs that driver in a sandboxed iframe, so the browser sends `Origin: null`. Chrome blocks that origin from reaching `localhost`.

## Credits

Stickers and search results come from [SigStick](https://www.sigstick.com).
