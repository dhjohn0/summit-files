var Summit = require('summit');
var Promise = Summit.Promise;

module.exports = function (app) {
  var router = app.router();

  router.get('/folders', function (req, Folder, user, respond, views) {
    return Folder.getRoots(user).then(function (folders) {
      if (req.params.output === 'json')
        return Summit.json(folders);
      else
        return respond(views.files.folder.get_folders, folders);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.get('/folder/:id', function (req, Folder, user, respond, views) {
    return Folder.get(
      req.params.id, 
      req.params.includeParent, 
      user
    ).then(function (folder) {
      if (req.params.output === 'json')
        return Summit.json(folder);
      else
        return respond(views.files.folder.get_folder_id, folder);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.post('/folder', function (req, Folder, user, config) {
    return Folder.add(req.body, user).then(function (folder) {
      if (req.params.output === 'json')
        return Summit.json(folder);
      else {
        req.flash('info', 'Folder created');
        return Summit.redirect(config.files.redirects.folder.add);
      }
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.del('/folder/:id', function (req, Folder, user) {
    return Folder.remove(
      req.params.id, 
      req.params.recursive, 
      user
    ).then(function (removedFolder) {
      if (req.params.output === 'json')
        return Summit.json(removedFolder);
      else {
        req.flash('info', 'Folder deleted');
        return Summit.redirect(config.files.redirects.folder.remove);
      }
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.put('/folder/:id', function (req, Folder, user) {
    return Folder.edit(req.params.id, req.body, user).then(function (updatedFolder) {
      if (req.params.output === 'json')
        return Summit.json(updatedFolder);
      else {
        req.flash('info', 'Folder updated');
        return Summit.redirect(config.files.redirects.folder.edit);
      }
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });
};