import { definePlugin } from "../../lib/index.js";
import { resolve } from 'path';
export default definePlugin(() => ({
    name: 'access-plugin',
    setup: ({ addPageConfigTypes, addExport, addAppTypes }) => {
        addPageConfigTypes({
            specifier: ['AccessPageConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addExport({
            specifier: ['useAuth', 'Access', 'AccessHC', 'useAccess'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addAppTypes({
            specifier: ['AccessAppConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
    },
    runtime: resolve(import.meta.dirname, 'runtime.tsx')
}));
//# sourceMappingURL=index.js.map