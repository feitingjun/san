import { UserConfig, ConfigEnv, Plugin, Runtime } from './types';
export declare function defineConfig<T extends UserConfig | ((env: ConfigEnv) => UserConfig)>(config: T): T;
export declare const definePlugin: (plugin: (...args: any) => Plugin) => (...args: any) => Plugin;
export declare const defineRuntime: (fn: Runtime) => Runtime;
