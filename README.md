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

##Example Server
There is an example server included at `./examples/json/`, which can be launched with the `server.js` in the same folder