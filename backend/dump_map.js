module.exports = function (map, objects) {
	var str = '';

	map.forEach(function (row, y) {
		row.forEach(function (col, x) {
			var walkable = !(col['flags'] || col['object']);

			if (!walkable) {
				str += '1';
			}

			else {
				var printed = false;

				Object.keys(objects).forEach(function (key) {
					if (objects[key].y === y && objects[key].x === x) {
						printed = true;

						if (objects[key].type === 'npc') {
							str += 'N';
						}

						else {
							str += 'P';
						}
					}
				});

				if (!printed) {
					str += '0';
				}
			}
		});

		str += '\n';
	});

	return str;
};