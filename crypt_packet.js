module.exports = function (key, inc, data) {
	var output = [];

	for (var i = 0; i < data.length; ++i) {
		var c = key.charCodeAt(i % 9);

		output[i] = data[i] ^ c;

		var group = Math.floor(i / 9);

		if (group !== inc) {
			output[i] = output[i] ^ group;
		}

		output[i] = output[i] ^ inc;
	}

	return output;
};