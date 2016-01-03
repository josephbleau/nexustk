var gen_temp_key = require('../../gen_temp_key');
var crypt_packet = require('../../crypt_packet');

module.exports = function (client, packet) {
	var inc = packet.readUInt8(4);
	var payload = packet.slice(5, packet.length - 3);
	var tail = packet.slice(packet.length - 3);

	var short_arg = ((tail[2] ^ 0x74) << 8) + (tail[0] ^ 0x24);
	var byte_arg = tail[1] ^ 0x21;

	var temp_key = gen_temp_key(client.name_key, short_arg, byte_arg);

	var decrypted_payload = new Buffer(crypt_packet(temp_key, inc, payload));

	var player_x = decrypted_payload.readUInt16BE(0);
	var player_y = decrypted_payload.readUInt16BE(2);
	var camera_x = decrypted_payload.readUInt16BE(4);
	var camera_y = decrypted_payload.readUInt16BE(6);

	client.emit_event('coordinates', {
		player_x: player_x,
		player_y: player_y,
		camera_x: camera_x,
		camera_y: camera_y
	});
};