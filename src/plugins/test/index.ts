import { definePlugin } from '../../lib/index'
import { resolve } from 'path'

export default definePlugin(() => ({
  name: 'test-plugin',
  setup: ({ addEntryCodeAhead }) => {
    
  },
  runtime: resolve(import.meta.dirname, 'runtime.tsx')
}))