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

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield this.fetch();

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

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield this.fetch();
        let tagStr = yield getTags(true);

        resolve(tagStr);
      }).catch((err) => {

        reject(err);
      });
    });
  }

  getLatestTag(isNeedFetch) {

    return new Promise((resolve, reject) => {

      co(function*() {

        if (isNeedFetch) yield this.fetch();
        let tagStr = yield getTags();
        let tag = tagStr ? tagStr.split('\n')[0] : tagStr;

        resolve(tag);
      }).catch((err) => {

        reject(err);
      });
    });
  }

  createTag(version, message) {

    return new Promise((resolve, reject) => {

      co(function*() {

        yield pull();
        yield addAll();
        yield commit();
        yield push();
        yield tag(version, message);
        yield pushTag(version);

        resolve();
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
      stdio: ['pipe', 'pipe', process.stderr]
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
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git fetch`));
      resolve();
    });
  });
}

function pull() {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['pull', 'origin', 'master'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git pull origin master`));
      resolve();
    });
  });
}

function addAll() {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['add', '-A'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git add -A`));
      resolve();
    });
  });
}

function commit() {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['commit', '-m', "commit and add a tag"], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git commit`));
      resolve();
    });
  });
}

function push() {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['push', 'origin', 'master'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git push origin master`));
      resolve();
    });
  });
}

function tag(version, message) {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['tag', '-a', version, '-m', message], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git tag -a ${version} -m ${message}`));
      resolve();
    });
  });
}

function pushTag(version) {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', ['push', 'origin', version], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git push origin ${version}`));
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
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      console.log(chalk.green(`SUCCESS: git checkout ${version}`));
      resolve();
    });
  });
}

module.exports = new Git();