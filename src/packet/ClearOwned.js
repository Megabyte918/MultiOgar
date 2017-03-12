var BinaryWriter = require("./BinaryWriter");

function ClearOwned() { }

module.exports = ClearOwned;

ClearOwned.prototype.build = function (protocol) {
    var writer = new BinaryWriter();
    writer.writeUInt8(0x14);
    return writer.toBuffer();
};
