import { createServer, ViteDevServer } from 'vite'
import getConfig from '../utils/getConfig'
import { chalk, generateRouteManifest, debounce } from '../utils/index'
import { resolve, relative } from 'path'
import { existsSync } from 'fs'
import { writeSanRoutesTs } from '../utils/writeFile'

/**是否需要重新生成路由 */
const needGenerateRoutes = (path:string) => {
  // 匹配src目录下的layout(s).tsx | layout(s)/index.tsx
  const isRootLayout = /src\/(layout|layouts)(?:\/index)?\.tsx$/.test(path)
  // 匹配以(.)page.tsx | layout.tsx | layout/index.tsx 结尾且page.tsx不在layout(s)下的文件
  const isPageOrLayout = /^(?:(?!.*(layout|layouts)\/.*page\.tsx).)*\/((\S+\.)?page\.tsx|layout(\/index)?\.tsx)$/.test(path)
  // 是否在指定的pages目录下
  const inPagesDir = existsSync(resolve(process.cwd(), 'src', 'pages')) ? path.startsWith('src/pages') : path.startsWith('src')
  return (isRootLayout || (isPageOrLayout && inPagesDir) || path === 'src' || path === 'src/pages')
}

/**监听路由文件变化 */
const watchRoutes = async (server: ViteDevServer, event: string, path: string) => {
  // 获取项目根目录的的路径
  path = relative(process.cwd(), path)
  // 用户配置变更后重启服务器
  if (path === '.sanrc.ts') {
    console.log(chalk.green('.sanrc.ts 文件变更，服务器重启中...'))
    return restartServer(server)
  }
  // 重新生成路由
  if (event !== 'change' && needGenerateRoutes(path)){
    writeSanRoutesTs(process.cwd(), generateRouteManifest())
  }
}

/**重启开发服务器 */
const restartServer = async (server: ViteDevServer) => {
  await server.close();
  await startServer(true);
}

/**启动开发服务器 */
const startServer = async (restart?: boolean) => {
  // vite配置
  const { config, watchs } = await getConfig('development')
  // 创建开发服务器
  const server = await createServer(config)
  // 监听路由文件
  server.watcher.on('all', (event, path) => {
    debounce(() => watchRoutes(server, event, path), 150)()
  })
  server.watcher.on('all', (...args) => {
    watchs.forEach(watch => watch(...args))
  })
  // 启动开发服务器
  server.listen().then(() => {
    const address = server.httpServer?.address()
    if (typeof address === 'string') {
      console.log(chalk.green(`服务器${restart ? '重启' : '启动'}成功，访问 http://${address}`))
    } else {
      console.log(chalk.green(`服务器${restart ? '重启' : '启动'}成功，访问 http://localhost:${address?.port}`))
    }
  })
}

export default startServer