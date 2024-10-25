import { definePlugin } from '../../lib/index'
import { resolve } from 'path'

export default definePlugin(() => ({
  name: 'keepAlive-plugin',
  setup({
    addExport,
    addEntryImport,
    addPageConfigTypes,
    addAppTypes
  }) {
    addPageConfigTypes({
      specifier: ['KeepAlivePageConfig'],
      source: resolve(import.meta.dirname, 'runtime')
    })
    addAppTypes({
      specifier: ['KeepAliveAppConfig'],
      source: resolve(import.meta.dirname, 'runtime')
    })
    addExport({
      specifier: [
        'KeepAlive',
        'AliveScope',
        'withActivation',
        'useActivate',
        'useUnactivate',
        'useAliveController',
        'withAliveScope',
        'CachingNode'
      ],
      source: 'react-activation'
    })
    addExport({
      specifier: ['useCachingNodes'],
      source: resolve(import.meta.dirname, 'runtime')
    })
    addEntryImport({
      source: resolve(import.meta.dirname, 'fixContext')
    })
  },
  runtime: resolve(import.meta.dirname, 'runtime.tsx')
}))