let co = require('co');
let chalk = require('chalk');
let git = require('./git');
let utils = require('./utils');

class Handlers {

  init(version) {

    co(function*() {

      if (!version) version = yield git.getLatestTag(true);

      yield git.checkout(version);

      console.log('init success');
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
