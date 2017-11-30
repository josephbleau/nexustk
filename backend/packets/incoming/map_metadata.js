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

	var map_id = decrypted_payload.readUInt16BE(0);
	var width = decrypted_payload.readUInt16BE(2);
	var height = decrypted_payload.readUInt16BE(4);
	var name_len = decrypted_payload.readUInt16BE(7);
	var name = decrypted_payload.slice(9, 9 + name_len).toString();

	client.map_width = width;
	client.map_height = height;

	client.change_state('map_request', {
		map_id: map_id,
		width: width,
		height: height,
		name: name
	});
};