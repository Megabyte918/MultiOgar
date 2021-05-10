const FFA = require('./FFA'); // Base gamemode
const Entity = require('../entity');

class Experimental extends FFA {
    constructor() {
        super();
        this.ID = 2;
        this.name = "Experimental";
        this.specByLeaderboard = true;
        // Gamemode Specific Variables
        this.nodesMother = [];
        // Config
        this.motherSpawnInterval = 125; // How many ticks it takes to spawn another mother cell (5 seconds)
        this.motherMinAmount = 10;
    }
    // Gamemode Specific Functions
    spawnMotherCell(server) {
        // Checks if there are enough mother cells on the map
        if (this.nodesMother.length >= this.motherMinAmount) {
            return;
        }
        // Spawn if no cells are colliding
        var mother = new Entity.MotherCell(server, null, server.randomPos(), 149);
        server.safeSpawn(mother);
    }
    // Override
    onServerInit(server) {
        // Called when the server starts
        server.run = true;
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
            self.nodesMother.removeUnsorted(this);
        };
    }
    onTick(server) {
        // Mother Cell Spawning
        if ((server.ticks % this.motherSpawnInterval) === 0) {
            this.spawnMotherCell(server);
        }
        var updateInterval;
        for (const motherCell of this.nodesMother) {
            if (motherCell.radius <= motherCell.motherCellMinSize)
                updateInterval = Math.random() * (50 - 25) + 25;
            else updateInterval = 2;
            if ((server.ticks % ~~updateInterval) === 0)
                motherCell.onUpdate();
        }
    }
}

module.exports = Experimental;
