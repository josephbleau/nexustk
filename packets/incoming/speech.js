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

	var type = decrypted_payload.readUInt8(0);
	var id = decrypted_payload.readUInt32BE(1);
	var msg_len = decrypted_payload.readUInt8(5);
	var msg = decrypted_payload.slice(6, 6 + msg_len).toString();

	client.emit_event('speech', {
		type: type,
		id: id,
		msg: msg
	});
};