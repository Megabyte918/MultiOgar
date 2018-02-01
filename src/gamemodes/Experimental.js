var FFA = require('./FFA'); // Base gamemode
var Entity = require('../entity');

function Experimental() {
    FFA.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 2;
    this.name = "Experimental";
    this.specByLeaderboard = true;
    
    // Gamemode Specific Variables
    this.nodesMother = [];
    
    // Config
    this.motherSpawnInterval = 125; // How many ticks it takes to spawn another mother cell (5 seconds)
    this.motherMinAmount = 10;
}

module.exports = Experimental;
Experimental.prototype = new FFA();

// Gamemode Specific Functions

Experimental.prototype.spawnMotherCell = function (gameServer) {
    // Checks if there are enough mother cells on the map
    if (this.nodesMother.length >= this.motherMinAmount) {
        return;
    }
    // Spawn if no cells are colliding
    var mother = new Entity.MotherCell(gameServer, null, gameServer.randomPos(), 149);
    if (!gameServer.willCollide(mother))
        gameServer.addNode(mother);
};

// Override

Experimental.prototype.onServerInit = function (gameServer) {
    // Called when the server starts
    gameServer.run = true;
    
    // Ovveride functions for special virus mechanics
    var self = this;
    Entity.Virus.prototype.onEat = function (prey) {
        // Pushes the virus
        this.setBoost(220, prey.boostDirection.angle());
    };
    Entity.MotherCell.prototype.onAdd = function () {
        self.nodesMother.push(this);
    };
    Entity.MotherCell.prototype.onRemove = function () {
        var index = self.nodesMother.indexOf(this);
        if (index != -1) 
            self.nodesMother.splice(index, 1);
    };
};

Experimental.prototype.onTick = function (gameServer) {
    // Mother Cell Spawning
    if ((gameServer.tickCounter % this.motherSpawnInterval) === 0) {
        this.spawnMotherCell(gameServer);
    }
    var updateInterval;
    for (var i = 0; i < this.nodesMother.length; ++i) {
        var motherCell = this.nodesMother[i];

        if (motherCell._size <= motherCell.motherCellMinSize)
            updateInterval = Math.random() * (50 - 25) + 25;
        else
            updateInterval = 2;

        if ((gameServer.tickCounter % ~~updateInterval) === 0) {
            motherCell.onUpdate();
        }
    }
};
