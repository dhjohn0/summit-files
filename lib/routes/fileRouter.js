var Summit = require('summit');
var Promise = Summit.Promise;
var bogart = require('bogart-edge');
var stringStream = require('../helpers/stringStream');

module.exports = function (app) {
  var router = app.router();

  router.get('/file/view/:id', function (req, File, user) {
    return File.getContents(req.params.id, user).then(function (file) {
      var s = new stringStream(file.contents);
      return bogart.pipe(s);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.get('/file/download/:id', function (req, File, user) {
    return File.getContents(req.params.id, user).then(function (file) {
      var opts = {
        headers: {
          'Content-Disposition': 'attachment;filename=' + encodeURIComponent( file.name ),
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      };

      var s = new stringStream(file.contents);
      return bogart.pipe(s, opts);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.get('/file/:id', function (req, File, user) {
    return File.get(req.params.id, user).then(function (file) {
      return Summit.json(file);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.post('/file/:folder', function (req, File, user) {
    return File.add(req.params.folder, req.body, user).then(function (file) {
      if (req.params.json)
        return Summit.json(file);
      else
        return Summit.redirect(req.params.redirect || config.files.redirects.file.add);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.put('/file/:id', function (req, File, user) {
    return File.edit(req.params.id, req.body, user).then(function (updatedFile) {
      return Summit.json(updatedFile);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });

  router.del('/file/:id', function (req, File, user) {
    return File.remove(req.params.id, user).then(function (removedFile) {
      return Summit.json(removedFile);
    }).catch(function (e) {
      return Summit.json({
        message: e.message || e
      }, {
        status: e.status || 500
      });
    });
  });
};