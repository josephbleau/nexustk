module.exports = function (username_key, short_arg, byte_arg) {
	var ecx = byte_arg * byte_arg;
	var ebx;

	var temp_key = '';

	for (var i = 0; i < 9; ++i) {
		ebx = ((ecx * i) + short_arg) & 0x800003FF;

		var c = String.fromCharCode(username_key.charCodeAt(ebx));;
		
		temp_key += c;

		ecx += 3;
	}

	return temp_key;
};