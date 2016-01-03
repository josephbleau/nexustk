var crypto = require('crypto');

var seed = 0x0029E2C0;

module.exports = {
	md5: function (buf) {
		var s = crypto.createHash('md5');

		s.update(buf);
		s.end();

		return s.read();
	},
	rand: function () {
		seed = (seed * 0x343FD) + 0x269EC3;

		return (seed >> 0x10) & 0x7FFF;
	},
	str_to_chars: function (str) {
		var chars = [];

		for (var i = 0; i < str.length; ++i) {
			chars.push(str.charCodeAt(i));
		}

		return chars;
	},
	convert_ip: function (ip) {
		var parts = [];
	
		parts[0] = ip >> 24;
		parts[1] = (ip >> 16) & 0xFF;
		parts[2] = (ip >> 8) & 0xFF;
		parts[3] = ip & 0xFF;

		return parts.join('.');
	},
	byte_swap: function (val) {
		return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
	},
	push_uint32: function (arr, val) {
		var parts = [];
	
		parts[0] = val >> 24;
		parts[1] = (val >> 16) & 0xFF;
		parts[2] = (val >> 8) & 0xFF;
		parts[3] = val & 0xFF;

		return arr.concat(parts);
	}
};