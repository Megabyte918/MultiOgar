// Import
var BinaryWriter = require("./BinaryWriter");


function UpdateLeaderboard(playerTracker, leaderboard, leaderboardType) {
    this.playerTracker = playerTracker;
    this.leaderboard = leaderboard;
    this.leaderboardType = leaderboardType;
    this.leaderboardCount = Math.min(leaderboard.length, playerTracker.gameServer.config.serverMaxLB);
}

module.exports = UpdateLeaderboard;

UpdateLeaderboard.prototype.build = function(protocol) {
    switch (this.leaderboardType) {
        case 48:
            // UserText
            return this.buildUserText(protocol);
        case 49:
            // FFA
            if (protocol < 6)
                return this.buildFfa5();
            else if (protocol < 11)
                return this.buildFfa6();
            else return this.buildFfa11();
        case 50:
            // Team
            return this.buildTeam();
        default:
            return null;
    }
}

// UserText
UpdateLeaderboard.prototype.buildUserText = function (protocol) {
    var writer = new BinaryWriter();
    writeCount(writer, 0x31, this.leaderboard.length);
    for (var i = 0; i < this.leaderboard.length; i++) {
        var item = this.leaderboard[i] || "";

        if (protocol < 11) writer.writeUInt32(0);
        if (protocol < 6) writer.writeStringZeroUnicode(item);
        else writer.writeStringZeroUtf8(item);
    }
    return writer.toBuffer();
};


// FFA protocol 5
UpdateLeaderboard.prototype.buildFfa5 = function() {
    var writer = new BinaryWriter();
    writeCount(writer, 0x31, this.leaderboardCount);
    for (var i = 0; i < this.leaderboardCount; i++) {
        var item = this.leaderboard[i];
        if (item == null) return null;  // bad leaderboardm just don't send it

        var name = item._nameUnicode;
        var id = 0;
        if (item == this.playerTracker && item.cells.length)
            id = item.cells[0].nodeId ^ this.playerTracker.scrambleId;

        writer.writeUInt32(id >>> 0);   // Player cell Id
        if (name) writer.writeBytes(name);
        else writer.writeUInt16(0);
    }
    return writer.toBuffer();
};

// FFA protocol 6
UpdateLeaderboard.prototype.buildFfa6 = function() {
    var writer = new BinaryWriter();
    writeCount(writer, 0x31, this.leaderboardCount);
    for (var i = 0; i < this.leaderboardCount; i++) {
        var item = this.leaderboard[i];
        if (item == null) return null;   // bad leaderboardm just don't send it

        var name = item._nameUtf8;
        var id = item == this.playerTracker ? 1 : 0;

        writer.writeUInt32(id >>> 0);   // isMe flag
        if (name) writer.writeBytes(name);
        else writer.writeUInt8(0);
    }
    return writer.toBuffer();
};

// FFA protocol 11
UpdateLeaderboard.prototype.buildFfa11 = function() {
    var pos = require('./LeaderboardPosition');
    this.playerTracker.socket.packetHandler.sendPacket(
        new pos(this.leaderboard.indexOf(this.playerTracker) + 1)
    );
    var writer = new BinaryWriter();
    writeCount(writer, 0x31, this.leaderboardCount);
    for (var i = 0; i < this.leaderboardCount; i++) {
        var item = this.leaderboard[i];
        if (item == null) return null;  // bad leaderboardm just don't send it

        var name = item._nameUtf8;
        if (name) writer.writeBytes(name);
        else writer.writeUInt8(0);
    }
    return writer.toBuffer();
};

function writeCount(writer, flag1, flag2) {
    writer.writeUInt8(flag1);          // Packet ID
    writer.writeUInt32(flag2 >>> 0);   // Number of elements
}

// Team
UpdateLeaderboard.prototype.buildTeam = function() {
    var writer = new BinaryWriter();
    writeCount(writer, 0x32, this.leaderboard.length);
    for (var i = 0; i < this.leaderboard.length; i++) {
        var value = this.leaderboard[i];
        if (value == null) return null;  // bad leaderboardm just don't send it

        if (isNaN(value)) value = 0;
        value = value < 0 ? 0 : value;
        value = value > 1 ? 1 : value;

        writer.writeFloat(value);        // isMe flag (previously cell ID)
    }
    return writer.toBuffer();
};
