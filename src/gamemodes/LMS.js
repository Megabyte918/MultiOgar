var FFA = require('./FFA'); // Base gamemode
var Entity = require('../entity');
var Logger = require('../modules/Logger');
//LMS based gamemode
//Experimental Mode
function LMS () {
    var StartofLMS = false;


    FFA.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 21;
    this.name = "LMS";
    this.specByLeaderboard = true;
    
    // Gamemode Specific Variables
    this.nodesMother = [];
    this.tickMotherSpawn = 0;
    this.tickMotherUpdate = 0;
    
    // Config
    this.motherSpawnInterval = 25 * 5;  // How many ticks it takes to spawn another mother cell (5 seconds)
    this.motherUpdateInterval = 2;     // How many ticks it takes to spawn mother food (1 second)
    this.motherMinAmount = 20;
    this.motherMaxAmount = 30;
    this.contenders = [];
    this.maxcontenders = 1500;
}

module.exports = LMS;
LMS.prototype = new FFA();

// Gamemode Specific Functions

LMS.prototype.spawnMotherCell = function (gameServer) {
    // Checks if there are enough mother cells on the map
    if (this.nodesMother.length >= this.motherMinAmount) {
        return;
    }
    // Spawns a mother cell
    var pos = gameServer.getRandomPosition();
    if (gameServer.willCollide(pos, 149)) {
        // cannot find safe position => do not spawn
        return;
    }
    // Spawn if no cells are colliding
    var mother = new Entity.MotherCell(gameServer, null, pos, null);
    gameServer.addNode(mother);
};

// Override

LMS.prototype.onServerInit = function (gameServer) {
    // Called when the server starts
    gameServer.run = true;
    
    var mapSize = Math.max(gameServer.border.width, gameServer.border.height);
    
    // 7 mother cells for vanilla map size
    //this.motherMinAmount = Math.ceil(mapSize / 2000);
    //this.motherMaxAmount = this.motherMinAmount * 2;
    
    var self = this;
    // Override
    
    // Special virus mechanics
    Entity.Virus.prototype.onEat = function (prey) {
        // Pushes the virus
        var angle = prey.isMoving ? prey.boostDirection.angle : this.boostDirection.angle;
        this.setBoost(16 * 20, angle);
    };
    Entity.MotherCell.prototype.onAdd = function () {
        self.nodesMother.push(this);
    };
    Entity.MotherCell.prototype.onRemove = function () {
        var index = self.nodesMother.indexOf(this);
        if (index != -1) {
            self.nodesMother.splice(index, 1);
        } else {
            Logger.error("Experimental.onServerInit.MotherVirus.onRemove: Tried to remove a non existing virus!");
        }
    };
};

LMS.prototype.onChange = function (gameServer) {
    // Remove all mother cells
    for (var i in this.nodesMother) {
        gameServer.removeNode(this.nodesMother[i]);
    }
    this.nodesMother = [];
    // Add back default functions
    Entity.Virus.prototype.onEat = require('../Entity/Virus').prototype.onEat;
    Entity.MotherCell.prototype.onAdd = require('../Entity/MotherCell').prototype.onAdd;
    Entity.MotherCell.prototype.onRemove = require('../Entity/MotherCell').prototype.onRemove;
};

LMS.prototype.onPlayerSpawn = function (gameServer, player) {
    // Only spawn players if LMS hasnt started yet
    if (StartofLMS == false) {
        player.setColor(gameServer.getRandomColor()); // Random color
        gameServer.spawnPlayer(player);
        }
    }
};
LMS.prototype.onCellRemove = function (cell) {
    var owner = cell.owner,
        human_just_died = false;
    
    if (owner.cells.length <= 0) {
        // Remove from contenders list
        var index = this.contenders.indexOf(owner);
        if (index != -1) {
            if ('_socket' in this.contenders[index].socket) {
                human_just_died = true;
            }
            this.contenders.splice(index, 1);
        }
        
        // Victory conditions
        var humans = 0;
        for (var i = 0; i < this.contenders.length; i++) {
            if ('_socket' in this.contenders[i].socket) {
                humans++;
            }
        }
        
        // the game is over if:
        // 1) there is only 1 player left, OR
        // 2) all the humans are dead, OR
        // 3) the last-but-one human just died
        if ((this.contenders.length == 1 || humans == 0 || (humans == 1 && human_just_died)) && this.gamePhase == 2) {
            this.endGame(cell.owner.gameServer);
        } else {
            // Do stuff
            this.onPlayerDeath(cell.owner.gameServer);
        }
    }
};
var LMSFunction = function (){

    StartofLMS = true;
    Logger.error("LMS HAS STARTED");
};

LMS.prototype.onPlayerDeath = function (gameServer){

};

LMS.prototype.onTick = function (gameServer) {
    // Mother Cell Spawning
    if (this.tickMotherSpawn >= this.motherSpawnInterval) {
        this.tickMotherSpawn = 0;
        this.spawnMotherCell(gameServer);
    } else {
        this.tickMotherSpawn++;
    }
    if (this.tickMotherUpdate >= this.motherUpdateInterval) {
        this.tickMotherUpdate = 0;
        for (var i = 0; i < this.nodesMother.length; i++) {
            this.nodesMother[i].onUpdate();
        }
    } else {
        this.tickMotherUpdate++;
    }
    var time = Math.floor((Math.Random() * 180000) + 60000); // 1 min - 3 min
    var interval = SetInterval(function() {LMSFunction()}, time); // 3600000 = 1 hour

};
