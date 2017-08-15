let path = require('path');
let co = require('co');
let chalk = require('chalk');
let config = require('../config');
let git = require('./git');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, config.repositoryName);

class Handlers {

  init(version) {

    co(function*() {

      yield git.fetch();

      if (!version) version = yield git.getLatestTag();

      yield git.checkout(version);

      if (localRepositoryPath !== process.cwd()) {

        utils.copyFolder(localRepositoryPath, process.cwd());
      }
    }).catch((err) => {

      utils.showErrorInfo(err);
    });
  }

  version() {

    console.log('show current version');
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

  remove() {

  }
}

module.exports = new Handlers();
