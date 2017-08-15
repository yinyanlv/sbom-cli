let repositoryUri = 'https://github.com/yinyanlv/sub-module.git';

let config = {
  repositoryUri: repositoryUri,
  repositoryName: repositoryUri.replace(/^.*\/(.+)\.git$/g, ($, $1) => {
    return $1;
  }),
  basePath: __dirname
};

module.exports = config;