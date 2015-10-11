module.exports = function (app, File, Folder, config, _) {
  var router = app.router(false);

  var defaultConfig = require('./ownerGroupEveryoneConfig');
  var permissionsHandler = require('./ownerGroupEveryoneHandler.js');

  app.inject('config', _.merge(defaultConfig, config));

  File.setPermissionsHandler(permissionsHandler);
  Folder.setPermissionsHandler(permissionsHandler);

  return router;
}