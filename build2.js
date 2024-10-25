import esbuild from 'esbuild'
import fs from 'fs'
import { dirname, extname, join, resolve } from 'path'

// 递归遍历入口
const getEntry = (dir) => {
  const files = fs.readdirSync(dir)
  const entry = []
  files.forEach(v => {
    const path = `${dir}/${v}`
    if(fs.statSync(path).isDirectory()){
      entry.push(...getEntry(path))
    }else if(extname(path) === '.ts' || extname(path) === '.js'){
      entry.push(path)
    }
  })
  return entry
}

// 复制非 TypeScript 文件到输出目录
function copyNonTsFiles(srcDir, outDir) {
  fs.readdirSync(srcDir).forEach(file => {
    const fullPath = join(srcDir, file);
    const outPath = join(outDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // 如果是目录，递归复制
      if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath, { recursive: true });
      }
      copyNonTsFiles(fullPath, outPath);
    } else if (extname(fullPath) !== '.ts') {
      // 只复制非.ts 文件
      fs.copyFileSync(fullPath, outPath);
      console.log(`复制文件: ${fullPath} -> ${outPath}`);
    }
  });
}

// 判断忽略后缀名的文件是否存在
const hasFile = (dir, libname) => {
  for (const ext of ['.js', '.ts']) {
    const path = resolve(dir, libname+ext)
    if(fs.existsSync(path)) {
      return true
    }
  }
}

// 给导入的js或者ts文件添加扩展名
const addJsExtensionPlugin = () => {
  return {
    name: 'add-js-extensions',
    setup(build) {
      build.onLoad({ filter: /\.(ts|js)$/, namespace: 'file' }, async (args) => {
        const ext = extname(args.path)
        // 只处理 .ts 和 .js 文件
        if(ext !== '.ts' && ext !== '.js') return
        const contents = await fs.promises.readFile(args.path, 'utf8')
        const modifiedContents = contents.replace(/(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g, (match, libname) => {
          // 有后缀名不处理
          if(extname(libname)){
            return match
          }
          // 判断是否存在ts或者js文件
          const has = hasFile(dirname(args.path), libname)
          const index = match.lastIndexOf(libname)
          if(has && index > -1){
            return match.substring(0, index) + libname + '.js' + match.substring(index + libname.length)
          }
          return match
        })
        return { contents: modifiedContents, loader: ext.substring(1) }
      })
    }
  }
}

esbuild.build({
  entryPoints: getEntry('./src'),
  bundle: false,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  target: 'es2020',
  sourcemap: true,
  plugins: [addJsExtensionPlugin()]
}).then(() => {
  console.log('构建成功')
  copyNonTsFiles('./src', './dist')
})