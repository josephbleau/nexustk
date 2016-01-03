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

	var num_objects = decrypted_payload.readUInt16BE(0);

	for (var i = 0; i < num_objects; ++i) {
		var object = decrypted_payload.slice(2 + i * 15, 2 + 15 + (i * 15));

		var x = object.readUInt16BE(0);
		var y = object.readUInt16BE(2);

		var type1 = object.readUInt8(4);

		var id = object.readUInt32BE(5);

		var graphic_data = object.slice(9, 11);

		var dir = object.readUInt8(12);

		var type2 = object.readUInt8(13);

		var unk1 = object.readUInt8(14);

		client.emit_event('new object', {
			x: x,
			y: y,
			type1: type1,
			id: id,
			graphic_data: graphic_data,
			dir: dir,
			type2: type2,
			unk1: unk1
		});
	}
};