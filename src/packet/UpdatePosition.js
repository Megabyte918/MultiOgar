var BinaryWriter = require("./BinaryWriter");

function UpdatePosition(playerTracker, x, y, scale) {
    this.playerTracker = playerTracker,
    this.x = x;
    this.y = y;
    this.scale = scale;
}

module.exports = UpdatePosition;

UpdatePosition.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x11);
    writer.writeFloat(this.x + this.playerTracker.scrambleX);
    writer.writeFloat(this.y + this.playerTracker.scrambleY);
    writer.writeFloat(this.scale);
    return writer.toBuffer();
};
