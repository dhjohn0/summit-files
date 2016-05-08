var Summit = require('summit');
var Promise = Summit.Promise;
var path = require('path');

module.exports = function (app) {
  var permissions = require('../permissions/open');

  return app.collection({
    name: 'File',

    fields: {
      name: 'string',
      folder: 'string',
      permissions: 'object'
    },

    views: {
      by_name: {
        map: function (doc) {
          if (doc.type && doc.type === 'File') {
            emit(doc.name, doc);
          }
        }
      },
      by_folder: {
        map: function (doc) {
          if (doc.type && doc.type === 'File' && doc.folder) {
            emit(doc.folder, doc);
          }
        }
      },
      by_full: {
        map: function (doc) {
          if (doc.type && doc.type === 'File') {
            emit([doc.folder || null, doc.name], doc);
          }
        }
      }
    },
    methods: {
      get: function (id, user) {
        return app.invoke(function (File) {
          var file;

          return File.view('all', { key: id }).then(function (files) {
            if (!files || !files.length)
              throw {
                message: 'File does not exist',
                status: 404
              };

            file = files[0];

            var p = permissions(file, user);
            if (!p.read)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            return file;
          });
        });
      },
      getContents: function (id, user) {
        return app.invoke(function (File, db, _) {
          var file;

          return File.view('all', { key: id }).then(function (files) {
            if (!files || !files.length)
              throw {
                message: 'File does not exist',
                status: 404
              };

            file = files[0];

            var p = permissions(file, user);
            if (!p.read)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            var attachmentIds = _.keys(file._attachments);
            if (!attachmentIds || !attachmentIds.length)
              throw {
                message: 'Corrupted File',
                status: 500
              }

            return db.getAttachment(file._id, attachmentIds[0]);
          }).then(function (contents) {
            return {
              _id: file.id,
              name: file.name,
              contents: contents,
              contentType: file._attachments[attachmentIds[0]]['content_type']
            }
          });
        });
      },
      add: function (folderId, file, user) {
        return app.invoke(function (config, Folder, File, db, _, uuid) {
          var id = uuid();
          var ext;
          var data;
          var addedFile;

          var filename = file.file;

          if (!file.data) {
            if (filename.lastIndexOf(path.sep) >= 0)
              filename = filename.substring(filename.lastIndexOf(path.sep) + 1);

            var filename = filename.split('.');
            if (filename.length < 3)
              filename = filename[0];
            else {
              ext = filename.pop();
              filename.pop();
              filename.push(ext);
              filename = filename.join('.');
            }
          }else{
            ext = file.ext;
          }

          if (ext) id = id + '.' + ext;

          var newFile = {
            _id: id,
            name: filename,
            folder: folderId,
            permissions: _.merge(config.files.permissions.file, {
              owner: { id: user ? user._id : null }
            }),
            type: 'File',
            collection: 'File'
          };

          var folder;

          return Folder.view('all', { key: newFile.folder } ).then(function (folders) {
            if (!folders || !folders.length)
              throw {
                message: 'Parent folder does not exist',
                status: 404
              };

            folder = folders[0];

            var p = permissions(folder, user);
            if (!p.create)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            return Promise.all([
              Folder.view('by_full', { key: [newFile.folder, newFile.name] }), 
              File.view('by_full', { key: [newFile.folder, newFile.name] })
            ]);
          }).spread(function (folders, files) {
            if (folders && folders.length)
              throw {
                message: 'Folder with the same name exists',
                status: 409
              };

            if (files && files.length)
              throw {
                message: 'File with the same name exists',
                status: 409
              };

            File.emit('add:before', { file: newFile });
            return File.put(newFile);
          }).then(function (result) {
            addedFile = result;

            return db.attach(id, file.file);
          }).then(function (_file) {
            File.emit('add:after', { file: _file });
            return addedFile;
          });
        });
      },
      edit: function (id, edit, user) {
        return app.invoke(function (File, Folder, _) {
          var file;

          return File.view('all', { key: id }).then(function (files) {
            if (!files || !files.length)
              throw {
                message: 'File does not exist',
                status: 404
              };

            file = files[0];

            var p = permissions(file, user);
            if (!p.write)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            if (edit.name) {
              file.name = edit.name;
            }

            if (edit.permissions) {
              if (edit.permissions.owner && !edit.permissions.owner.id) {
                edit.permissions.owner.id = file.permissions.owner.id;
              }
              file.permissions = edit.permissions;
            }

            return Promise.all([
              Folder.view('by_full', { key: [file.folder, file.name] }), 
              File.view('by_full', { key: [file.folder, file.name] })
            ]);
          }).spread(function (folders, files) {
            files = _.reject(files, { _id: file._id });
            if (folders && folders.length)
              throw {
                message: 'Folder with the same name exists',
                status: 409
              };

            if (files && files.length)
              throw {
                message: 'File with the same name exists',
                status: 409
              };

            File.emit('edit:before', { file: file });
            return File.put(file);
          }).then(function (_file) {
            File.emit('edit:after', { file: _file });
            return _file;
          });
        });
      },
      remove: function (id, user) {
        return app.invoke(function (File) {
          var file;

          return File.view('all', { key: id }).then(function (files) {
            if (!files || !files.length)
              throw {
                message: 'File does not exist',
                status: 404
              }

            file = files[0];

            var p = permissions(file, user);
            if (!p.write)
              throw {
                message: 'Unauthorized',
                status: 401
              };

            file._deleted = true;

            File.emit('remove:before', { file: file });
            return File.put(file);
          }).then(function (_file) {
            File.emit('edit:after', { file: _file });
            return _file;
          });
        });
      },
      setPermissionsHandler: function (method) {
        permissions = method;
      }
    }
  });
};