let path = require('path');
let co = require('co');
let chalk = require('chalk');
let config = require('../config');
let git = require('./git');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, config.repositoryName);
let sbomTplPath = path.join(config.basePath, '/template/sbom.tpl');

class Handlers {

  init(version) {

    co(function*() {

      yield git.fetch();

      if (!version) version = yield git.getLatestTag();

      yield git.checkout(version);

      if (config.basePath.indexOf(process.cwd()) === -1) {  // 不能在sbom的npm包中执行该命令

        console.log(chalk.yellow('-- begin create files --'));

        utils.copyFolder(localRepositoryPath, process.cwd());

        let data = yield utils.readFile(sbomTplPath);
        let sbomFilePath = path.join(process.cwd(), '.sbom');

        utils.writeFile(sbomFilePath, data.replace('${version}', version));

        console.log(chalk.green('-- create files success --'));
      } else {

        utils.showErrorInfo('不能在sbom的npm包中执行该命令');
      }
    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }

  version() {

    co(function*() {
      let sbomFilePath = path.join(process.cwd(), '.sbom');

      if (utils.isExists(sbomFilePath)) {

        let str = yield utils.readFile(sbomFilePath);

        try {
          let conf = JSON.parse(str);

          console.log(chalk.yellow(`当前sbom项目的版本号：${conf.version}`));
        } catch (e) {

          utils.showErrorInfo('.sbom文件内容有误');
        }
      } else {

        utils.showErrorInfo('当前目录不是sbom项目的根目录');
      }
    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }

  list() {

    co(function*() {

      let versionList = yield git.getTagList(true);

      console.log(chalk.yellow('-- version list --'));
      console.log(versionList);
    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }

  update() {

  }
}

module.exports = new Handlers();
