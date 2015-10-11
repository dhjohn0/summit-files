var Summit = require('summit');
var Promise = Summit.Promise;
var permissions = require('../helpers/permissions');
var inSync = require('../helpers/inSync');

module.exports = function (app) {
	return app.collection({
    name: 'Folder',

    fields: {
    	name: 'string',
      parent: 'string',
      permissions: 'object'
    },

  	views: {
      by_name: {
        map: function (doc) {
          if (doc.type && doc.type === 'Folder') {
            emit(doc.name, doc);
          }
        }
      },
      by_parent: {
        map: function (doc) {
          if (doc.type && doc.type === 'Folder') {
            emit(doc.parent || null, doc);
          }
        }
      },
      by_full: {
      	map: function (doc) {
          if (doc.type && doc.type === 'Folder') {
            emit([doc.parent || null, doc.name], doc);
          }
        }
      },
      by_owner: {
        map: function (doc) {
          if (
            doc.type && doc.type === 'Folder' && 
            (!doc.parent) && 
            doc.permissions && doc.permissions.owner && doc.permissions.owner.id && doc.permissions.owner.read
          ) {
            emit(doc.permissions.owner.id, doc);
          }
        }
      },
      by_group: {
        map: function (doc) {
          if (
            doc.type && doc.type === 'Folder' && 
            (!doc.parent) && 
            doc.permissions && doc.permissions.group && doc.permissions.group.name && doc.permissions.group.read
          ) {
            emit(doc.permissions.group.name, doc);
          }
        }
      },
      by_everyone: {
        map: function (doc) {
          if (
            doc.type && doc.type === 'Folder' && 
            (!doc.parent) && 
            (!doc.permissions || (doc.permissions.everyone && doc.permissions.everyone.read))
          ) {
            emit(doc._id, doc);
          }
        }
      }
    },
    methods: {
      getRoots: function (user) {
        return app.invoke(function (Folder, config, _) {
          var folders = [];

          var folderGets = [];
          if (user) {
            folderGets.push( Folder.view('by_owner', { key: user._id }) );
            if (user.groups) {
              var groups = [];
              _.pairs(user.groups).forEach(function (c) {
                if (c[1]) groups.push(c[0]);
              });
              folderGets.push( Folder.view('by_group', { keys: groups }) );
            }
          }
          folderGets.push( Folder.view('by_everyone') );

          return Promise.all(folderGets).then(function (rootFolders) {
            var folders = _.uniq(_.flatten(rootFolders), '_id');

            folders.map(function (folder) {
              folder.permissions = permissions(folder.permissions, user);
              return folder;
            });

            var p = permissions(config.files.root.permissions, user);

            return {
              permissions: {
                you: p
              },
              children: {
                folders: folders,
                files: []
              }
            };
          });
        });
      },
      get: function (id, includeParent, user) {
        return app.invoke(function (Folder, File, config, _) {
          var folder;
          var children = {
            folders: [],
            files: []
          };

          return Folder.view('all', { key: id }).then(function (folders) {
            if (!folders || !folders.length)
              throw {
                message: 'Folder does not exist',
                status: 404
              };

            folder = folders[0];

            var p = permissions(folder.permissions, user);
            if (!p.read)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            if (folder.permissions)
              folder.permissions.you = p;

            return Promise.all([
              Folder.view('by_parent', { key: id }),
              File.view('by_folder', { key: id })
            ]);
          }).spread(function (folders, files) {
            children.folders = folders;
            children.files = files;

            children.folders.map(function (child) {
              child.permissions = permissions(child.permissions, user);
              return child;
            });
            children.files.map(function (child) {
              child.permissions = permissions(child.permissions, user);
              return child;
            });

            if (includeParent)
              children.folders.unshift({
                _id: folder.parent || null,
                name: '..'
              });

            return _.extend(folder, { children: children });
          });
        });
      },
      add: function (folder, user) {
        return app.invoke(function (config, Folder, _, uuid) {
          var parent;

          var newFolder = {
            _id: uuid(),
            name: folder.name,
            parent: folder.parent || null,
            permissions: _.merge(config.files.permissions.folder, {
              owner: { id: user ? user._id : null }
            }),
            type: 'Folder',
            collection: 'Folder'
          };

          var folderGet = Promise.resolve([config.files.root]);
          if (newFolder.parent)
            folderGet = Folder.view('all', { key: newFolder.parent } );

          return folderGet.then(function (parents) {
            if (!parents || !parents.length)
              throw {
                message: 'Parent does not exist',
                status: 404
              };

            parent = parents[0];

            var p = permissions(parent.permissions, user);
            if (!p.create)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            return Folder.view('by_full', { key: [newFolder.parent, newFolder.name] })
          }).then(function (folders) {
            if (folders && folders.length)
              throw {
                message: 'Folder exists',
                status: 409
              };

            return Folder.put(newFolder);
          });
        });
      },
      edit: function (id, edit, user) {
        return app.invoke(function (Folder, _) {
          var folder;

          return Folder.view('all', { key: id }).then(function (folders) {
            if (!folders || !folders.length)
              throw {
                message: 'Folder does not exist',
                status: 404
              };

            folder = folders[0];

            var p = permissions(folder.permissions, user);
            if (!p.write)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            if (edit.name) {
              folder.name = edit.name;
            }

            if (edit.permissions) {
              if (edit.permissions.owner && !edit.permissions.id) {
                edit.permissions.owner.id = folder.permissions.owner.id;
              }
              folder.permissions = edit.permissions;
            }

            return Folder.view('by_full', { key: [folder.parent, folder.name] });
          }).then(function (folders) {
            folders = _.reject(folders, { _id: folder._id });
            if (folders && folders.length)
              throw {
                message: 'Folder exists',
                status: 409
              };
            
            return Folder.put(folder);
          });
        });
      },
      remove: function (idOrFolder, recursive, user) {
        return app.invoke(function (Folder, File) {
          var folder;
          var childFolders;
          var childFiles;

          var folderGet;
          if (typeof idOrFolder === 'string')
            folderGet = Folder.view('all', { key: idOrFolder });
          else
            folderGet = Promise.resolve([ idOrFolder ]);

          return folderGet.then(function (folders) {
            if (!folders || !folders.length)
              throw {
                message: 'Folder does not exist',
                status: 404
              };

            folder = folders[0];

            var p = permissions(folder.permissions, user);
            if (!p.write)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            return Folder.view('by_parent', { key: folder._id });
          }).then(function (children) {
            childFolders = children;

            return File.view('by_folder', { key: folder._id});
          }).then(function (children) {
            childFiles = children;

            if (!recursive && (childFolders.length || childFiles.length))
              throw {
                message: 'Folder not empty',
                status: 428
              };

            return inSync(childFolders, function (child) {
              return Folder.remove(child, recursive, user);
            });

          }).then(function () {
            return inSync(childFiles, function (child) {
              var p = permissions(child.permissions, user);
              if (!p.write)
                throw {
                  message: 'Unauthorized',
                  status: 401
                };

              child._deleted = true;
              return File.put(child);
            });

          }).then(function () {
            folder._deleted = true;
            return Folder.put(folder);
          });
        });
      }
    }
  });
};