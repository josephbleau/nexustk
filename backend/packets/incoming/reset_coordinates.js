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

	var decrypted_payload = new Buffer(crypt_packet(temp_key, inc, payload));

	var player_x = decrypted_payload.readUInt16BE(1);
	var player_y = decrypted_payload.readUInt16BE(3);

	var walk_inc = decrypted_payload.readUInt8(9);

	client.player_x = player_x;
	client.player_y = player_y;
	client.walk_inc = walk_inc;

	client.objects_map[client.player_id].x = client.player_x;
	client.objects_map[client.player_id].y = client.player_y;

	client.emit_event('reset_coordiantes', {
		player_x: player_x,
		player_y: player_y,
		walk_inc: walk_inc
	});
};