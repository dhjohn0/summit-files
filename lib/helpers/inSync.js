var Promise = require('summit').Promise;

module.exports = function (list, func) {
  return list.reduce(function (promise, current, index, full) {
    return promise.then(function () {
      return func(current, index, full);
    });
  }, Promise.resolve());
};
