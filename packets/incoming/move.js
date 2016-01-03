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

	var id = decrypted_payload.readUInt32BE(0);
	var dir = decrypted_payload.readUInt8(8);

	var object = client.objects_map[id];

	if (dir === 0) {
		object.y -= 1;
	}

	else if (dir === 1) {
		object.x += 1;
	}

	else if (dir === 2) {
		object.x += 1;
	}

	else if (dir === 3) {
		object.y += 1;
	}

	client.emit_event('move', {
		id: id,
		dir: dir_map[dir]
	});
};