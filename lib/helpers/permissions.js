var defaultOpen = {
	read: true,
	write: true,
	create: true
};

module.exports = function (permissions, user) {
	if (!permissions) return defaultOpen;

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
};