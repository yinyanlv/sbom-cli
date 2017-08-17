let path = require('path');
let childProcess = require('child_process');
let chalk = require('chalk');
let co = require('co');
let config = require('../config');
let utils = require('./utils');
let localRepositoryBasePath = path.join(config.basePath, 'repository');
let localRepositoryPath = path.join(config.basePath, 'repository', config.repositoryName);

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

        let tagStr = yield getTags();
        let tagList = tagStr.split('\n') || [];

        if (tagList.includes(version)) {

          yield checkout(version);
          resolve();
        } else {

          reject(`版本号：${version} 不存在`);
        }
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
        let tagStr = yield getTags(true);

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

    let worker = childProcess.spawn('git', ['clone', config.repositoryUri], {
      cwd: localRepositoryBasePath,
      stdio: ['pipe', 'pipe',  process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git clone`));
      resolve();
    });
  });
}

function fetch() {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['fetch'], {
      cwd: localRepositoryPath,
      stdio: ['pipe', 'pipe',  process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git fetch`));
      resolve();
    });
  });
}

function getTags(withMessage) {

  let cmd = withMessage ?  `git tag -n` : `git tag`;

  return new Promise((resolve, reject) => {

    childProcess.exec(cmd, {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(chalk.red(`ERROR: ${cmd}`));

        return reject(err);
      }

      if (stderr) {
        console.log(chalk.red(`ERROR: ${cmd}`));

        return reject(stderr);
      }

      console.log(chalk.green(`SUCCESS: ${cmd}`));

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

    let worker = childProcess.spawn('git', ['checkout', version], {
      cwd: localRepositoryPath,
      stdio: ['pipe', 'pipe',  process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git checkout ${version}`));
      resolve();
    });
  });
}

module.exports = new Git();