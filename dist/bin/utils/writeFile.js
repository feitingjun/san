import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { renderHbsTpl } from "./index.js";
const TMP_DIR = resolve(import.meta.dirname, '..', 'template');
/**创建.san文件夹 */
export const createSanDir = (projectName, srcDir = 'src', options) => {
    const { manifest, pageConfig, appTypes, exports, imports, aheadCodes, tailCodes, runtimes } = options || {};
    const sanDir = resolve(projectName, srcDir, '.san');
    if (!existsSync(sanDir)) {
        mkdirSync(sanDir, { recursive: true });
    }
    // 创建.san/tsconfig.json
    writeTsConfig(projectName, srcDir);
    // 创建.san/index.ts
    writeSanIndexTs(sanDir, exports);
    // 创建.san/entry.tsx
    writeEntryTsx(sanDir, {
        imports, aheadCodes, tailCodes
    });
    // 创建.san/types.ts
    writeSanTypesTs(sanDir, pageConfig, appTypes);
    // 创建.san/define.ts
    writeSanDefineTs(sanDir);
    // 创建.san/routes.ts
    writeSanRoutesTs(sanDir, manifest);
    wirteRuntime(sanDir, runtimes);
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
export const writeSanrcTs = (projectName, srcDir = 'src') => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/.sanrc.ts.hbs',
        outPath: `${projectName}/.sanrc.ts`,
        data: { srcDir }
    });
};
/**写入src/app.ts */
export const writeAppTs = (projectName, srcDir = 'src') => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/app.ts.hbs',
        outPath: `${projectName}/${srcDir}/app.ts`,
    });
};
/**写入index.html文件 */
export const writeIndexHtml = (projectName, srcDir = 'src') => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/index.html.hbs',
        outPath: `${projectName}/${srcDir}/index.html`,
        data: { projectName }
    });
};
/**写入tsconfig.json文件 */
export const writeTsConfig = (projectName, srcDir = 'src') => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/tsconfig.json.hbs',
        outPath: `${projectName}/${srcDir}/.san/tsconfig.json`,
        data: { srcDir, level: srcDir.split('/').length }
    });
    if (!existsSync(`${projectName}/tsconfig.json`)) {
        writeFileSync(`${projectName}/tsconfig.json`, `{
  "extends": "./${srcDir}/.san/tsconfig.json"
}`);
    }
};
/**写入.san/index.ts */
export const writeSanIndexTs = (sanDir, exports) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/index.ts.hbs',
        outPath: `${sanDir}/index.ts`,
        data: { exports }
    });
};
/**写入.san/entry.tsx */
export const writeEntryTsx = (sanDir, options) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/entry.tsx.hbs',
        outPath: `${sanDir}/entry.tsx`,
        data: options
    });
};
/**写入.san/routes.ts */
export const writeSanRoutesTs = (sanDir, manifest = { '/': { id: '/', path: '', pathname: '', file: 'page.tsx' } }) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/manifest.ts.hbs',
        outPath: `${sanDir}/manifest.ts`,
        data: { manifest: Object.values(manifest).sort((a, b) => {
                const nA = a.id.replace(/\/?layout/, ''), nB = b.id.replace(/\/?layout/, '');
                return nA.length === nB.length ? b.id.indexOf('layout') : nA.length - nB.length;
            }) }
    });
};
/**写入src/page.tsx */
export const writeIndexPageTsx = (projectName, srcDir = 'src') => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/page.tsx.hbs',
        outPath: `${projectName}/${srcDir}/page.tsx`,
    });
};
/**写入.san/types.ts */
export const writeSanTypesTs = (sanDir, pageConfig, appTypes) => {
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
        outPath: `${sanDir}/types.ts`,
        data: { all, pageConfig, appTypes }
    });
};
/**写入.san/define.ts */
export const writeSanDefineTs = (sanDir) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/define.ts.hbs',
        outPath: `${sanDir}/define.ts`
    });
};
/**写入.san/runtimes.ts */
export const wirteRuntime = (sanDir, runtimes) => {
    renderHbsTpl({
        sourcePath: TMP_DIR + '/runtime.ts.hbs',
        outPath: `${sanDir}/runtime.ts`,
        data: { runtimes }
    });
};
//# sourceMappingURL=writeFile.js.map