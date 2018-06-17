// Project imports
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../PacketHandler');

function BotLoader(gameServer) {
    this.gameServer = gameServer;
    this.loadNames();
}

module.exports = BotLoader;

BotLoader.prototype.getName = function () {
    var name = "";
    
    // Picks a random name for the bot
    if (this.randomNames.length > 0) {
        var index = (this.randomNames.length * Math.random()) >>> 0;
        name = this.randomNames[index];
    } else {
        name = "bot" + ++this.nameIndex;
    }
    
    return name;
};

BotLoader.prototype.loadNames = function () {
    this.randomNames = [];
    var fs = require("fs");
    
    if (fs.existsSync("../src/ai/BotNames.txt")) {
        // Read and parse the names - filter out whitespace-only names
        this.randomNames = fs.readFileSync("../src/ai/BotNames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty names
        });
    }
    this.nameIndex = 0;
};

BotLoader.prototype.addBot = function () {
    var BotPlayer = require('./BotPlayer');
    var s = new FakeSocket(this.gameServer);
    s.playerTracker = new BotPlayer(this.gameServer, s);
    s.packetHandler = new PacketHandler(this.gameServer, s);
    
    // Add to client list
    this.gameServer.clients.push(s);
    
    // Add to world
    s.packetHandler.setNickname(this.getName());
};

BotLoader.prototype.addMinion = function(owner, name, mass) {
    var MinionPlayer = require('./MinionPlayer');
    var s = new FakeSocket(this.gameServer);
    s.playerTracker = new MinionPlayer(this.gameServer, s, owner);
    s.packetHandler = new PacketHandler(this.gameServer, s);
    s.playerTracker.owner = owner;

    var size;
    if (isNaN(mass)) {
        size = this.gameServer.config.minionStartSize;
        if (this.gameServer.config.minionMaxStartSize > size)
        size = Math.random() * (this.gameServer.config.minionMaxStartSize - size) + size;
    } else {
        size = Math.sqrt(mass * 100);
    }
    s.playerTracker.spawnmass = size;
    
    // Add to client list
    this.gameServer.clients.push(s);

    // Add to world & set name
    if (typeof name == "undefined" || name == "") {
        name = this.gameServer.config.defaultName;
    }
    s.packetHandler.setNickname(name);
};
