var Readable = require('stream').Readable;
var util = require('util');
util.inherits(StringStream, Readable);

function StringStream(str, opt) {
  Readable.call(this, opt);
  this._string = str;
  this._first = true;
}

StringStream.prototype._read = function() {
  if (this._first) {
    var buf = new Buffer(this._string, 'ascii');
    this.push(buf);
    this._first = false;
  }else{
    this.push(null);
  }
};

module.exports = StringStream;