let path = require('path');
let co = require('co');
let config = require('../config');
let git = require('./git');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, 'repository', config.repositoryName);

class Handlers {

  init(version) {

    co(function*() {

      yield git.fetch();

      if (!version) version = yield git.getLatestTag();

      if (!version) {
        return utils.showErrorInfo('sbom尚未发布任何版本');
      }

      yield git.checkout(version);

      utils.showYellowInfo(`-- begin create sbom ${version} files --`);

      utils.copyFolder(localRepositoryPath, process.cwd(), (err) => {

        if (err) return utils.showErrorInfo(err);

        utils.deleteFolder(path.join(process.cwd(), '.git'), (err) => {  // 删除.git

          if (err) return utils.showErrorInfo(err);

          let sbomConfigPath = path.join(process.cwd(), 'sbom.json');
          let sbomFilePath = path.join(process.cwd(), '.sbom');

          utils.copyFile(sbomConfigPath, sbomFilePath, (err) => {

            if (err) return utils.showErrorInfo(err);

            utils.deleteFile(sbomConfigPath);

            utils.showGreenInfo(`-- sbom ${version} init success --`);
          });
        });
      });
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

          utils.showYellowInfo(`当前sbom项目的版本号：${conf.version}`);
        } catch (err) {

          utils.showErrorInfo(err);
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

      utils.showYellowInfo('-- version list --');
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
          if (!conf.updatePaths || !Array.isArray(conf.updatePaths)) return utils.showErrorInfo('.sbom文件的updatePaths字段不合法');

          yield git.fetch();
          yield git.checkout(version);

          conf.updatePaths.push('.sbom');

          utils.showYellowInfo(`-- begin delete sbom ${conf.version} files --`);
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
              if (!conf.updatePaths || !Array.isArray(conf.updatePaths)) return utils.showErrorInfo('sbom.json文件的updatePaths字段不合法');

              conf.updatePaths.push('.sbom');

              utils.showYellowInfo(`-- begin create sbom ${conf.version} files --`);
              conf.updatePaths.forEach((item) => {

                let srcPath = path.join(localRepositoryPath, item === '.sbom' ? 'sbom.json' : item);
                let destPath = path.join(process.cwd(), item);

                utils.copyFolder(srcPath, destPath);
              });

              utils.showGreenInfo(`-- sbom update to ${version} success --`);
            } catch (err) {

              utils.showErrorInfo(err);
            }
          } else {

            utils.showErrorInfo('源仓库中未发现sbom.json文件');
          }
        } catch (err) {

          utils.showErrorInfo(err);
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
        } catch (err) {

          utils.showErrorInfo(err);
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
