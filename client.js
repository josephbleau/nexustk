var net = require('net');
var EventEmitter = require('events');
var hexdump = require('hexdump-nodejs');

var dump_map = require('./dump_map');
var gen_name_key = require('./gen_name_key');

var packets = {
	incoming: {
		login: require('./packets/incoming/login'),
		server_transfer: require('./packets/incoming/server_transfer'),
		keep_alive_3B: require('./packets/incoming/keep_alive_3B'),
		keep_alive_68: require('./packets/incoming/keep_alive_68'),
		map_metadata: require('./packets/incoming/map_metadata'),
		map_data: require('./packets/incoming/map_data'),
		move: require('./packets/incoming/move'),
		face: require('./packets/incoming/face'),
		chat: require('./packets/incoming/chat'),
		new_player: require('./packets/incoming/new_player'),
		destroy_object: require('./packets/incoming/destroy_object'),
		coordinates: require('./packets/incoming/coordinates'),
		emote: require('./packets/incoming/emote'),
		prompt: require('./packets/incoming/prompt'),
		new_object: require('./packets/incoming/new_object'),
		time: require('./packets/incoming/time'),
		player_id: require('./packets/incoming/player_id'),
		speech: require('./packets/incoming/speech'),
		reset_coordinates: require('./packets/incoming/reset_coordinates')
	},
	outgoing: {
		baram: require('./packets/outgoing/baram'),
		version: require('./packets/outgoing/version'),
		login: require('./packets/outgoing/login'),
		server_change: require('./packets/outgoing/server_change'),
		keep_alive_75: require('./packets/outgoing/keep_alive_75'),
		keep_alive_45: require('./packets/outgoing/keep_alive_45'),
		map_request: require('./packets/outgoing/map_request'),
		walk: require('./packets/outgoing/walk'),
		menu: require('./packets/outgoing/menu'),
		face: require('./packets/outgoing/face'),
		pickup: require('./packets/outgoing/pickup'),
		chat: require('./packets/outgoing/chat'),
		attack: require('./packets/outgoing/attack'),
		whisper: require('./packets/outgoing/whisper'),
		refresh: require('./packets/outgoing/refresh')
	}
};

module.exports = function () {
	var client = new EventEmitter();

	client.packets = [];

	client.state = 'disconnected';

	client.inc = 0;
	client.walk_inc = 0x80;

	client.version = 710;

	client.global_key = 'Urk#nI7ni';

	client.username = 'gnij';
	client.password = 'aaa1';

	client.connection = null;

	client.server = 'login';

	client.name_key = gen_name_key(client.username);

	client.objects_map = {};

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

			case 'main_loop':
				var id = packet.readUInt8(3);

				if (id === 0x68) {
					packets.incoming.keep_alive_68(client, packet);
				}

				else if (id === 0x3B) {
					packets.incoming.keep_alive_3B(client, packet);
				}

				else if (id === 0x15) {
					packets.incoming.map_metadata(client, packet);
				}

				else if (id === 0x06) {
					packets.incoming.map_data(client, packet);
				}

				else if (id === 0x0C) {
					packets.incoming.move(client, packet);
				}

				else if (id === 0x11) {
					packets.incoming.face(client, packet);
				}

				else if (id === 0x0A) {
					packets.incoming.chat(client, packet);
				}

				else if (id === 0x33) {
					packets.incoming.new_player(client, packet);
				}

				else if (id === 0x0E) {
					packets.incoming.destroy_object(client, packet);
				}

				else if (id === 0x04) {
					packets.incoming.coordinates(client, packet);
				}

				else if (id === 0x1A) {
					packets.incoming.emote(client, packet);
				}

				else if (id === 0x30) {
					packets.incoming.prompt(client, packet);
				}

				else if (id === 0x07) {
					packets.incoming.new_object(client, packet);
				}

				else if (id === 0x20) {
					packets.incoming.time(client, packet);
				}

				else if (id === 0x05) {
					packets.incoming.player_id(client, packet);
				}

				else if (id === 0x0D) {
					packets.incoming.speech(client, packet);
				}

				else if (id === 0x26) {
					packets.incoming.reset_coordinates(client, packet);
				}

				else {
					console.log(new Date(), 'ID', id.toString(16));
				}

				break;

			default:
				console.log('handle_packet', client.state, hexdump(packet));
		}
	};

	client.change_state = function (new_state, data) {
		client.state = new_state;

		client.emit('state_change', data);
	};

	client.emit_event = function (type, data) {
		client.emit('event', {
			type: type,
			data: data
		});
	};

	client.on('incoming_event', function (data) {
		var type = data.type;
		var data = data.data;

		switch (type) {
			case 'walk':
				packets.outgoing.walk(client, data);

				break;

			case 'attack':
				packets.outgoing.attack(client, data);

				break;

			case 'menu':
				packets.outgoing.menu(client, data);

				break;

			case 'pickup':
				packets.outgoing.pickup(client, data);

				break;	

			case 'chat':
				packets.outgoing.chat(client, data);

				break;	

			case 'whisper':
				packets.outgoing.whisper(client, data);

				break;

			case 'face':
				packets.outgoing.face(client, data);

				break;

			case 'drop_item':
				packets.outgoing.drop_item(client, data);

				break;

			case 'drop_money':
				packets.outgoing.drop_money(client, data);

				break;

			case 'refresh':
				packets.outgoing.refresh(client, data);

				break;

			case 'map_dump':
				client.emit_event('map_dump', { map: dump_map(client.map, client.objects_map) });

				break;

			default:
				console.log('unknown event', type);
		}
	});

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

			case 'keep_alive_75':
				packets.outgoing.keep_alive_75(client, data);

				break;

			case 'keep_alive_45':
				packets.outgoing.keep_alive_45(client, data);

				break;

			case 'map_request':
				packets.outgoing.map_request(client, data);

				break;

			default:
				console.log('state_change', client.state, data);
		}
	});

	return client;
};