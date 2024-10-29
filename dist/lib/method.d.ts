import { ManifestClient, DefaultPageConfig, LoaderData, AppContextType, AppConfig, Runtime } from './types';
export declare const useAppContext: <T>() => AppContextType<T>;
export declare const usePageConfig: <T>() => DefaultPageConfig<T>;
export declare const useLoaderData: <T = unknown>() => LoaderData<T>;
export declare const createApp: ({ manifest, app: appConfig, runtimes }: {
    manifest: ManifestClient;
    app: AppConfig;
    runtimes: Runtime[];
}) => void;
