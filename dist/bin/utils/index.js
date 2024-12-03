import { join, resolve, basename, extname } from 'path';
import ts from 'typescript';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
// import art from 'art-template'
import { globSync } from 'glob';
import hbs from 'handlebars';
hbs.registerHelper('isArray', function (value, options) {
    return hbs.Utils.isArray(value) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('isString', function (value, options) {
    return typeof value === 'string' ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('isEqual', function (value1, value2) {
    return value1 === value2;
});
hbs.registerHelper('and', function (value1, value2) {
    return value1 && value2;
});
hbs.registerHelper('or', function (value1, value2) {
    return value1 || value2;
});
hbs.registerHelper('rmTsx', function (value) {
    return value.replace(/\.tsx$/, '');
});
hbs.registerHelper('boolean', function (value) {
    return !!value;
});
hbs.registerHelper('space', function (value) {
    if (typeof value !== 'number') {
        value = 1;
    }
    return ' '.repeat(value);
});
export const chalk = {
    blue: (text) => {
        return `\x1b[34m${text}\x1b[0m`;
    },
    green: (text) => {
        return `\x1b[32m${text}\x1b[0m`;
    },
    red: (text) => {
        return `\x1b[31m${text}\x1b[0m`;
    }
};
/**获取用户配置 */
export const getUserConfig = async (env) => {
    const path = resolve(process.cwd(), '.sanrc.ts');
    if (!existsSync(path)) {
        return {};
    }
    const userConfig = (await dynamicImportTs(path)).default;
    if (typeof userConfig === 'function') {
        return await userConfig(env);
    }
    return userConfig;
};
/**临时文件动态导入ts方案 */
export const dynamicImportTs = (source) => {
    // 创建临时文件夹
    const tempDir = resolve(process.cwd(), 'node_modules', '.temp');
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }
    const filename = basename(source).replace(extname(source), '');
    const tsCode = readFileSync(source, 'utf-8');
    const result = ts.transpileModule(tsCode, {
        fileName: basename(source),
        compilerOptions: {
            module: ts.ModuleKind.ES2020
        }
    });
    const jsCode = result.outputText;
    // 写入临时文件
    const tmpPath = resolve(tempDir, filename + '.mjs');
    writeFileSync(tmpPath, jsCode);
    return import(/* @vite-ignore */ tmpPath);
};
// /**commonjs动态导入ts方案 */
// export const dynamicImport = (source:string) => {
//   const tsCode = readFileSync(source, 'utf-8')
//   const result = ts.transpileModule(tsCode, {
//     compilerOptions: {
//       module: ts.ModuleKind.CommonJS
//     }
//   })
//   const jsCode = result.outputText
//   const script = new vm.Script(jsCode)
//   const context = vm.createContext({
//     exports: {},
//     module: { exports: {} },
//     require: (moduleName: string) => {
//       if(isAbsolute(moduleName)) {
//         return require(moduleName)
//       }
//       let path = resolve(dirname(source), moduleName)
//       if(existsSync(path)) {
//         return require(path)
//       }
//       path = join(process.cwd(), 'node_modules', moduleName)
//       if(existsSync(path)){
//         return require(path)
//       }
//       throw new Error(`cannot find module '${moduleName}'
//       in ${source}`)
//     },
//     __dirname: dirname(source),
//     __filename: source
//   })
//   const modules = script.runInContext(context)
//   return modules
// }
/**根据handlebars模板写入文件 */
export const renderHbsTpl = ({ sourcePath, outPath, data = {} }) => {
    const rendered = hbs.compile(readFileSync(sourcePath, 'utf-8'))(data);
    if (rendered) {
        writeFileSync(outPath, rendered);
    }
    else {
        console.log(chalk.red(`加载模板文件失败: ${sourcePath}`));
    }
};
// /**根据art-template模板写入文件 */
// export const renderArtTpl = ({
//   filename,
//   outPath,
//   data = {}
// }: {
//   filename: string
//   outPath: string
//   data?: object
// }) => {
//   const rendered = art(resolve(import.meta.dirname, '..', 'template', filename) + '.art', data)
//   if (rendered) {
//     writeFileSync(outPath, rendered)
//   } else {
//     console.log(chalk.red(`加载模板文件失败: ${filename}.art`))
//   }
// }
/**生成路由清单 */
export const generateRouteManifest = (srcDir = 'src') => {
    srcDir = resolve(process.cwd(), srcDir);
    // 获取页面根目录
    const pageDir = existsSync(srcDir + '/pages') ? 'pages' : '';
    // 获取全局layout
    const rootLayout = globSync('layout{s,}{/index,}.tsx', { cwd: srcDir });
    // 获取所有页面
    const include = ['**/*{[^/],}page.tsx', '**/layout{/index,}.tsx'];
    const ignore = ['**/layout/**/*{[^/],}page.tsx', '**/layout/**/layout.tsx'];
    const pages = globSync(include, { cwd: resolve(srcDir, pageDir), ignore });
    // 获取id和文件的映射
    const idpaths = pages.reduce((prev, file) => {
        const id = file
            // 去除路径中文件夹为index的部分
            .replace(/index\//, '')
            // 去除结尾的index.tsx(layout才有) | (/)page.tsx | (/).page.tsx | (/)index.page.tsx
            .replace(/\/?((index)|((((\/|^)index)?\.)?page))?\.tsx$/, '')
            // 将user.detail 转换为 user/detail格式(简化目录层级)
            .replace('.', '/')
            // 将$id转换为:id
            .replace(/\$(\w+)/, ':$1')
            // 将$转换为通配符*
            .replace(/\$$/, '*')
            // 将404转换为通配符*
            .replace(/404$/, '*');
        prev[id || '/'] = file;
        return prev;
    }, {});
    const ids = Object.keys(idpaths).sort((a, b) => {
        const nA = a.replace(/\/?layout/, ''), nB = b.replace(/\/?layout/, '');
        return nA.length === nB.length ? a.indexOf('layout') : nB.length - nA.length;
    });
    // 生成路由清单
    const routesManifest = ids.reduce((prev, id, index) => {
        const parentId = ids.slice(index + 1).find(v => {
            return v.endsWith('layout') && id.startsWith(v.replace(/\/?layout/, ''));
        });
        const regex = new RegExp(`^${parentId?.replace(/\/?layout$/, '')}/?|/?layout$`, 'g');
        return {
            ...prev,
            [id]: {
                id,
                parentId,
                path: id === '/' ? '' : id.replace(regex, ''),
                pathname: id.replace(/\/?layout?$/, ''),
                file: join(pageDir, idpaths[id]),
                layout: id.endsWith('layout')
            }
        };
    }, {});
    if (rootLayout.length > 0 && pageDir) {
        Object.values(routesManifest).forEach(v => {
            if (!v.parentId)
                v.parentId = 'rootLayout';
        });
        routesManifest['rootLayout'] = {
            id: 'rootLayout',
            path: '',
            pathname: '',
            file: rootLayout[0].replace(/\.tsx$/, ''),
            layout: true
        };
    }
    return routesManifest;
};
/**防抖函数 */
export const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};
//# sourceMappingURL=index.js.map