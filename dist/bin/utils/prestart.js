import { generateRouteManifest, getUserConfig } from "./index.js";
import { createSanDir } from "./writeFile.js";
import { readFileSync, writeFileSync } from 'fs';
import { renderHbsTpl } from "./index.js";
import modelPlugin from "../../plugins/model/index.js";
import keepAlivePlugin from "../../plugins/keepAlive/index.js";
import accessPlugin from "../../plugins/access/index.js";
const defaultPlugins = [
    modelPlugin(),
    keepAlivePlugin(),
    accessPlugin()
];
export default async (mode) => {
    const env = { mode };
    let userConfig = await getUserConfig(env);
    const srcDir = userConfig.srcDir || 'src';
    const plugins = [
        ...defaultPlugins,
        ...userConfig.plugins ?? []
    ];
    let pkg;
    try {
        pkg = JSON.parse(readFileSync(`${process.cwd()}/package.json`, 'utf-8'));
    }
    catch (e) { }
    // 配置上下文
    const context = {
        mode,
        root: process.cwd(),
        srcDir,
        userConfig,
        pkg
    };
    // 修改用户配置
    const modifyUserConfig = (fn) => {
        userConfig = fn(userConfig);
    };
    // 添加文件
    const addFile = ({ content, outPath }) => {
        writeFileSync(outPath, content);
    };
    // 根据Handlebars模板写入文件
    const addFileTemplate = (options) => {
        renderHbsTpl(options);
    };
    const pageConfig = [];
    // 添加pageConfig的配置
    const addPageConfigTypes = (options) => {
        pageConfig.push(options);
    };
    const appTypes = [];
    const addAppTypes = (options) => {
        appTypes.push(options);
    };
    const exports = [];
    // 添加从san命名空间导出的模块
    const addExport = (options) => {
        exports.push(options);
    };
    const imports = [];
    // 在入口文件的最前面添加import
    const addEntryImport = (options) => {
        imports.push(options);
    };
    const aheadCodes = [];
    // 在入口文件的最前插入代码
    const addEntryCodeAhead = (code) => {
        aheadCodes.push(code);
    };
    const tailCodes = [];
    // 在入口文件的最后插入代码
    const addEntryCodeTail = (code) => {
        tailCodes.push(code);
    };
    // 运行时配置
    const runtimes = [];
    const watchs = [];
    // 添加文件变更监听
    const addWatch = (fn) => {
        watchs.push(fn);
    };
    const vitePlugins = plugins.map(v => {
        const { setup, runtime, ...args } = v;
        if (runtime)
            runtimes.push(runtime);
        setup?.({
            context,
            modifyUserConfig,
            addFile,
            addFileTemplate,
            addPageConfigTypes,
            addAppTypes,
            addExport,
            addEntryImport,
            addEntryCodeAhead,
            addEntryCodeTail,
            addWatch
        });
        return args;
    });
    // 创建.san文件夹
    createSanDir(process.cwd(), srcDir, {
        manifest: generateRouteManifest(srcDir),
        pageConfig,
        appTypes,
        exports,
        imports,
        aheadCodes,
        tailCodes,
        runtimes
    });
    return {
        userConfig,
        vitePlugins,
        watchs
    };
};
//# sourceMappingURL=prestart.js.map