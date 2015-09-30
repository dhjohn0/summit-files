var Summit = require('summit');
var Promise = Summit.Promise;

module.exports = function (app) {
  var router = app.router();

  router.get('/folders', function (req, Folder, user) {
    return Folder.getRoots(user).then(function (folders) {
      return Summit.json(folders);
    }).catch(function (e) {
      return Summit.json({
        message: e.message
      }, {
        status: e.status
      });
    });
  });

  router.get('/folder/:id', function (req, Folder, user) {
    return Folder.get(
      req.params.id, 
      req.params.includeParent, 
      user
    ).then(function (folder) {
      return Summit.json(folder);
    }).catch(function (e) {
      return Summit.json({
        message: e.message
      }, {
        status: e.status
      });
    });
  });

  router.post('/folder', function (req, Folder, user) {
    return Folder.add(req.body, user).then(function (folder) {
      return Summit.json(folder);
    }).catch(function (e) {
      return Summit.json({
        message: e.message
      }, {
        status: e.status
      });
    });
  });

  router.del('/folder/:id', function (req, Folder, user) {
    return Folder.remove(
      req.params.id, 
      req.params.recursive, 
      user
    ).then(function (removedFolder) {
      return Summit.json(removedFolder);
    }).catch(function (e) {
      return Summit.json({
        message: e.message
      }, {
        status: e.status
      });
    });
  });

  router.put('/folder/:id', function (req, Folder, user) {
    return Folder.edit(req.params.id, req.body, user).then(function (updatedFolder) {
      return Summit.json(updatedFolder);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status
      });
    });
  });
};