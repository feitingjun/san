import { UserConfig, ConfigEnv, Manifest } from '../../lib/types';
export declare const chalk: {
    blue: (text: string) => string;
    green: (text: string) => string;
    red: (text: string) => string;
};
/**获取用户配置 */
export declare const getUserConfig: (env: ConfigEnv) => Promise<UserConfig>;
/**临时文件动态导入ts方案 */
export declare const dynamicImportTs: (source: string) => Promise<any>;
/**根据handlebars模板写入文件 */
export declare const renderHbsTpl: ({ sourcePath, outPath, data }: {
    sourcePath: string;
    outPath: string;
    data?: object;
}) => void;
/**生成路由清单 */
export declare const generateRouteManifest: (srcDir?: string) => Manifest;
/**防抖函数 */
export declare const debounce: (fn: Function, delay: number) => (...args: any) => void;
