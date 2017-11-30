var build_packet = require('../../build_packet');
var utilities = require('../../utilities');

module.exports = function (client, data) {
	var id = 0x10;

	var payload = [];

	payload.push(data.server_key_len & 0xFF);
	payload = payload.concat(utilities.str_to_chars(data.server_key));

	payload.push(client.username.length);
	payload = payload.concat(utilities.str_to_chars(client.username));

	payload.push(data.login_id >> 24);
	payload.push((data.login_id >> 16) & 0xFF);
	payload.push((data.login_id >> 8) & 0xFF);
	payload.push(data.login_id & 0xFF);

	payload.push(0x01);
	payload.push(0x00);

	client.server = 'game';
	
	client.inc = 0;

	client.connection.end();

	client.init_connection(data.ip, data.port);
	
	client.send(build_packet(id, data.server_key_len >> 8, payload));
};