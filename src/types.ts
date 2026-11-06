/** What the panel and device storage keep from a pack. */
export type PackView = {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    stickers: Array<{ url: string }>;
};
