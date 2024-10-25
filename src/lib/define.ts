import {
  PageConfig,
  DataLoader,
  AppConfig,
  UserConfig,
  ConfigEnv,
  Plugin,
  Runtime
} from './types'

export function defineConfig<T extends UserConfig|((env:ConfigEnv) => UserConfig)>(config:T){
  return config
}

export const definePlugin = (plugin: (...args:any) => Plugin) => plugin

export const defineRuntime = (fn:Runtime) => fn