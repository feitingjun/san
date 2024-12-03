import { Manifest } from '../../lib/types';
export interface AddFileOptions {
    specifier: string | string[];
    source: string;
}
export interface WriteSanOptions {
    manifest?: Manifest;
    pageConfig: AddFileOptions[];
    appTypes: AddFileOptions[];
    exports: AddFileOptions[];
    imports: (Omit<AddFileOptions, 'specifier'> & {
        specifier?: string | string[];
    })[];
    aheadCodes: string[];
    tailCodes: string[];
    runtimes: string[];
}
/**创建.san文件夹 */
export declare const createSanDir: (projectName: string, srcDir?: string, options?: {
    manifest?: Manifest;
    pageConfig: AddFileOptions[];
    appTypes: AddFileOptions[];
    exports: AddFileOptions[];
    imports: (Omit<AddFileOptions, "specifier"> & {
        specifier?: string | string[];
    })[];
    aheadCodes: string[];
    tailCodes: string[];
    runtimes: string[];
}) => void;
/**写入package.json */
export declare const writePackageJson: ({ projectName, description }: {
    projectName: string;
    description: string;
}) => void;
/**写入.sanrc.ts */
export declare const writeSanrcTs: (projectName: string, srcDir?: string) => void;
/**写入src/app.ts */
export declare const writeAppTs: (projectName: string, srcDir?: string) => void;
/**写入index.html文件 */
export declare const writeIndexHtml: (projectName: string, srcDir?: string) => void;
/**写入tsconfig.json文件 */
export declare const writeTsConfig: (projectName: string, srcDir?: string) => void;
/**写入.san/index.ts */
export declare const writeSanIndexTs: (sanDir: string, exports?: WriteSanOptions["exports"]) => void;
/**写入.san/entry.tsx */
export declare const writeEntryTsx: (sanDir: string, options?: {
    imports?: WriteSanOptions["imports"];
    aheadCodes?: WriteSanOptions["aheadCodes"];
    tailCodes?: WriteSanOptions["tailCodes"];
}) => void;
/**写入.san/routes.ts */
export declare const writeSanRoutesTs: (sanDir: string, manifest?: Manifest) => void;
/**写入src/page.tsx */
export declare const writeIndexPageTsx: (projectName: string, srcDir?: string) => void;
/**写入.san/types.ts */
export declare const writeSanTypesTs: (sanDir: string, pageConfig?: WriteSanOptions["pageConfig"], appTypes?: WriteSanOptions["appTypes"]) => void;
/**写入.san/define.ts */
export declare const writeSanDefineTs: (sanDir: string) => void;
/**写入.san/runtimes.ts */
export declare const wirteRuntime: (sanDir: string, runtimes?: WriteSanOptions["runtimes"]) => void;
