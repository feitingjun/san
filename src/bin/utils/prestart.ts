import { Plugin as VitePlugin } from 'vite'
import { ConfigEnv, UserConfig, PluginOptions, AddWatch } from '../../lib/types'
import { generateRouteManifest, getUserConfig } from './index'
import { createSanDir, WriteSanOptions } from './writeFile'
import { readFileSync, writeFileSync } from 'fs'
import { renderHbsTpl } from './index'
import modelPlugin from '../../plugins/model/index'
import keepAlivePlugin from '../../plugins/keepAlive/index'
import accessPlugin from '../../plugins/access/index'

const defaultPlugins = [
  modelPlugin(),
  keepAlivePlugin(),
  accessPlugin()
]

export default async (mode: 'development' | 'production'):Promise<{
  userConfig: UserConfig
  vitePlugins: VitePlugin[]
  watchs: AddWatch[]
}> => {
  const env: ConfigEnv = { mode }
  let userConfig = await getUserConfig(env)
  const srcDir = userConfig.srcDir || 'src'
  const plugins = [
    ...defaultPlugins,
    ...userConfig.plugins??[]
  ]

  let pkg
  try {
    pkg = JSON.parse(readFileSync(`${process.cwd()}/package.json`, 'utf-8'))
  }catch(e) {}
  // 配置上下文
  const context = {
    mode,
    root: process.cwd(),
    srcDir,
    userConfig,
    pkg
  }
  // 修改用户配置
  const modifyUserConfig: PluginOptions['modifyUserConfig'] = (fn) => {
    userConfig = fn(userConfig)
  }
  // 添加文件
  const addFile: PluginOptions['addFile'] = ({ content, outPath }) => {
    writeFileSync(outPath, content)
  }
  // 根据Handlebars模板写入文件
  const addFileTemplate: PluginOptions['addFileTemplate'] = (options) => {
    renderHbsTpl(options)
  }
  const pageConfig: WriteSanOptions['pageConfig'] = []
  // 添加pageConfig的配置
  const addPageConfigTypes: PluginOptions['addPageConfigTypes'] = (options) => {
    pageConfig.push(options)
  }
  const appTypes: WriteSanOptions['appTypes'] = []
  const addAppTypes: PluginOptions['addAppTypes'] = (options) => {
    appTypes.push(options)
  }
  const exports: WriteSanOptions['exports'] = []
  // 添加从san命名空间导出的模块
  const addExport: PluginOptions['addExport'] = (options) => {
    exports.push(options)
  }
  const imports: WriteSanOptions['imports'] = []
  // 在入口文件的最前面添加import
  const addEntryImport: PluginOptions['addEntryImport'] = (options) => {
    imports.push(options)
  }
  const aheadCodes: WriteSanOptions['aheadCodes'] = []
  // 在入口文件的最前插入代码
  const addEntryCodeAhead: PluginOptions['addEntryCodeAhead'] = (code) => {
    aheadCodes.push(code)
  }
  const tailCodes: WriteSanOptions['tailCodes'] = []
  // 在入口文件的最后插入代码
  const addEntryCodeTail: PluginOptions['addEntryCodeTail'] = (code) => {
    tailCodes.push(code)
  }
  // 运行时配置
  const runtimes: WriteSanOptions['runtimes'] = []
  const watchs: AddWatch[] = []
  // 添加文件变更监听
  const addWatch: PluginOptions['addWatch'] = (fn) => {
    watchs.push(fn)
  }
  const vitePlugins = plugins.map(v => {
    const { setup, runtime, ...args } = v
    if(runtime) runtimes.push(runtime)
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
    })
    return args
  })
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
  })
  return {
    userConfig,
    vitePlugins,
    watchs
  }
}