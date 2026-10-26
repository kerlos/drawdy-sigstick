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

const ACTION_BUTTON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="18" height="18"><image href="data:image/png;base64,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" width="96" height="96"/></svg>`;

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
