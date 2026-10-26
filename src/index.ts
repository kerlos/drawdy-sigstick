import type {
    DriverCommandIssuer,
    DriverManifest,
    DriverModule,
    ModuleStyling,
} from "@drawdy/driver-protocol";
import {
    fetchSearch,
    packsFromSearch,
    packsFromStorage,
    parseFromWebview,
    stylingCss,
    upsertPack,
    type FromWebview,
    type PackView,
} from "./sigstick.ts";
import { WEBVIEW_HTML } from "./webview-html.ts";

const LIBRARY_KEY = "library";
const STICKER_SCREEN_PX = 180;

const ACTION_BUTTON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="#6ea8ff" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H14l5 5v8.5a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4 17.5z"/><path fill="#e8f1ff" d="M14 4v5h5"/><circle cx="9" cy="13" r="1.15" fill="#1b2430"/><circle cx="14.2" cy="13" r="1.15" fill="#1b2430"/><path d="M8.6 16.2c1.1 1.1 4.6 1.1 5.8 0" stroke="#1b2430" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`;

let requestSeq = 0;
const nextRequestId = () => String(requestSeq++);

let driver: {
    manifest: DriverManifest;
    issueCommand: DriverCommandIssuer;
    generateId: () => string;
    styling: ModuleStyling;
    actionButtonId: string;
    webviewId: string;
    placed: number;
} | null = null;

function post(message: unknown): void {
    if (!driver) return;
    void driver.issueCommand({
        type: "command:webview:post-message",
        driverId: driver.manifest.driverId,
        requestId: nextRequestId(),
        req: { webviewDomId: driver.webviewId, message },
    });
}

async function loadLibrary(): Promise<PackView[]> {
    if (!driver) return [];
    const res = await driver.issueCommand({
        type: "command:kv-storage:get",
        driverId: driver.manifest.driverId,
        requestId: nextRequestId(),
        req: { key: LIBRARY_KEY },
    });
    if (!driver || res.res.error !== undefined) return [];
    return packsFromStorage(res.res.value.got);
}

async function storeLibrary(packs: PackView[]): Promise<boolean> {
    if (!driver) return false;
    const res = await driver.issueCommand({
        type: "command:kv-storage:set",
        driverId: driver.manifest.driverId,
        requestId: nextRequestId(),
        req: { key: LIBRARY_KEY, payload: { packs } },
    });
    return driver !== null && res.res.error === undefined;
}

async function remember(pack: PackView): Promise<boolean> {
    const packs = upsertPack(await loadLibrary(), pack);
    const ok = await storeLibrary(packs);
    post({ type: "library", packs: ok ? packs : await loadLibrary() });
    if (!ok) post({ type: "status", message: "Could not update your list." });
    return ok;
}

async function placeSticker(url: string): Promise<void> {
    if (!driver) return;
    const current = driver;

    let blob: Blob;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
    } catch {
        post({ type: "status", message: "Could not download that sticker." });
        return;
    }

    const view = await current.issueCommand({
        type: "command:camera:get-viewport-rect",
        driverId: current.manifest.driverId,
        requestId: nextRequestId(),
    });
    const info = await current.issueCommand({
        type: "command:camera:get-info",
        driverId: current.manifest.driverId,
        requestId: nextRequestId(),
    });
    if (!driver || view.res.error !== undefined || info.res.error !== undefined) return;

    const zoom = info.res.value.zoom || 1;
    const maxEdge = STICKER_SCREEN_PX / zoom;
    let width = maxEdge;
    let height = maxEdge;
    try {
        const bitmap = await createImageBitmap(blob);
        const scale = maxEdge / Math.max(bitmap.width, bitmap.height, 1);
        width = Math.max(8, bitmap.width * scale);
        height = Math.max(8, bitmap.height * scale);
        bitmap.close();
    } catch {
        // Square fallback when the bytes are not a bitmap this worker can decode.
    }

    const { rect } = view.res.value;
    const slot = current.placed++;
    const step = 24 / zoom;
    const dx = (slot % 4) * step;
    const dy = Math.floor(slot / 4) % 4 * step;

    const added = await current.issueCommand({
        type: "command:scene:add-drawdy-elements",
        driverId: current.manifest.driverId,
        requestId: nextRequestId(),
        req: {
            elements: [
                {
                    type: "image",
                    drawdyElementId: current.generateId(),
                    x: rect.x + rect.width / 2 - width / 2 + dx,
                    y: rect.y + rect.height / 2 - height / 2 + dy,
                    width,
                    height,
                    blob,
                },
            ],
        },
    });
    if (!driver) return;
    if (added.res.error?.type === "unauthorized") {
        post({ type: "status", message: "Allow canvas access to put stickers on the board." });
        return;
    }
    if (added.res.error !== undefined) {
        post({ type: "status", message: "Could not add that sticker to the board." });
        return;
    }
    post({ type: "status", message: "Added to the board." });
}

