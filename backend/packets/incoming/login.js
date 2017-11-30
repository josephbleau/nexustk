var crypt_packet = require('../../crypt_packet');

module.exports = function (client, packet) {
	var inc = packet.readUInt8(4);
	var payload = packet.slice(5, packet.length - 3);
	var decrypted_payload = crypt_packet(client.global_key, inc, payload);

	if (decrypted_payload[0] !== 0x00) {
		throw new Error('Unable to login');
	}

	client.change_state('server_transfer');
};