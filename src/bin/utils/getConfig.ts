import { InlineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import prestart from './prestart'

export default async (mode: 'development' | 'production') => {
  // 用户插件
  const { vitePlugins, userConfig, watchs } = await prestart(mode)

  let config: InlineConfig = {
    configFile: false,
    mode,
    base: userConfig.basePath || '/',
    publicDir: userConfig.publicDir || 'public',
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        san: resolve(process.cwd(), '.san'),
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
      host: '0.0.0.0',
      port: userConfig.port || 8000,
      strictPort: false,
      open: userConfig.open??true,
      proxy: userConfig.proxy
    },
    build: {
      outDir: userConfig.outDir || 'dist',
      chunkSizeWarningLimit: userConfig.chunkSizeWarningLimit || 500
    }
  }
  if (userConfig.vite && typeof userConfig.vite === 'function') {
    config = userConfig.vite(config)
  }
  return { config, watchs }
}