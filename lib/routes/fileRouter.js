var Summit = require('summit');
var Promise = Summit.Promise;
var bogart = Summit.bogart;
var stringStream = require('../helpers/stringStream');

module.exports = function (app) {
  var router = app.router();

  router.get('/file/view/:id', function (req, File, user) {
    return File.getContents(req.params.id, user).then(function (file) {
      return {
        status: 200,
        headers: {
          'content-type': file.contentType,
          'content-length': file.contents.length
        },
        body: [file.contents]
      };
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else
        return Summit.html(e.message || e, {
          status: e.status || 500
        });
    });
  });

  router.get('/file/download/:id', function (req, File, user) {
    return File.getContents(req.params.id, user).then(function (file) {
      return {
        status: 200,
        headers: {
          'content-type': file.contentType,
          'content-length': file.contents.length,
          'Content-Disposition': 'attachment;filename=' + encodeURIComponent( file.name ),
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        },
        body: [file.contents]
      };
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else
        return Summit.html(e.message || e, {
          status: e.status || 500
        });
    });
  });

  router.get('/file/:id', function (req, File, user) {
    return File.get(req.params.id, user).then(function (file) {
      if (req.params.output === 'json')
        return Summit.json(file);
      else
        return respond(views.files.file.get_file_id, {
          file: file
        });
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else
        return Summit.html(e.message || e, {
          status: e.status || 500
        });
    });
  });

  router.post('/file/:folder', function (req, File, user) {
    return File.add(req.params.folder, req.body, user).then(function (file) {
      if (req.params.output === 'json')
        return Summit.json(file);
      else {
        req.flash('info', 'File uploaded');
        return Summit.redirect(req.params.redirect || config.files.redirects.file.add);
      }
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else {
        req.flash('error', e.message || e);
        return Summit.redirect(req.params.redirect || config.files.redirects.file.add);
      }
    });
  });

  router.put('/file/:id', function (req, File, user) {
    return File.edit(req.params.id, req.body, user).then(function (updatedFile) {
      if (req.params.output === 'json')
        return Summit.json(updatedFile);
      else {
        req.flash('info', 'File updated');
        return Summit.redirect(req.params.redirect || config.files.redirects.file.edit);
      }
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else {
        req.flash('error', e.message || e);
        return Summit.redirect(req.params.redirect || config.files.redirects.file.edit);
      }
    });
  });

  router.del('/file/:id', function (req, File, user) {
    return File.remove(req.params.id, user).then(function (removedFile) {
      if (req.params.output === 'json')
        return Summit.json(removedFile);
      else {
        req.flash('info', 'File deleted');
        return Summit.redirect(req.params.redirect || config.files.redirects.file.remove);
      }
    }).catch(function (e) {
      if (req.params.output === 'json')
        return Summit.json({
          message: e.message || e
        }, {
          status: e.status || 500
        });
      else {
        req.flash('error', e.message || e);
        return Summit.redirect(req.params.redirect || config.files.redirects.file.remove);
      }
    });
  });
};