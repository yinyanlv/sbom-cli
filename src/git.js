let path = require('path');
let childProcess = require('child_process');
let co = require('co');
let config = require('../config');
let utils = require('./utils');
let localRepositoryPath = path.join(config.basePath, config.repositoryName);

class Git {

  fetch(version, callback) {

    let cmdArgs;

    if (utils.isExists(localRepositoryPath)) {  // git仓库已存在

      co(function* () {

        yield cd(localRepositoryPath);
        yield pull();
        yield getTags();

      }).catch((err) => {

        console.log(err);
      });

    } else {

      co(function* () {

        yield cd(config.basePath);
        yield clone(config.repositoryUri);
        yield getTags();

      }).catch((err) => {

        console.log(err);
      });
    }
  }
}

function cd(path) {

  if (!path) Promise.reject();

  return new Promise((resolve, reject) => {

    childProcess.exec(`cd ${path}`, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(`cd ${path}`);

      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });

}

function clone(uri) {

  if (!uri) Promise.reject();

  return new Promise((resolve, reject) => {

    childProcess.exec(`git clone ${config.repositoryUri}`, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(`git clone ${config.repositoryUri}`);
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

function pull() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git pull', (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log('git pull');
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

function getTags() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git tag', (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log('git tag');
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

module.exports = new Git();