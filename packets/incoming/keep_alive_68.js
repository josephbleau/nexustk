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

	var bait_1 = decrypted_payload.slice(0, 4);
	var bait_2 = decrypted_payload.slice(4, 8);

	client.change_state('keep_alive_75', {
		bait_1: bait_1,
		bait_2: bait_2
	});
};