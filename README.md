# 基于vite的自用React脚手架

## 创建项目
```
san create <projectName>
```

## 启动项目
```
san dev
```

## 路由根目录
若src目录下存在pages目录，则pages目录为路由根目录，否则src文件为路由根目录

## 约定式路由
框架会根据项目的目录结构自动生成对应的路由信息

### 布局组件(嵌套路由)
src目录下的 layout.tsx | layouts.tsx | layout/index.tsx | layouts/index.tsx将被解析为全局Layout  
路由根目录下的 layout.tsx | layout/index.tsx 将被解析为对应路径的布局组件


### 路由组件
路由根目录下所有的 page.tsx 和以 .page.tsx 结尾的文件将被解析为路由组件

### 动态路由
以 $ 开头的文件或目录被解析为动态路由，如 $id.tsx | $id/page.tsx 被解析为:id

### 通配路由(404)
$.tsx | 404.tsx 被解析为 *，即通配路由

#### 详细解析规则  
| 文件路径 | 路由 |
|---------|-------|
| page.tsx, index.page.tsx, index/page.tsx, index/index.page.tsx | / |
| $id.tsx, $id/page.tsx | :id |
| $.tsx, 404.tsx | * |
| user.page.tsx, user/page.tsx, user/index.page.tsx | user |
| user/detail.page.tsx, user/detail/page.tsx | user/detail |
| 可以使用 . 分割文件名的方式简化多层目录，如 user.detail.page.tsx 和 user/detail/page.tsx等  | user/detail |
| 同样的 layout 文件也可以使用这种方式简化目录，如 user.layout.tsx 和 user/layout.tsx等效 |
| user.layout.tsx 也可以作为 user/page.tsx, user/detail.page.tsx 的layout组件生效 |

## PageConfig(页面配置)
路由文件导出的 pageConfig 将被作为当前路由的配置，在页面内可以通过usePageConfig获得
```
import { usePageConfig, definePageConfig } from 'san'

// export const pageConfig = definePageConfig({
//   pagename: '首页'
// }) 

export const pageConfig = definePageConfig(({ ctx, data }) => {
  return {
    pagename: '首页'
  }
}) 

export default () => {

  const { pagename } = usePageConfig()

  return (
    <div>首页</div>
  )
}

```

## DataLoader(页面数据加载)
路由文件导出的 dataLoader 将被作为当前路由的loader，在页面内可以通过useLoaderData获得
```
import { useLoaderData, defineDataLoader } from 'san'


export const dataLoader = defineDataLoader(({
  params,
  pathname: string
  search: string
}) => {
  // 在此请求数据，返回的数据会传给pageConfig
}) 

export default () => {

  const data = useLoaderData<typeof dataLoader>()

  return (
    <div>首页</div>
  )
}

```

## AppConfig(App配置)
可以在src下面的app.ts修改应用配置

```
export type AppConfig<T={}> = {
  // 根节点，默认app
  root?: string
  // 是否启用react的严格模式
  strict?: boolean
  // router类型
  router?: 'hash' | 'browser' | 'memory'
  appData?: any
  // 插入根节点前修改根组件
  rootContainer?: (container: React.ReactNode) => React.ReactNode
  // 运行时修改路由清单
  patchManifest?: (manifest:ManifestClient) => ManifestClient
  // 运行时修改路由
  patchRoutes?: (routes:RouteObject[]) => RouteObject[]
} & T
```

## .sanrc.ts(用户配置)
```
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
  /**插件 */
  plugins?: Plugin[]
}
```

## Plugin(插件)
在vite插件的基础上添加了 setup 和 runtime
```
export interface Plugin extends VitePlugin {
  setup?: (options: PluginOptions) => void
  runtime?: string
}
```

### PluginOptions
```
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
```

### RuntimeOptions
```
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
```