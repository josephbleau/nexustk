var gen_temp_key = require('../../gen_temp_key');
var crypt_packet = require('../../crypt_packet');

module.exports = function (client, packet) {
	var inc = packet.readUInt8(4);
	var payload = packet.slice(5, packet.length - 3);
	var tail = packet.slice(packet.length - 3);

	var decrypted_payload = new Buffer(crypt_packet(client.global_key, inc, payload));

	var type = decrypted_payload.readUInt8(0);
	var msg_len = decrypted_payload.readUInt8(2);
	var msg = decrypted_payload.slice(3, 3 + msg_len).toString();

	client.change_state('chat', {
		type: type,
		msg: msg
	});

	client.change_state('main_loop');
};