export type SigStickSearchResultResponse = {
    pageProps: {
        packs: Array<{
            id: string;
            title: string;
            author: string;
            authorId?: string;
            status: string;
            createdAt: number;
            cover: {
                url: string;
            };
            stickers: Array<{
                emoji: any;
                url: string;
            }>;
            isMarketPublished: boolean;
            download: number;
            version?: number;
            signal: {
                version: number;
            };
            signalUrl: string;
            whatsapp: {
                isAnimated: boolean;
                v: number;
                version: number;
            };
            telegram: {
                version: number;
                v?: number;
            };
            telegramUrl: string;
            tags?: Array<string>;
            expansions: {
                authorDetails: {
                    isArtist: boolean;
                };
            };
            stats: {
                views: number;
                opens: number;
                shares: number;
            };
            ogImageUrl: string;
            linkUser?: boolean;
            isNsfw?: boolean;
            social?: {
                instagram: string;
                twitter: string;
                facebook: string;
            };
            recentPopularity?: number;
            locale?: {
                en: string;
            };
        }>;
        type: string;
        keyword: string;
        author: string;
        tag: string;
        nextStartAfter: number;
    };
    __N_SSP: boolean;
};

/** What the panel and device storage keep from a pack. */
export type PackView = {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    stickers: Array<{ url: string }>;
};
