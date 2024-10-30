import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { renderHbsTpl } from "./index.js";
const TMP_DIR = resolve(import.meta.dirname, '..', 'template');
/**创建.san文件夹 */
export const createSanDir = (projectName, options) => {
    const { manifest, pageConfig, appTypes, exports, imports, aheadCodes, tailCodes, runtimes } = options || {};
    if (!existsSync(`${projectName}/.san`)) {
        mkdirSync(`${projectName}/.san`);
    }
    // 创建.san/tsconfig.json
    writeTsConfig(projectName);
    // 创建.san/index.ts
    writeSanIndexTs(projectName, exports);
    // 创建.san/entry.tsx
    writeEntryTsx(projectName, {
        imports, aheadCodes, tailCodes
    });
    // 创建.san/types.ts
    writeSanTypesTs(projectName, pageConfig, appTypes);
    // 创建.san/define.ts
    writeSanDefineTs(projectName);
    // 创建.san/routes.ts
    writeSanRoutesTs(projectName, manifest);
    wirteRuntime(projectName, runtimes);
};
/**写入package.json */
export const writePackageJson = ({ projectName, description }) => {
    const packageJson = readFileSync(resolve(import.meta.dirname, '../../../package.json'), 'utf-8');
    const { version } = JSON.parse(packageJson);
    renderHbsTpl({
        sourcePath: TMP_DIR + '/package.json.hbs',
        outPath: `${projectName}/package.json`,
        data: {
            projectName,
            description,
            version
        }
    });
};
/**写入.sanrc.ts */
export const writeSanrcTs = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/.sanrc.ts.hbs',
        outPath: `${projectName}/.sanrc.ts`,
    });
};
/**写入src/app.ts */
export const writeAppTs = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/app.ts.hbs',
        outPath: `${projectName}/src/app.ts`,
    });
};
/**写入index.html文件 */
export const writeIndexHtml = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/index.html.hbs',
        outPath: `${projectName}/index.html`,
        data: { projectName }
    });
};
/**写入tsconfig.json文件 */
export const writeTsConfig = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/tsconfig.json.hbs',
        outPath: `${projectName}/.san/tsconfig.json`,
    });
    if (!existsSync(`${projectName}/tsconfig.json`)) {
        writeFileSync(`${projectName}/tsconfig.json`, `{
  "extends": "./.san/tsconfig.json"
}`);
    }
};
/**写入.san/index.ts */
export const writeSanIndexTs = (projectName, exports) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/index.ts.hbs',
        outPath: `${projectName}/.san/index.ts`,
        data: { exports }
    });
};
/**写入.san/entry.tsx */
export const writeEntryTsx = (projectName, options) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/entry.tsx.hbs',
        outPath: `${projectName}/.san/entry.tsx`,
        data: options
    });
};
/**写入.san/routes.ts */
export const writeSanRoutesTs = (projectName, manifest = { '/': { id: '/', path: '', pathname: '', file: 'page.tsx' } }) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/manifest.ts.hbs',
        outPath: `${projectName}/.san/manifest.ts`,
        data: { manifest: Object.values(manifest).sort((a, b) => {
                const nA = a.id.replace(/\/?layout/, ''), nB = b.id.replace(/\/?layout/, '');
                return nA.length === nB.length ? b.id.indexOf('layout') : nA.length - nB.length;
            }) }
    });
};
/**写入src/page.tsx */
export const writeIndexPageTsx = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/page.tsx.hbs',
        outPath: `${projectName}/src/page.tsx`,
    });
};
/**写入.san/types.ts */
export const writeSanTypesTs = (projectName, pageConfig, appTypes) => {
    const all = [...pageConfig ?? [], ...appTypes ?? []].reduce((acc, item) => {
        const index = acc.findIndex(v => v.source === item.source);
        if (index > -1 && Array.isArray(item.specifier) && Array.isArray(acc[index].specifier)) {
            acc[index].specifier = [...acc[index].specifier, ...item.specifier];
        }
        else {
            acc.push(item);
        }
        return acc;
    }, []);
    renderHbsTpl({
        sourcePath: TMP_DIR + '/types.ts.hbs',
        outPath: `${projectName}/.san/types.ts`,
        data: { all, pageConfig, appTypes }
    });
};
/**写入.san/define.ts */
export const writeSanDefineTs = (projectName) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/define.ts.hbs',
        outPath: `${projectName}/.san/define.ts`
    });
};
/**写入.san/runtimes.ts */
export const wirteRuntime = (projectName, runtimes) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/runtime.ts.hbs',
        outPath: `${projectName}/.san/runtime.ts`,
        data: { runtimes }
    });
};
//# sourceMappingURL=writeFile.js.map