var build_packet = require('../../build_packet');

module.exports = function (client) {
	var id = 0x00;

	var payload = [client.version & 0xFF, 0xC5, 0x00, 0x00, 0x01, 0x00];

	client.send(build_packet(id, client.version >> 8, payload));
	
	client.inc += 1;
};