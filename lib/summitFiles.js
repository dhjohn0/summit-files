module.exports = function (app, config, _) {
  var router = app.router(false);


  var defaultConfig = require('defaultConfig');

  app.inject('config', _.merge(defaultConfig, config));

  app.invoke(require('./collections/file'));
  app.invoke(require('./collections/folder'));

  app.invoke(require('./routes/fileRouter'));
  app.invoke(require('./routes/folderRouter'));

  return router;
}