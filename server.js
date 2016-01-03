var io = require('socket.io');

var client = require('./client');

var srv = io(3000);

srv.on('connection', function (socket) {
	var c = client();

	c.init_connection('tk0.kru.com', 2000);

	socket.on('incoming_event', function (data) {
		c.emit('incoming_event', data);
	});

	c.on('event', function (data) {
		socket.emit('event', {
			type: data.type,
			data: data.data
		});
	});

	socket.on('disconnect', function () {
		c.connection.end();

		delete c;
	});
});

