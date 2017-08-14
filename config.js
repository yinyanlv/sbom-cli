let GIT_URI = 'https://github.com/yinyanlv/sub-module.git';

let config = {
  repositoryUri: GIT_URI,
  repositoryName: GIT_URI.replace(/^.*\/(.+)\.git$/g, ($, $1) => {
    return $1;
  }),
  basePath: __dirname
};

module.exports = config;