var defaultOpen = {
  read: true,
  write: true,
  create: true
};

module.exports = function (item, user) {
  if (!item.permissions) return defaultOpen;
  var permissions = item.permissions;

  if (user && user.roles && user.roles.admin)
    return defaultOpen;

  if (permissions.owner && user) {
    if (permissions.owner.id === user._id)
      return permissions.owner;
  }

  if (permissions.group && user && user.groups) {
    if (user.groups[permissions.group.name])
      return permissions.group;
  }

  if (permissions.everyone) return permissions.everyone;

  return defaultOpen;
}