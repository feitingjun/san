import ts from 'typescript'
import fs from 'fs'
import { dirname, extname, resolve, join } from 'path'

// 判断是否需要添加后缀
const needAddSuffix = (dir, libname) => {
  if(extname(libname)) return
  for (const ext of ['.js', '.ts']) {
    const path = resolve(dir, libname+ext)
    if(fs.existsSync(path)) {
      return true
    }
  }
}

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
    }
  });
}

const program = ts.createProgram({
  rootNames: getEntry('src'),
  options: {
    rootDir: './src',
    outDir: './dist',
    target: ts.ScriptTarget.ES2020,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    module: ts.ModuleKind.ES2020,
    skipLibCheck: true,
    declaration: true,
    sourceMap: true
  }
})

program.emit(undefined, undefined, undefined, undefined, {
  after: [(ctx) => {
    return (file) => {
      const dir = dirname(file.fileName)
      const visitor = (node) => {
        const libname = node.moduleSpecifier?.text
        if(ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && needAddSuffix(dir, libname)) {
          // 更新导入声明
          return ts.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            ts.factory.createStringLiteral(libname + '.js'),
            node.attributes
          )
        }
        if(ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && needAddSuffix(dir, libname)) {
          return ts.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            ts.factory.createStringLiteral(libname + '.js'),
            node.attributes
          )
        }
        return ts.visitEachChild(node, visitor, ctx);
      }
      return ts.visitNode(file, visitor);
    }
  }]
})
copyNonTsFiles('src', 'dist')
console.log(`\x1b[32m构建成功\x1b[0m`)