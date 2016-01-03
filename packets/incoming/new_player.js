var gen_temp_key = require('../../gen_temp_key');
var crypt_packet = require('../../crypt_packet');

var dir_map = {
	0: 'up',
	1: 'right',
	2: 'down',
	3: 'left'
};

module.exports = function (client, packet) {
	var inc = packet.readUInt8(4);
	var payload = packet.slice(5, packet.length - 3);
	var tail = packet.slice(packet.length - 3);

	var short_arg = ((tail[2] ^ 0x74) << 8) + (tail[0] ^ 0x24);
	var byte_arg = tail[1] ^ 0x21;

	var temp_key = gen_temp_key(client.name_key, short_arg, byte_arg);

	var decrypted_payload = new Buffer(crypt_packet(temp_key, inc, payload));

	var x = decrypted_payload.readUInt16BE(0);
	var y = decrypted_payload.readUInt16BE(2);
	var dir = decrypted_payload.readUInt8(4);
	var id = decrypted_payload.readUInt32BE(5);
	var name_len = decrypted_payload.readUInt8(52);
	var name = decrypted_payload.slice(53, 53 + name_len).toString();

	client.change_state('new_player', {
		x: x,
		y: y,
		dir: dir_map[dir],
		id: id,
		name: name
	});

	client.change_state('main_loop');
};