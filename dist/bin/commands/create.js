import inquirer from 'inquirer';
import fs from 'fs';
import { chalk } from "../utils/index.js";
import { writePackageJson, writeSanrcTs, writeAppTs, writeIndexHtml, writeIndexPageTsx, createSanDir } from "../utils/writeFile.js";
export default async () => {
    // 命令行提示
    const answers = await inquirer.prompt([{
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称',
            default: 'my-app'
        }, {
            type: 'input',
            name: 'srcDir',
            message: '请输入src文件夹名称',
            default: 'src'
        }, {
            type: 'input',
            name: 'description',
            message: '请输入项目描述',
        }]);
    const { projectName, srcDir } = answers;
    // 判断文件夹是否存在
    if (fs.existsSync(projectName)) {
        console.log(chalk.red(`目录${projectName} 已经存在`));
        return;
    }
    // 创建文件夹
    fs.mkdirSync(`${projectName}/${srcDir}`, { recursive: true });
    // // 创建src/pages文件夹
    // fs.mkdirSync(`${projectName}/src/pages`)
    // 创建package.json
    writePackageJson(answers);
    // 创建.sanrc.ts文件
    writeSanrcTs(projectName, srcDir);
    // 创建index.html文件
    writeIndexHtml(projectName, srcDir);
    // 创建src/app.ts
    writeAppTs(projectName, srcDir);
    // 创建page.tsx
    writeIndexPageTsx(projectName, srcDir);
    // 创建.san文件夹及文件
    createSanDir(projectName, srcDir);
    console.log(chalk.green(`项目${projectName} 创建成功`));
};
//# sourceMappingURL=create.js.map