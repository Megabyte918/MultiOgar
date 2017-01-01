function Mode() {
    this.ID = -1;
    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
    this.lastmanStanding = false;
}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function (gameServer) {
    // Called when the server starts
    gameServer.run = true;
    if (gameServer.config.lastManStanding) {
        var self = this;
        var short = 15 * 60000; // 15 Minutes
        var long = 60 * 60000; // 60 Minutes
        var shortreset = 15 * 60000; // 15 Minutes
        var longreset = 30 * 60000; // 30 Minutes
        var time = Math.floor((Math.random() * (long - short)) + short);
        var resetTime = (Math.floor((Math.random() * (longreset - shortreset)) + shortreset)) + time;
        var startInt = setInterval(function() {self.lastManStandingstart()}, time);
        var endInt = setInterval(function() {self.lastManStandingend()}, resetTime);
    }
};

Mode.prototype.lastManStandingstart = function(gameServer) {
    this.lastManStandingStart = true;
};
 
Mode.prototype.lastManStandingend = function(gameServer) {
    this.lastManStandingStart = false;
};

Mode.prototype.onTick = function (gameServer) {
    // Called on every game tick 
};

Mode.prototype.onPlayerInit = function (player) {
    // Called after a player object is constructed
};

Mode.prototype.onPlayerSpawn = function (gameServer, player) {
    // Called when a player is spawned
    if (!this.lastmanstanding) {
        player.setColor(gameServer.getRandomColor()); // Random color
        gameServer.spawnPlayer(player, gameServer.randomPos());
    }
};

Mode.prototype.onCellAdd = function (cell) {
    // Called when a player cell is added
};

Mode.prototype.onCellRemove = function (cell) {
    // Called when a player cell is removed
};

Mode.prototype.onCellMove = function (cell, gameServer) {
    // Called when a player cell is moved
};

Mode.prototype.updateLB = function (gameServer) {
    // Called when the leaderboard update function is called
    gameServer.leaderboardType = this.packetLB;
};
