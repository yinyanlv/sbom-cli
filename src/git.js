let childProcess = require('child_process');
let config = require('../config');

let git = {
  fetch: (version, callback) => {

    let cmdStr = version ? `git clone --branch ${version} ${config.repositoryUrl}` : `git clone ${config.repositoryUrl}`;
    let cmdArgs = version ? ['clone', '--brand', version, config.repositoryUrl] : ['clone', config.repositoryUrl];

    // childProcess.exec(cmdStr, (err, stdout, stderr) => {
    //
    // });

    let process = childProcess.spawn('git', cmdArgs);

    process.stdout.setEncoding('utf8');
    process.stdout.on('data', (chunck) => {

      console.log('out: '+ chunck);
    });

  }
};

module.exports = git;