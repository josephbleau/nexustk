var utilities = require('../../utilities');
var crypt_packet = require('../../crypt_packet');
var gen_packet_tail = require('../../gen_packet_tail');
var gen_name_key = require('../../gen_name_key');
var gen_temp_key = require('../../gen_temp_key');
var build_packet = require('../../build_packet');

var dir_map = {
	'up': 0,
	'right': 1,
	'down': 2,
	'left': 3
};

module.exports = function (client, data) {
	var id = 0x32;

	var payload = [];

	payload.push(dir_map[data.dir]);
	payload.push(client.walk_inc);
	payload.push(data.speed);
	payload = payload.concat([client.player_x >> 8, client.player_x & 0xFF]);
	payload = payload.concat([client.player_y >> 8, client.player_y & 0xFF]);

	payload.push(0x00);

	payload.push(0x00);

	payload.push(id);

	var short_arg = (utilities.rand() % 0xFEFD) + 0x100;
	var byte_arg = (utilities.rand() % 0x9B) + 0x64;

	var temp_key = gen_temp_key(client.name_key, short_arg, byte_arg);

	var crypted_packet = crypt_packet(temp_key, client.inc, payload);

	var tail = gen_packet_tail(id, client.inc, crypted_packet, short_arg, byte_arg);

	var packet = build_packet(id, client.inc, crypted_packet, tail);

	client.send(packet);
	
	client.inc += 1;
	
	client.walk_inc += 1;

	if (data.dir === 'up') {
		client.player_y -= 1;
	}

	else if (data.dir === 'right') {
		client.player_x += 1;
	}

	else if (data.dir === 'left') {
		client.player_x += 1;
	}

	else if (data.dir === 'down') {
		client.player_y += 1;
	}

	client.objects_map[client.player_id].x = client.player_x;
	client.objects_map[client.player_id].y = client.player_y;
};