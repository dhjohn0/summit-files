module.exports = function (req, locals, next) {
  var flash = {
    info: req.flash('info'),
    warn: req.flash('warn'),
    error: req.flash('error')
  };
  console.log(flash);
  locals.flash = flash;

  return next();
};