async function handleWebviewMessage(message: FromWebview): Promise<void> {
    switch (message.type) {
        case "ready": {
            post({ type: "theme", css: stylingCss(driver?.styling ?? {}) });
            post({ type: "library", packs: await loadLibrary() });
            return;
        }
        case "search": {
            try {
                const packs = packsFromSearch(await fetchSearch(message.keyword));
                post({
                    type: "results",
                    requestId: message.requestId,
                    keyword: message.keyword,
                    packs,
                });
            } catch (err) {
                post({
                    type: "error",
                    requestId: message.requestId,
                    message: err instanceof Error ? err.message : "SigStick search failed.",
                });
            }
            return;
        }
        case "add": {
            await placeSticker(message.url);
            await remember(message.pack);
            return;
        }
        case "save": {
            const ok = await remember(message.pack);
            if (ok) post({ type: "status", message: "Added to your list." });
            return;
        }
        case "forget": {
            const packs = (await loadLibrary()).filter((pack) => pack.id !== message.id);
            const ok = await storeLibrary(packs);
            post({ type: "library", packs: ok ? packs : await loadLibrary() });
            if (ok) post({ type: "status", message: "Removed from your list." });
            return;
        }
    }
}

export const activate: DriverModule["activate"] = async ({
    manifest,
    issueCommand,
    styling,
    generateId,
}) => {
    driver = {
        manifest,
        issueCommand,
        generateId,
        styling,
        actionButtonId: `${manifest.driverId}:action-button`,
        webviewId: `${manifest.driverId}:webview`,
        placed: 0,
    };

    const created = await issueCommand({
        type: "command:dom:create-action-button",
        driverId: manifest.driverId,
        requestId: nextRequestId(),
        req: { domElementId: driver.actionButtonId, svg: ACTION_BUTTON_SVG },
    });
    if (!created.res.value?.created) return;

    await issueCommand({
        type: "subscription:dom:element-clicked",
        driverId: manifest.driverId,
        requestId: nextRequestId(),
        req: { domElementId: driver.actionButtonId },
    });
    await issueCommand({
        type: "subscription:webview:message",
        driverId: manifest.driverId,
        requestId: nextRequestId(),
        req: { webviewDomId: driver.webviewId },
    });
    await issueCommand({
        type: "subscription:dom:theme-changed",
        driverId: manifest.driverId,
        requestId: nextRequestId(),
    });
};

export const onEvent: DriverModule["onEvent"] = async (event) => {
    if (!driver) return;
    switch (event.type) {
        case "subscription:dom:theme-changed": {
            driver.styling = event.body.styling;
            post({ type: "theme", css: stylingCss(event.body.styling) });
            return;
        }
        case "subscription:dom:element-clicked": {
            if (event.body.domElementId !== driver.actionButtonId) return;
            const res = await driver.issueCommand({
                type: "command:webview:create",
                driverId: driver.manifest.driverId,
                requestId: nextRequestId(),
                req: {
                    webviewDomId: driver.webviewId,
                    htmlContent: WEBVIEW_HTML.replace(
                        "/*__DRAWDY_TOKENS__*/",
                        stylingCss(driver.styling),
                    ),
                    keepStateWhenClosed: true,
                },
            });
            if (driver && res.res.value?.created === false) {
                post({ type: "theme", css: stylingCss(driver.styling) });
                post({ type: "library", packs: await loadLibrary() });
            }
            return;
        }
        case "subscription:webview:message": {
            if (event.body.webviewDomId !== driver.webviewId) return;
            const message = parseFromWebview(event.body.message);
            if (!message) return;
            await handleWebviewMessage(message);
            return;
        }
        default:
            return;
    }
};
