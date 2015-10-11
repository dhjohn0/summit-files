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

app.invoke(require('../../app'));

router.get('/', function (respond, views, user) {
  return Summit.redirect('/folders');
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
  var users;

  return Folder.get(req.params.id, false, user).then(function (_folder) {
    folder = _folder;

    return respond(views.files.folder.get_folder_remove_id, {
      folder: folder
    });
  });
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

router.post('/login', function (req, User) {
  var username = req.params.username;
  var password = req.params.password;
  var redirect = req.params.redirect;

  return User.authenticate({username: username, password: password}, 'password').then(function (user) {
    if (user) {
      req.session('user', user);
      return Summit.json({
      	success: true,
      	message: 'Logged in'
      });
    }
    return Summit.json({
    	success: false,
    	message: 'Failed'
    });
  });
});

router.get('/logout', function (req) {
  req.session('user', null);
  return Summit.json({
    success: true,
    message: 'Logged out'
  });
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