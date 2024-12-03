import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import prestart from "./prestart.js";
export default async (mode) => {
    // 用户插件
    const { vitePlugins, userConfig, watchs } = await prestart(mode);
    const srcDir = userConfig.srcDir || 'src';
    let config = {
        configFile: false,
        mode,
        root: resolve(process.cwd(), srcDir),
        base: userConfig.basePath || '/',
        publicDir: userConfig.publicDir || 'public',
        resolve: {
            alias: {
                '@': resolve(process.cwd(), srcDir),
                san: resolve(process.cwd(), srcDir, '.san'),
                ...userConfig.alias
            }
        },
        css: {
            modules: {
                scopeBehaviour: 'local',
                globalModulePaths: [/\.global\.(css|less|sass|scss)$/],
                generateScopedName: '[local]__[hash:base64:5]',
                localsConvention: 'camelCaseOnly'
            },
            postcss: 'postcss.config.ts'
        },
        envDir: resolve(process.cwd(), '.env'),
        envPrefix: 'SAN_',
        plugins: [
            react(),
            ...vitePlugins
        ],
        server: {
            host: true,
            port: userConfig.port || 8000,
            strictPort: false,
            open: userConfig.open ?? true,
            proxy: userConfig.proxy
        },
        build: {
            outDir: userConfig.outDir || 'dist',
            chunkSizeWarningLimit: userConfig.chunkSizeWarningLimit || 500
        }
    };
    if (userConfig.vite && typeof userConfig.vite === 'function') {
        config = userConfig.vite(config);
    }
    return { config, srcDir, watchs };
};
//# sourceMappingURL=getConfig.js.map