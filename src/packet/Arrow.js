var BinaryWriter = require('./BinaryWriter');

function Arrow (friends, set) {
	this.friends = friends;
}

module.exports = Arrow;

Arrow.prototype.build = function(protocol) {
	var writer = new BinaryWriter();
		writer = this.build160(writer);
	return writer.toBuffer();
};

Arrow.prototype.build160 = function(writer, playerTracker) {
	writer.writeUInt8(0xA0);
	for (var i in this.friends) {
	var friend = this.friends[i];
	writer.writeUInt16(friend.cells[0].position.x >> 0);
	writer.writeUInt16(friend.cells[0].position.y >> 0);
	writer.writeStringZeroUtf8(friend._name);
};
	return writer;
};
