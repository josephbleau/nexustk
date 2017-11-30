var utilities = require('./utilities');

module.exports = function (id, inc, payload, short_arg, byte_arg) {
	var buf = Buffer.concat([new Buffer([id, inc]), new Buffer(payload)]);

	var md5_buf = utilities.md5(buf);

	var tail = new Buffer(7);

	tail[0] = md5_buf[0x0D];
	tail[1] = md5_buf[0x03];
	tail[2] = md5_buf[0x0B];
	tail[3] = md5_buf[0x07];

	tail[4] = (short_arg & 0x800000FF) ^ 0x61;
	tail[5] = (byte_arg & 0x800000FF) ^ 0x25;
	tail[6] = ((short_arg >> 8) & 0x800000FF) ^ 0x23;

	return tail;
};