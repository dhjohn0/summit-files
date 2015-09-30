module.exports = {
  files: {
    root: {
      permissions: {	//Permissions for viewing/editing/creating root folders
        group: {				//Users in 'root.creator' group can view and create folders
          name: 'root.creator',
          read: true,
          write: false,
          create: true
        },
        everyone: {			//Block other users from creating folders
          read: false,
          write: false,
          create: false
        }
      }
    },
    permissions: {
      folder: {			//Permissions on newly created folders
        owner: {
          id: '0',
          read: true,
          write: true,
          create: true
        },
        group: {
          name: null,
          read: true,
          write: false,
          create: false
        },
        everyone: {
          read: true,
          write: false,
          create: false
        }
      },
      file: {			//Permissions on newly created files
        owner: {
          id: '0',
          read: true,
          write: true,
          create: true
        },
        group: {
          id: '0',
          read: true,
          write: false,
          create: false
        },
        everyone: {
          read: true,
          write: false,
          create: false
        }
      }
    },
    redirects: {		//Redirects for actions on html returns
      folder: {
        add: '/',
        edit: '/',
        remove: '/'
      },
      file: {
        add: '/',
        edit: '/',
        remove: '/'
      }
    }
  }
};
