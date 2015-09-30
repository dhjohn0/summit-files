module.exports = function (app, config, _) {
  var router = app.router(false);


  var defaultConfig = {
    files: {
      path: '/tmp',
      root: {
        permissions: {
          group: {
            name: 'root.creator',
            read: true,
            write: false,
            create: true
          },
          everyone: {
            read: false,
            write: false,
            create: false
          }
        }
      },
      permissions: {
        folder: {
          owner: {
            id: '0',
            read: true,
            write: true,
            create: true
          },
          group: {
            name: null,
            read: true,
            write: false,
            create: false
          },
          everyone: {
            read: true,
            write: false,
            create: false
          }
        },
        file: {
          owner: {
            id: '0',
            read: true,
            write: true,
            create: true
          },
          group: {
            id: '0',
            read: true,
            write: false,
            create: false
          },
          everyone: {
            read: true,
            write: false,
            create: false
          }
        }
      },
      redirects: {
        folder: {
          add: '/',
          edit: '/',
          remove: '/'
        },
        file: {
          add: '/',
          edit: '/',
          remove: '/'
        }
      }
    }
  }

  app.inject('config', _.merge(defaultConfig, config));

  app.invoke(require('./collections/file'));
  app.invoke(require('./collections/folder'));

  app.invoke(require('./routes/fileRouter'));
  app.invoke(require('./routes/folderRouter'));

  return router;
}