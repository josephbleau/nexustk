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

	var player_id = decrypted_payload.readUInt32BE(decrypted_payload);

	client.change_state('player_id', {
		player_id: player_id
	});

	client.change_state('main_loop');
};