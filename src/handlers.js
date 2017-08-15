let git = require('./git');

exports.init = (version) => {

  git.checkout(version, () => {

    console.log('init success');
  });
};