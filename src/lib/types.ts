import { InlineConfig, ProxyOptions, Plugin as VitePlugin } from 'vite'
import { RouteObject } from 'react-router-dom'
import { ComponentType, PropsWithChildren } from 'react'
import { Stats } from 'fs'

export interface ConfigEnv {
  mode: 'development' | 'production'
}

/**路由清单项 */
export interface ManifestRoute{
  id: string
  path: string
  pathname: string
  parentId?: string
  file: string
  layout?: boolean
}

export type Manifest = { [key: string]: ManifestRoute }
export type ManifestClient = {
  [key: string]: ManifestRoute & { component: () => Promise<{
    default: ComponentType<PropsWithChildren<{}>>
    pageConfig?: PageConfig<any>
    dataLoader?: DataLoader
  }> }
}

/**用户.sanrc.ts配置项 */
export interface UserConfig {
  /**开发服务器端口 */
  port?: number
  /**基础路径 */
  basePath?: string
  /**输出路径 */
  outDir?: string
  /**静态资源存放路径(相对于outDir) */
  assetsDir?: string
  /**公共资源路径 */
  publicDir?: string
  /**导入别名 */
  alias?: Record<string, string>
  /**启动时是否打开浏览器 */
  open?: boolean
  /**开发服务器代理 */
  proxy?: Record<string, string | ProxyOptions>
  /**chunk大小警告的限制 */
  chunkSizeWarningLimit?: number
  /**修改vite配置 */
  vite?: (config: InlineConfig) => InlineConfig
  plugins?: Plugin[]
}

export type AppConfig<T={}> = {
  root?: string
  strict?: boolean
  router?: 'hash' | 'browser' | 'memory'
  appData?: any
  rootContainer?: (container: React.ReactNode) => React.ReactNode
  patchManifest?: (manifest:ManifestClient) => ManifestClient
  patchRoutes?: (routes:RouteObject[]) => RouteObject[]
} & T

export interface DataLoadeContext {
  pathname: string
  search: string
  params: Record<string, string>
}

export type DefaultPageConfig<T> = T & {
  pagename?: string
  [key: string]: any
}

export type DataLoader<T=any> = ((args: { 
  ctx: DataLoadeContext
}) => Promise<T>) | ((args: { 
  ctx: DataLoadeContext
}) => T)

export type LoaderData<T> = T extends DataLoader ? (ReturnType<T> extends Promise<infer D> ? D : ReturnType<T>) : T extends Promise<infer D> ? D : T

export type PageConfig<T, D=any> = DefaultPageConfig<T> | (({ ctx, data }: {
  ctx: DataLoadeContext,
  data: LoaderData<D>
}) => DefaultPageConfig<T>)

export interface AppContextType<T>{
  manifest: ManifestClient
  routes: RouteObject[],
  appData: T
}
export type AddWatch = (
  eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
  path: string,
  stats?: Stats
) => void

export interface PluginOptions {
  /**配置上下文 */
  context: {
    mode: 'development' | 'production'
    /**项目根目录 */
    root: string
    /**用户配置 */
    userConfig: UserConfig
    /**项目package.json内容 */
    pkg: any
  },
  /**修改用户配置 */
  modifyUserConfig: (fn: (config: UserConfig) => UserConfig) => void
  /**添加文件 */
  addFile: (options: {
    content:string,
    outPath: string
  }) => void
  /**根据Handlebars模板写入文件 */
  addFileTemplate: (options:{
    sourcePath:string,
    outPath: string,
    data?: any
  }) => void
  /**添加额外pageConfig类型 */
  addPageConfigTypes: (options: {
    specifier: string | string[]
    source: string
  }) => void
  /**添加额外的AppConfig类型 */
  addAppTypes: (options: {
    specifier: string | string[]
    source: string
  }) => void
  /**添加从san命名空间导出的模块 */
  addExport: (options: {
    specifier: string | string[]
    source: string
  }) => void
  /**在入口文件的最前面添加import */
  addEntryImport: (options: {
    specifier?: string | string[],
    source: string
  }) => void
  /**在入口文件的最前插入代码 */
  addEntryCodeAhead: (code:string) => void
  /**在入口文件的最后插入代码 */
  addEntryCodeTail: (code:string) => void
  /**添加文件变更监听 */
  addWatch: (fn: AddWatch) => void
}

export interface Plugin extends VitePlugin {
  setup?: (options: PluginOptions) => void
  runtime?: string
}

export type Provider = ComponentType<PropsWithChildren<{}>>
export type Wrapper = ComponentType<PropsWithChildren<{
  routeId: string
  layout?: boolean
  path: string
  pathname: string
  parentId?: string
}>>

export interface RuntimeOptions {
  /**运行时上下文信息 */
  appContext: {
    /**app配置 */
    appConfig: AppConfig
    /**路由清单 */
    manifest: ManifestClient
  }
  /**添加全局Provider */
  addProvider: (fn: Provider) => void
  /**给所有路由组件添加一层包裹 */
  addWrapper: (fn: Wrapper) => void
}

export type Runtime = (options:RuntimeOptions) => void

