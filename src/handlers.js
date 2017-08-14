let git = require('./git');

exports.init = (version) => {

  git.fetch(version, () => {

    console.log('fetch ');
  });
};