var utilities = require('../../utilities');
var crypt_packet = require('../../crypt_packet');
var gen_packet_tail = require('../../gen_packet_tail');
var build_packet = require('../../build_packet');

module.exports = function (client) {
	var id = 0x62;

	var payload = [0x61, 0x72, 0x61, 0x6D, 0x00];

	var short_arg = (utilities.rand() % 0xFEFD) + 0x100;
	var byte_arg = (utilities.rand() % 0x9B) + 0x64;

	var crypted_packet = crypt_packet(client.global_key, client.inc, payload);

	var tail = gen_packet_tail(id, client.inc, crypted_packet, short_arg, byte_arg);

	client.send(build_packet(id, client.inc, crypted_packet, tail));
	
	client.inc += 1;
};