import { Plugin as VitePlugin } from 'vite';
import { UserConfig, AddWatch } from '../../lib/types';
declare const _default: (mode: "development" | "production") => Promise<{
    userConfig: UserConfig;
    vitePlugins: VitePlugin[];
    watchs: AddWatch[];
}>;
export default _default;
