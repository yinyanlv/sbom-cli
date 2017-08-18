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
  .description('该项目所使用的sbom版本号')
  .action(() => {

    handlers.version();
  });

program
  .command('ls')
  .description('sbom版本列表')
  .action(() => {

    handlers.list();
  });

program
  .command('update <version>')
  .description('更新sbom至指定版本')
  .action((version) => {

    handlers.update(version);
  });

program
  .command('publish')
  .description('发布sbom')
  .action(() => {

    handlers.publish();
  });

program
  .command('*')
  .action((env) => {

    console.log(chalk.red('sbom不存在命令：') + chalk.yellow('%s'), env);
  });

program.parse(process.argv);