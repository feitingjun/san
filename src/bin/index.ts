#!/usr/bin/env node
import { Command } from 'commander'
import create from './commands/create'
import startServer from './commands/dev'
import build from './commands/build'

const program = new Command()

// 创建项目
program
.command('create')
.action(() => create())

program
.command('dev')
.description('启动开发服务器')
.action(() => startServer())

program
.command('build')
.action(() => build())

program.parse(process.argv)