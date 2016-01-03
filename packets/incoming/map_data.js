var hexdump = require('hexdump-nodejs');
var gen_temp_key = require('../../gen_temp_key');
var crypt_packet = require('../../crypt_packet');

module.exports = function (client, packet) {
	var inc = packet.readUInt8(4);
	var payload = packet.slice(5, packet.length - 3);
	var tail = packet.slice(packet.length - 3);

	var short_arg = ((tail[2] ^ 0x74) << 8) + (tail[0] ^ 0x24);
	var byte_arg = tail[1] ^ 0x21;

	var temp_key = gen_temp_key(client.name_key, short_arg, byte_arg);

	var decrypted_payload = crypt_packet(temp_key, inc, payload);

	var tiles_data = decrypted_payload.slice(7); /* skip first 7 bytes */

	var map = [];

	for (var i = 0, xi = 0, yi = 0; i < tiles_data.length; i += 6) {
		var tile_data = new Buffer(tiles_data.slice(i, i + 6));

		var tile = {
			tile: tile_data.readUInt16BE(0),
			flags: tile_data.readUInt16BE(2),
			object: tile_data.readUInt16BE(4)
		};

		if (!map[yi]) {
			map[yi] = [];
		}

		map[yi].push(tile);

		xi += 1;

		if (xi % client.map_width === 0) {
			xi = 0;
			yi += 1;
		}
	}

	client.emit_event('map_data', {
		map: map
	});
};