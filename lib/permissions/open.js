var defaultOpen = {
  read: true,
  write: true,
  create: true
};

module.exports = function (item, user) {
  return defaultOpen;
}