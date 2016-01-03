require('es6-shim');

var io = require('socket.io');

var client = require('./client');

var srv = io(3000);

var clients_map = {};

srv.on('connection', function (socket) {
	socket.on('init_connection', function (data) {
		var key = socket.id + ':' + data.username;

		if (!clients_map[socket.id]) {
			clients_map[socket.id] = [];
		}

		var c = client(data.username, data.password);

		c.init_connection('tk0.kru.com', 2000);

		c.on('event', function (event_data) {
			socket.emit('event', {
				type: event_data.type,
				data: event_data.data,
				username: data.username
			});
		});

		clients_map[socket.id].push({
			c: c,
			username: data.username
		});
	});

	socket.on('incoming_event', function (data) {
		console.log(clients_map, socket.id);

		var c = clients_map[socket.id].find(function (c) {
			return c.username === data.username;
		});

		if (!c) {
			console.log('bad incoming event');
			return;
		}

		c.c.emit('incoming_event', data); /* man is it 2am or what */
	});

	socket.on('disconnect', function () {
		if (!clients_map[socket.id]) {
			return;
		}

		clients_map[socket.id].forEach(function (c, index) {
			c.connection.end();

			delete c;

			clients_map[socket.id].splice(index, 1);
		});
	});
});