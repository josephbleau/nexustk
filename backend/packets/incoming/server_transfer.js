var utilities = require('../../utilities');
var crypt_packet = require('../../crypt_packet');

module.exports = function (client, packet) {
	var ip = packet.readUInt32LE(0x04);
	var port = packet.readUInt16BE(0x08);

	var server_key_len = packet.readUInt16BE(0x0B);
	var server_key = packet.toString('ascii', 0x0D, 0x0D + server_key_len);

	var username_len = packet.readUInt8(server_key_len + 0x0D);
	var username = packet.toString('ascii', server_key_len + 0x0E, server_key_len + 0x0E + username_len);

	var login_id = packet.readUInt32BE(server_key_len + 0x0E + username_len);

	client.change_state('server_change', {
		server_key_len: server_key_len,
		server_key: server_key,
		username_len: username_len,
		username: username,
		login_id: login_id,
		ip: utilities.convert_ip(ip),
		port: port
	});
};