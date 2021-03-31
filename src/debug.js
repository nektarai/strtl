module.exports = () => () => {};
if (!global.PRODUCTION) module.exports = require('debug');
