var utilities = require('../../utilities');
var crypt_packet = require('../../crypt_packet');
var gen_packet_tail = require('../../gen_packet_tail');
var build_packet = require('../../build_packet');

module.exports = function (client) {
	var id = 0x03;

	var payload = [];

	payload.push(client.username.length);
	payload = payload.concat(utilities.str_to_chars(client.username));
	payload.push(client.password.length);
	payload = payload.concat(utilities.str_to_chars(client.password));
	payload = payload.concat([0xF3, 0x1C, 0x27, 0x56, 0x00]); /* oddly specific signature */

	var short_arg = (utilities.rand() % 0xFEFD) + 0x100;
	var byte_arg = (utilities.rand() % 0x9B) + 0x64;

	var crypted_packet = crypt_packet(client.global_key, client.inc, payload);

	var tail = gen_packet_tail(id, client.inc, crypted_packet, short_arg, byte_arg);

	client.send(build_packet(id, client.inc, crypted_packet, tail));
	
	client.inc += 1;
};