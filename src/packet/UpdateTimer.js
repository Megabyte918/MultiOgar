var BinaryWriter = require("./BinaryWriter");

class UpdateTimer {
    constructor(timeLeft) {
        this.timeLeft = timeLeft;
    }

    build(protocol) {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x7b);
        writer.writeUInt16(this.timeLeft);
        return writer.toBuffer();
    };
};

module.exports = UpdateTimer;