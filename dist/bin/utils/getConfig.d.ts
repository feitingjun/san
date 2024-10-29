import { InlineConfig } from 'vite';
declare const _default: (mode: "development" | "production") => Promise<{
    config: InlineConfig;
    watchs: import("../../lib").AddWatch[];
}>;
export default _default;
