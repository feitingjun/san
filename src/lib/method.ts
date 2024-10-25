
import { createRoot } from 'react-dom/client'
import {
  createElement,
  StrictMode,
  ReactNode,
  createContext,
  useContext
} from 'react'
import {
  RouteObject,
  useLoaderData as useRouteLoaderData,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  LoaderFunction,
  RouterProvider
} from 'react-router-dom'
import {
  ManifestClient,
  DefaultPageConfig,
  DataLoader,
  LoaderData,
  DataLoadeContext,
  AppContextType,
  AppConfig,
  Runtime,
  RuntimeOptions,
  Manifest,
  ManifestRoute,
  Provider,
  Wrapper
} from './types'

const AppContext = createContext<AppContextType<any>>({
  manifest: {},
  routes: [],
  appData: undefined
})

export const useAppContext = <T>() => {
  return useContext<AppContextType<T>>(AppContext)
}

export const usePageConfig = <T>() => {
  const { pageConfig } = useRouteLoaderData() as { pageConfig: DefaultPageConfig<T> }
  return pageConfig
}

export const useLoaderData = <T=unknown>() => {
  const { data } = useRouteLoaderData() as { data: LoaderData<T> }
  return data
}

const loader = (module:{
  dataLoader?: DataLoader<any>
  pageConfig?: DefaultPageConfig<any>
}): LoaderFunction => {
  const { dataLoader, pageConfig={} } = module
  return async ({ request }) => {
    const { pathname, search, searchParams } = new URL(request.url)
    const ctx:DataLoadeContext = {
      pathname,
      search,
      params: Object.fromEntries(searchParams.entries())
    }
    const data = dataLoader && typeof dataLoader === 'function' ? await dataLoader({ ctx }) : dataLoader
    return {
      data: data,
      pageConfig: typeof pageConfig === 'function' ? await pageConfig({
        ctx, data
      }) : pageConfig
    }
  }
}

const generateRoutes = (
  manifest: ManifestClient,
  wrappers: Wrapper[],
  parentId?: string
): RouteObject[] => {
  return Object.values(manifest)
    .filter(v => v.parentId == parentId)
    .map(v => {
      return {
        id: v.id,
        path: v.path,
        pathname: v.pathname,
        parendId: v.parentId,
        layout: v.layout,
        async lazy() {
          const module = await v.component()
          return {
            loader: loader(module),
            Component: () => wrappers.reduce((acc, fn) => {
              return createElement(fn, {
                routeId: v.id,
                layout: v.layout,
                path: v.path,
                pathname: v.pathname,
                parentId: v.parentId,
              }, acc)
            }, createElement(module.default, null)),
          }
        },
        children: generateRoutes(manifest, wrappers, v.id)
      }
    })
}


/**根据路由清单递归生成路由 */
const generateRoutesByManifest = (manifest: Manifest, parentId?: string): (ManifestRoute&{children?: ManifestRoute[]})[] => {
  return Object.values(manifest)
    .filter(v => v.parentId == parentId)
    .map(v => {
      const children = generateRoutesByManifest(manifest, v.id)
      return {
        ...v,
        children
      }
    })
}

export const createApp = ({
  manifest,
  app: appConfig,
  runtimes
}:{
  manifest: ManifestClient,
  app: AppConfig
  runtimes: Runtime[]
}) => {
  const { root='app', strict, router: mode, patchManifest, patchRoutes, appData, rootContainer } = appConfig??{}
  // 处理插件运行时
  const providers: Provider[] = []
  const wrappers: Wrapper[] = []
  const addProvider: RuntimeOptions['addProvider'] = (fn) => {
    providers.push(fn)
  }
  const addWrapper: RuntimeOptions['addWrapper'] = (fn) => {
    wrappers.push(fn)
  }
  runtimes?.forEach(runtime => {
    runtime({
      appContext: {
        manifest,
        appConfig
      },
      addProvider,
      addWrapper
    })
  })

  let createRouter = createBrowserRouter
  if(mode === 'hash') {
    createRouter = createHashRouter
  }
  if(mode === 'memory') {
    createRouter = createMemoryRouter
  }
  if(patchManifest && typeof patchManifest === 'function'){
    manifest = patchManifest(manifest)
  }
  let routes = generateRoutes(manifest, wrappers)
  if(patchRoutes && typeof patchRoutes === 'function'){
    routes = patchRoutes(routes)
  }
  const router = createRouter(routes)
  let app:ReactNode = createElement(RouterProvider, { router }, null)

  app = providers.reduce((acc, fn) => {
    return createElement(fn, null, acc)
  }, app)

  app = createElement(AppContext.Provider, { value: {
    manifest,
    routes,
    appData
  } }, app)

  if(rootContainer && typeof rootContainer === 'function'){
    app = rootContainer(app)
  }
  if(strict){
    app = createElement(StrictMode, null, app)
  }

  let rootEle = document.getElementById(root)
  if(!rootEle){
    rootEle = document.createElement('div')
    rootEle.id = root
    document.body.appendChild(rootEle) 
  }
  createRoot(rootEle).render(app)
}