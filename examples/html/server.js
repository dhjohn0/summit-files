var Summit = require('summit');

var app = new Summit({
  db: {
    driver: 'nano',
    host: process.env.DBHOST || 'localhost',
    port: process.env.DBPORT || 5984,
    name: process.env.DBNAME || 'summit',
    https: process.env.DBHTTPS || "false",
    auth: process.env.DBAUTH || ''
  }
});

app.collection({
  name: 'User',
  isUserType: true,
  fields: {
    service: 'hidden',
    email: 'email',
    username: 'string',
    firstName: 'string',
    lastName: 'string',
    password: 'password',
    phone: 'phone',
    facebookId: 'hidden',
    twitterId: 'hidden',
    facebookToken: 'hidden'
  },
  design: {
    views: {}
  },
  staticDocs: [
    {
      "_id": "3e0a6a05-28a7-4dd3-a81a-45e9f9dbf3ef",
      "email": "email@gmail.com",
      "username": "user",
      "firstName": "User",
      "lastName": "User",
      "type": "User",
      "collection": "User",
      "service": "password",
      "hashedPassword": "$2a$12$I3NG7ZlgqVGnyUjlUDEbxuyxm6YZsTz3DsLGSnUhOroRLp3w8J4jS",
      "isUser": true,
      "roles" : {},
      "groups" : {
        "root.creator": true
      }
    }
  ]
});

var router = app.router();
var sf = require('../../app');

app.invoke(sf.SummitFiles);
app.invoke(sf.OwnerGroupEveryonePermissions);

router.get('/', function (respond, views, user) {
  return Summit.redirect('/folders');
});

router.get('/folder/add', function (req, respond, views) {
  return respond(views.files.folder.get_folder_add_parent, { parent: null });
});

router.get('/folder/add/:parent', function (req, respond, views) {
  return respond(views.files.folder.get_folder_add_parent, { parent: req.params.parent });
});

router.get('/folder/edit/:id', function (req, respond, views, Folder, User, user) {
  var folder;
  var users;

  return Folder.get(req.params.id, false, user).then(function (_folder) {
    folder = _folder;

    return User.view('all'); 
  }).then(function (_users) {
    users = _users.map(function (user) {
      return {
        _id: user._id,
        username: user.username
      };
    });

    return respond(views.files.folder.get_folder_edit_id, {
      folder: folder,
      users: users
    });
  });
});

router.get('/folder/remove/:id', function (req, respond, views, Folder, user) {
  var folder;

  return Folder.get(req.params.id, false, user).then(function (_folder) {
    folder = _folder;

    return respond(views.files.folder.get_folder_remove_id, {
      folder: folder
    });
  });
});

router.get('/file/add/:folder', function (req, respond, views) {
  return respond(views.files.file.get_file_add_folder, { folder: req.params.folder });
});

router.get('/file/edit/:id', function (req, respond, views, File, User, user) {
  var file;
  var users;

  return File.get(req.params.id, user).then(function (_file) {
    file = _file;

    return User.view('all'); 
  }).then(function (_users) {
    users = _users.map(function (user) {
      return {
        _id: user._id,
        username: user.username
      };
    });

    return respond(views.files.file.get_file_edit_id, {
      file: file,
      users: users
    });
  });
});

router.get('/file/remove/:id', function (req, respond, views, File, user) {
  var file;

  return File.get(req.params.id, false, user).then(function (_file) {
    file = _file;

    return respond(views.files.file.get_file_remove_id, {
      file: file
    });
  });
});

router.get('/login', function (req, respond, views) {
  return respond(views.files.login, {
    flash: {
      info: req.flash('info'),
      warn: req.flash('warn'),
      error: req.flash('error')
    }
  });
});

router.post('/login', function (req, User) {
  var username = req.params.username;
  var password = req.params.password;
  var redirect = req.params.redirect;

  return User.authenticate({username: username, password: password}, 'password').then(function (user) {
    if (user) {
      req.session('user', user);
      req.flash('info', 'Logged in');

      return Summit.redirect('/folders');
    }else{
      req.flash('error', 'Incorrect username and/or password');
      return Summit.redirect('/login');
    }
  });
});

router.get('/logout', function (req) {
  req.session('user', null);
  req.flash('info', 'Logged out');
  return Summit.redirect('/folders');
});

router.get('/users', function (req, User) {
  return User.view('all').then(function (users) {
    users = users.map(function (user) {
      return {
        _id: user._id,
        username: user.username
      };
    });

    return Summit.json({
      users: users
    });
  });
});

app.start();