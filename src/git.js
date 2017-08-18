let path = require('path');
let childProcess = require('child_process');
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

function spawn(cmdArgs, cwd) {

  return new Promise((resolve, reject) => {

    let worker = childProcess.spawn('git', cmdArgs, {
      cwd: cwd,
      stdio: ['pipe', 'pipe', process.stderr]
    });

    worker.stdout.on('end', () => {

      utils.showGreenInfo(`SUCCESS: git ${cmdArgs.join(' ')}`);
      resolve();
    });
  });
}

function exec(cmd, cwd, callback) {

  return new Promise((resolve, reject) => {

    childProcess.exec(cmd, {
      cwd: cwd
    }, (err, stdout, stderr) => {

      if (err) {
        utils.showRedInfo(`ERROR: ${cmd}`);

        return reject(err);
      }

      if (stderr) {
        utils.showRedInfo(`ERROR: ${cmd}`);

        return reject(stderr);
      }

      utils.showGreenInfo(`SUCCESS: ${cmd}`);

      return callback ? resolve(callback(stdout)) : resolve(stdout);
    });
  });
}

function clone() {

  return spawn(['clone', config.repositoryUri], localRepositoryBasePath);
}

function fetch() {

  return spawn(['fetch'], localRepositoryPath);
}

function checkout(version) {

  if (!version) return Promise.reject();

  return spawn(['checkout', version], localRepositoryPath);
}

function pull() {

  return spawn(['pull', 'origin', 'master'], process.cwd());
}

function addAll() {

  return spawn(['add', '-A'], process.cwd());
}

function commit() {

  return spawn(['commit', '-m', "commit and add a tag"], process.cwd());
}

function push() {

  return spawn(['push', 'origin', 'master'], process.cwd());
}

function tag(version, message) {

  return spawn(['tag', '-a', version, '-m', message], process.cwd());
}

function pushTag(version) {

  return spawn(['push', 'origin', version], process.cwd());
}

function getTags(withMessage) {

  let cmd = withMessage ?  `git tag -n` : `git tag`;

  return exec(cmd, localRepositoryPath, rebuildTagStdout);
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

module.exports = new Git();