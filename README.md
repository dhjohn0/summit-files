#Summit Files
A file manager for [Summit](https://github.com/notduncansmith/summit)

##Installation

```
npm install --save summit-files
```

##Configuration
A default configuration setup is located in `./lib/defaultConfig.js`
You can override any of these settings when starting Summit by passing them in in Summit's config. ex:
```
var app = Summit({ files: {
  files: { permissions: { 
    everyone: { read: true, write: true, create: true }
  } }
} });
```

##Usage
Summit-files adds two new collections to Summit.
* Folder
* File

It also adds routes to create, edit, and retrieve folders and files

###Folder routes
```
GET /folders ()
GET /folder/:id ([includeParent])
POST /folder (name)
PUT /folder/:id ([name], [permissions])
DEL /folder/:id ([recursive])
```

###File routes
```
GET /file/:id ()
GET /file/view/:id ()
GET /file/download/:id ()
POST /file/:folder (file)
PUT /file/:id ([name], [permissions])
DEL /file/:id ()
```

Each route takes a parameter `output` to tell it whether to return a json object, or a html page using handlebars templating. If `output=json` the route will treturn the json object, otherwise the html page is returned.

##Permissions
Folder and File permissions are module based. By default, there are no restrictions on the file system.
A prebuilt system based on owner/group/everyone categories is included also, and can be enabled by calling `app.invoke(require('SummitFiles').OwnerGroupEveryone)` after invoking SummitFiles itself. You can override the default configuration of the permissions settings the same as you can SummitFiles itself. The defualt configuration file is located at `./lib/permissions/ownerGroupEveryoneConfig.js`.

###Folder Permissions
`read` the user can read the contents of the folder
`write` the user can update the folder name and permissions object
`create` the user can add subfolders and files to the folder

###File Permissions
`read` the user can read the file contents
`write` the user can update the file name and permissions object of the file

##Example Server
There are two example file system servers included:
`./examples/json` is an ajax based server
`./examples/html` is a html page based server
To run the example servers, run the `./server.js` file in the folders.