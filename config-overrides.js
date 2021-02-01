const path = require('path');
const paths = require('react-scripts-ts-antd/config/paths');

paths.appBuild = path.join(__dirname, 'common2');

module.exports = function override(config, env) {
  return config;
};
