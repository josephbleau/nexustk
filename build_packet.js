module.exports = function (id, inc, payload, tail) {
	var packet_length = 0;

	packet_length += 2; /* id + inc */
	packet_length += payload.length;

	if (tail) {
		packet_length += tail.length;
	}

	var header = new Buffer([0xAA, packet_length >> 8, packet_length & 0xFF, id, inc]);

	return Buffer.concat([header, new Buffer(payload), tail ? new Buffer(tail) : new Buffer([])]);
};