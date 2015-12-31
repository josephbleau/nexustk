var net = require('net');
var EventEmitter = require('events');
var hexdump = require('hexdump-nodejs');

var packets = {
	outgoing: {
		baram: require('./packets/outgoing/baram'),
		version: require('./packets/outgoing/version'),
		login: require('./packets/outgoing/login'),
		server_change: require('./packets/outgoing/server_change')
	},
	incoming: {
		login: require('./packets/incoming/login'),
		server_transfer: require('./packets/incoming/server_transfer')
	}
};

module.exports = function () {
	var client = new EventEmitter();

	client.packets = [];

	client.state = 'disconnected';

	client.inc = 0;

	client.version = 710;

	client.global_key = 'Urk#nI7ni';

	client.username = 'gnij';
	client.password = 'aaa1';

	client.connection = null;

	client.server = 'login';

	client.init_connection = function (host, port) {
		client.connection = net.connect(port, host);

		client.connection.on('connect', function () {
			client.change_state('connected');
		});

		client.connection.on('disconnect', function () {
			client.change_state('disconnected');
		});

		client.connection.on('data', client.receive);
	};

	client.receive = function (chunk) {
		var i = 0;

		while (i < chunk.length) {
			var length = chunk.readUInt16BE(i + 1);

			var packet = chunk.slice(i, i + length + 3)
			client.packets.push(packet);
			client.emit('incoming_packet');

			i += length + 3;
		}
	};

	client.send = function (data) {
		console.log(data);

		client.connection.write(data, 'binary');
	};

	client.handle_packet = function (packet) {
		switch (client.state) {
			case 'connected': 
				if (client.server === 'login') {
					client.change_state('connected_server');
				}

				else {
					client.change_state('main_loop');
				}
				
				break;

			case 'version_response':
				client.change_state('login');
				break;

			case 'login_response':
				packets.incoming.login(client, packet);
				break;

			case 'server_transfer':
				packets.incoming.server_transfer(client, packet);
				break;

			default:
				console.log('handle_packet', client.state, hexdump(packet));
		}
	};

	client.change_state = function (new_state, data) {
		client.state = new_state;

		client.emit('state_change', data);
	};

	client.on('incoming_packet', function () {
		var packet = client.packets.shift();

		client.handle_packet(packet);
	});

	client.on('state_change', function (data) {
		switch (client.state) {
			case 'connected_server': 
				packets.outgoing.baram(client);
				packets.outgoing.version(client);

				client.change_state('version_response');
				break;

			case 'login':
				packets.outgoing.login(client);

				client.change_state('login_response');
				break;

			case 'server_change':
				packets.outgoing.server_change(client, data);

				break;

			default:
				console.log('state_change', client.state);
		}
	});

	return client;
}();