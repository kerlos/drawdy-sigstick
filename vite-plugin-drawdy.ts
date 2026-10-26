// build script, don't touch

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { buildExtension } from "./bundle";
import { SEARCH_API } from "./src/sigstick.ts";

const BUILT_PATH = "/built.drawdyx";
const VERSION_PATH = "/version";
const SEARCH_PATH = "/sigstick";

function allowBrowser(req: IncomingMessage, res: ServerResponse): void {
    const origin = req.headers.origin;
    if (typeof origin === "string" && origin.length > 0) {
        res.setHeader("access-control-allow-origin", origin);
        res.setHeader("access-control-allow-credentials", "true");
        res.setHeader("vary", "Origin");
    } else {
        res.setHeader("access-control-allow-origin", "*");
    }
    res.setHeader("access-control-allow-private-network", "true");
    res.setHeader("access-control-allow-methods", "GET, OPTIONS");
    const requested = req.headers["access-control-request-headers"];
    if (typeof requested === "string") {
        res.setHeader("access-control-allow-headers", requested);
    }
}

export function drawdyExtension(): Plugin {
    let root = process.cwd();
    let bytes: Uint8Array | null = null;
    let version = 0;
    let building = false;
    let pending = false;
    let log: (message: string) => void = () => {};

    const build = async (): Promise<void> => {
        if (building) {
            pending = true;
            return;
        }
        building = true;
        try {
            const packed = await buildExtension(root);
            bytes = packed.bytes;
            version++;
            log(
                `built v${version} (${packed.manifest.driverId}, ${bytes.byteLength} bytes)`
            );
        } catch (err) {
            log(`build failed: ${err instanceof Error ? err.message : err}`);
        } finally {
            building = false;
            if (pending) {
                pending = false;
                void build();
            }
        }
    };

    return {
        name: "drawdy-extension",
        configResolved(config) {
            root = config.root;
            log = (message) => config.logger.info(`[drawdy] ${message}`);
        },
        configureServer(server) {
            process.env.DRAWDY_DEV_PROXY = "1";
            void build();
            return () => {
                server.middlewares.use((req, res, next) => {
                    const path = (req.url ?? "/").split("?")[0];
                    if (path !== BUILT_PATH && path !== VERSION_PATH && path !== SEARCH_PATH) {
                        next();
                        return;
                    }
                    allowBrowser(req, res);
                    res.setHeader("cache-control", "no-store");
                    if (req.method === "OPTIONS") {
                        res.statusCode = 204;
                        res.end();
                        return;
                    }
                    if (path === SEARCH_PATH) {
                        const keyword =
                            new URL(req.url ?? "/", "http://127.0.0.1").searchParams.get("keyword") ?? "";
                        const upstream =
                            SEARCH_API + encodeURIComponent(keyword.trim().slice(0, 200));
                        void fetch(upstream)
                            .then(async (upstreamRes) => {
                                const body = Buffer.from(await upstreamRes.arrayBuffer());
                                res.statusCode = upstreamRes.ok ? 200 : upstreamRes.status;
                                res.setHeader("content-type", "application/json");
                                res.end(body);
                            })
                            .catch(() => {
                                res.statusCode = 502;
                                res.setHeader("content-type", "application/json");
                                res.end(JSON.stringify({ error: "SigStick search unreachable" }));
                            });
                        return;
                    }
                    if (path === VERSION_PATH) {
                        res.setHeader("content-type", "application/json");
                        res.end(JSON.stringify({ version }));
                        return;
                    }
                    if (!bytes) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.setHeader("content-type", "application/zip");
                    res.end(Buffer.from(bytes));
                });
                const stack = server.middlewares.stack;
                stack.unshift(stack.pop()!);
            };
        },
        hotUpdate(ctx) {
            if (ctx.file.includes("/dist/")) return;
            void build();
        },
    };
}
