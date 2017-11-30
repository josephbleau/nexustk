var crypto = require('crypto');

module.exports = function (username) {
	var username_sum = crypto.createHash('md5').update(username).digest('hex');

	var buf = crypto.createHash('md5').update(username_sum).digest('hex');

	for (var i = 0; i < 31; ++i) {
		buf += crypto.createHash('md5').update(buf).digest('hex');
	}

	return buf;
};