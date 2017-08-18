let path = require('path');
let co = require('co');
let chalk = require('chalk');
let config = require('../config');
let git = require('./git');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, 'repository', config.repositoryName);
let sbomTplPath = path.join(config.basePath, '/template/sbom.tpl');

class Handlers {

  init(version) {

    co(function*() {

      yield git.fetch();

      if (!version) version = yield git.getLatestTag();

      if (!version) {
        return utils.showErrorInfo('sbom尚未发布任何版本');
      }

      yield git.checkout(version);

      console.log(chalk.yellow('-- begin create files --'));

      utils.copyFolder(localRepositoryPath, process.cwd());

      let sbomFilePath = path.join(process.cwd(), '.sbom');

      if (!utils.isExists(sbomFilePath)) {

        let data = yield utils.readFile(sbomTplPath);
        let sbomFilePath = path.join(process.cwd(), '.sbom');

        yield utils.writeFile(sbomFilePath, data.replace(/\$\{version\}/g, version));
      }

      console.log(chalk.green('-- sbom init success --'));

      process.exit(0);
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

  update(version) {

    co(function*() {

      let sbomFilePath = path.join(process.cwd(), '.sbom');

      if (utils.isExists(sbomFilePath)) {

        let str = yield utils.readFile(sbomFilePath);

        try {
          let conf = JSON.parse(str);

          if (!conf.version) return utils.showErrorInfo('.sbom文件的version字段不合法');
          if (!conf.message) return utils.showErrorInfo('.sbom文件的message字段不合法');
          if (!conf.updatePaths || !Array.isArray(conf.updataPaths)) return utils.showErrorInfo('.sbom文件的updatePaths字段不合法');

          yield git.fetch();
          yield git.checkout(version);

          console.log(chalk.yellow('-- begin delete files --'));
          conf.updatePaths.forEach((item) => {

            let itemPath = path.join(process.cwd(), item);
            utils.deleteFolder(itemPath);
          });

          let sbomConfigPath = path.join(localRepositoryPath, 'sbom.json');

          if (utils.isExists(sbomConfigPath)) {

            let str = yield utils.readFile(sbomConfigPath);

            try {
              let conf = JSON.parse(str);

              if (!conf.version) return utils.showErrorInfo('sbom.json文件的version字段不合法');
              if (!conf.message) return utils.showErrorInfo('sbom.json文件的message字段不合法');
              if (!conf.updatePaths || !Array.isArray(conf.updataPaths)) return utils.showErrorInfo('sbom.json文件的updatePaths字段不合法');

              conf.updatePaths.push('.sbom');

              console.log(chalk.yellow('-- begin create files --'));
              conf.updatePaths.forEach((item) => {
                let srcPath = path.join(localRepositoryPath, item);
                let destPath = path.join(process.cwd(), item);

                utils.copyFolder(srcPath, destPath);
              });

              console.log(chalk.green(`-- sbom update to ${version} success --`));
            } catch (e) {

              utils.showErrorInfo('sbom.json文件内容有误');
            }
          } else {

            utils.showErrorInfo('源仓库中未发现sbom.json文件');
          }

        } catch (e) {

          utils.showErrorInfo('.sbom文件内容有误');
        }

      } else {

        return utils.showErrorInfo('当前目录不是sbom项目的根目录');
      }

    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }

  publish() {

    co(function*() {
      let sbomConfigPath = path.join(process.cwd(), 'sbom.json');

      if (utils.isExists(sbomConfigPath)) {

        let str = yield utils.readFile(sbomConfigPath);

        try {
          let conf = JSON.parse(str);

          if (!conf.version) return utils.showErrorInfo('sbom.json文件的version字段不能为空');
          if (!conf.message) return utils.showErrorInfo('sbom.json文件的message字段不能为空');

          yield git.createTag(conf.version, conf.message);
        } catch (e) {

          utils.showErrorInfo('sbom.json文件内容有误');
        }
      } else {

        utils.showErrorInfo('当前目录不是sbom项目的根目录');
      }
    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }
}

module.exports = new Handlers();
