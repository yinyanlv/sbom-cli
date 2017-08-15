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

      co(function* () {

        utils.isExists(localRepositoryPath) ? yield fetch() : yield clone();
        resolve();
      }).catch((err) => {

        console.log(err);
        reject(err);
      });
    });
  }

  checkout(version, callback) {
    let self = this;

    co(function* () {

      yield self.fetch();
      yield checkout(version);

      callback && callback();
    }).catch((err) => {

      console.log(err);
    });
  }
}

function clone() {

  return new Promise((resolve, reject) => {

    childProcess.exec(`git clone ${config.repositoryUri}`, {
      cwd: config.basePath
    }, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(chalk.green(`git clone ${config.repositoryUri}`));
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

function fetch() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git fetch', {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(chalk.green('git fetch'));
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

function getTags() {

  return new Promise((resolve, reject) => {

    childProcess.exec('git tag', {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(chalk.green('git tag'));
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

function checkout(version) {

  if (!version) return Promise.reject();

  return new Promise((resolve, reject) => {

    childProcess.exec(`git checkout ${version}`, {
      cwd: localRepositoryPath
    }, (err, stdout, stderr) => {

      if (err) return reject(err);

      console.log(chalk.green(`git checkout ${version}`));
      if (stdout) return resolve(stdout);
      if (stderr) return resolve(stderr);

      resolve();
    });
  });
}

module.exports = new Git();