let path = require('path');
let childProcess = require('child_process');
let chalk = require('chalk');
let co = require('co');
let config = require('../config');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, config.repositoryName);

class Git {

  fetch() {

    return new Promise((resolve, reject) => {

      co(function*() {

        utils.isExists(localRepositoryPath) ? yield fetch() : yield clone();
        resolve();
      }).catch((err) => {

        reject(err);
      });
    });
  }

  checkout(version, isNeedFetch) {
    let self = this;

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield self.fetch();
        yield checkout(version);

        resolve();
      }).catch((err) => {

        reject(err);
      });
    });
  }

  getTagList(isNeedFetch) {
    let self = this;

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield self.fetch();
        let tagStr = yield getTags();

        resolve(tagStr);
      }).catch((err) => {

        reject(err);
      });
    });
  }

  getLatestTag(isNeedFetch) {
    let self = this;

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield self.fetch();
        let tagStr = yield getTags();
        let tag = tagStr ? tagStr.split('\n')[0] : tagStr;

        resolve(tag);
      }).catch((err) => {

        reject(err);
      });
    });
  }
}

function clone() {

  return new Promise((resolve, reject) => {

    childProcess.exec(`git clone ${config.repositoryUri}`, {
      cwd: config.basePath
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(chalk.red(`ERROR: git clone ${config.repositoryUri}`));

        return reject(err);
      }

      if (stderr) {
        console.log(chalk.green(`SUCCESS: git clone ${config.repositoryUri}`));

        return resolve(stderr);
      }

      console.log(chalk.green(`SUCCESS: git clone ${config.repositoryUri}`));

      return resolve(stdout);
    });
  });
}

function fetch() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git fetch', {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(chalk.red(`ERROR: git fetch`));

        return reject(err);
      }

      if (stderr) {
        console.log(chalk.red(`ERROR: git fetch`));

        return reject(stderr);
      }

      console.log(chalk.green(`SUCCESS: git fetch`));

      return resolve(stdout);
    });
  });
}

function getTags() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git tag', {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(chalk.red(`ERROR: git tag`));

        return reject(err);
      }

      if (stderr) {
        console.log(chalk.red(`ERROR: git tag`));

        return reject(stderr);
      }

      console.log(chalk.green(`SUCCESS: git tag`));

      return resolve(rebuildTagStdout(stdout));
    });
  });
}

function rebuildTagStdout(stdout) {

  if (stdout) {

    return stdout
      .split('\n')
      .filter((item) => {
        return !!item;
      })
      .reverse()
      .join('\n');
  } else {

    return stdout;
  }
}

function checkout(version) {

  if (!version) return Promise.reject();

  return new Promise((resolve, reject) => {

    childProcess.exec(`git checkout ${version}`, {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(chalk.red(`ERROR: git checkout ${version}`));

        return reject(`版本号：${version} 不存在`);
      }

      if (stderr) {
        console.log(chalk.green(`SUCCESS: git checkout ${version}`));

        return resolve(stderr);
      }

      console.log(chalk.green(`SUCCESS: git checkout ${version}`));

      return resolve(stdout);
    });
  });
}

module.exports = new Git();