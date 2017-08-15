#!/usr/bin/env node

let program = require('commander');
let chalk = require('chalk');
let pkg = require('./package.json');
let handlers = require('./src/handlers');

program.version(pkg.version);

program
  .command('init [version]')
  .description('初始化sbom')
  .action((version) => {

    handlers.init(version);
  });

program
  .command('version')
  .description('当前sbom版本号')
  .action(() => {

    handlers.version(version);
  });

program
  .command('ls')
  .description('sbom版本号列表')
  .action(() => {

    handlers.list();
  });

program
  .command('update <version>')
  .description('更新sbom至指定版本号')
  .action((version) => {

    handlers.update(version);
  });

program
  .command('rm')
  .description('移除sbom相关')
  .action(() => {
    handlers.remove();
  });

program
  .command('*')
  .action((env) => {

    console.log(chalk.red('sbom不存在命令：') + chalk.yellow('%s'), env);
  });

program.parse(process.argv);