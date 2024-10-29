#!/usr/bin/env node
import { Command } from 'commander';
import create from "./commands/create.js";
import startServer from "./commands/dev.js";
import build from "./commands/build.js";
const program = new Command();
// 创建项目
program
    .command('create')
    .action(() => create());
program
    .command('dev')
    .description('启动开发服务器')
    .action(() => startServer());
program
    .command('build')
    .action(() => build());
program.parse(process.argv);
//# sourceMappingURL=index.js.map