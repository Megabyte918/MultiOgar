var Tournament = require('./Tournament');
var Entity = require('../entity');

function HungerGames() {
    Tournament.apply(this, Array.prototype.slice.call(arguments));
    
    this.ID = 5;
    this.name = "Hunger Games";
    
    // Gamemode Specific Variables
    this.maxContenders = 12;
    this.baseSpawnPoints = [
        // Right side of map
        {x: 4950,y:-2500},
        {x: 4950,y:    0},
        {x: 4950,y: 2500},
        // Left side of map
        {x:-4950,y:-2500},
        {x:-4950,y:    0},
        {x:-4950,y: 2500},
        // Top of map
        {x:-2500,y: 4950},
        {x:    0,y: 4950},
        {x: 2500,y: 4950},
        // Bottom of map
        {x:-2500,y:-4950},
        {x:    0,y:-4950},
        {x: 2500,y:-4950},
    ];
    this.contenderSpawnPoints;
    this.borderDec = 100; // Border shrinks by this size everytime someone dies
}

module.exports = HungerGames;
HungerGames.prototype = new Tournament();

// Gamemode Specific Functions

HungerGames.prototype.getPos = function () {
    var pos = {
        x: 0,
        y: 0
    };
    
    // Random Position
    if (this.contenderSpawnPoints.length > 0) {
        var index = Math.floor(Math.random() * this.contenderSpawnPoints.length);
        pos = this.contenderSpawnPoints[index];
        this.contenderSpawnPoints.splice(index, 1);
    }
    
    return {
        x: pos.x,
        y: pos.y
    };
};

HungerGames.prototype.spawnFood = function (gameServer, mass, pos) {
    var cell = new Entity.Food(gameServer, null, pos, mass);
    cell.color = gameServer.getRandomColor();
    gameServer.addNode(cell);
};

HungerGames.prototype.spawnVirus = function (gameServer, pos) {
    var v = new Entity.Virus(gameServer, null, pos, gameServer.config.virusMinSize);
    gameServer.addNode(v);
};

HungerGames.prototype.onPlayerDeath = function (gameServer) {
    gameServer.setBorder(
        gameServer.border.width - this.borderDec * 2, 
        gameServer.border.height - this.borderDec * 2
    );
    
    // Remove all cells
    var len = gameServer.nodes.length;
    for (var i = 0; i < len; i++) {
        var node = gameServer.nodes[i];
        
        if ((!node) || (node.cellType == 0)) {
            continue;
        }
        
        // Move
        if (node.position.x < gameServer.border.minx) {
            gameServer.removeNode(node);
            i--;
        } else if (node.position.x > gameServer.border.maxx) {
            gameServer.removeNode(node);
            i--;
        } else if (node.position.y < gameServer.border.miny) {
            gameServer.removeNode(node);
            i--;
        } else if (node.position.y > gameServer.border.maxy) {
            gameServer.removeNode(node);
            i--;
        }
    }
};

// Override

HungerGames.prototype.onServerInit = function (gameServer) {
    // Prepare
    this.prepare(gameServer);
    
    // Resets spawn points
    this.contenderSpawnPoints = this.baseSpawnPoints.slice();
    
    // Override config values
    if (gameServer.config.serverBots > this.maxContenders) {
        // The number of bots cannot exceed the maximum amount of contenders
        gameServer.config.serverBots = this.maxContenders;
    }
    gameServer.config.spawnInterval = 20;
    gameServer.config.borderWidth = 3200;
    gameServer.config.borderHeight = 3200;
    gameServer.config.foodSpawnAmount = 5; // This is hunger games
    gameServer.config.foodMinAmount = 100;
    gameServer.config.foodMaxAmount = 200;
    gameServer.config.foodMinSize = 10; // Food is scarce, but its worth more
    gameServer.config.virusMinAmount = 10; // We need to spawn some viruses in case someone eats them all
    gameServer.config.virusMaxAmount = 100;
    gameServer.config.ejectSpawnPlayer = 0;
    gameServer.config.playerDisconnectTime = 10; // So that people dont disconnect and stall the game for too long
    gameServer.setBorder(
        gameServer.border.width,
        gameServer.border.height
    );
    // 200 mass food
    this.spawnFood(gameServer,200,{x: 0, y: 0});
    // 80 mass food
    this.spawnFood(gameServer,90,{x:  810, y: 810});
    this.spawnFood(gameServer,90,{x:  810, y:-810});
    this.spawnFood(gameServer,90,{x: -810, y: 810});
    this.spawnFood(gameServer,90,{x: -810, y:-810});
    // 50 mass food
    this.spawnFood(gameServer,71,{x:   0, y: 1620});
    this.spawnFood(gameServer,71,{x:   0, y:-1620});
    this.spawnFood(gameServer,71,{x: 1620, y:   0});
    this.spawnFood(gameServer,71,{x:-1620, y:   0});
    // 30 mass food
    this.spawnFood(gameServer,55,{x: 1620, y: 810});
    this.spawnFood(gameServer,55,{x: 1620, y:-810});
    this.spawnFood(gameServer,55,{x:-1620, y: 810});
    this.spawnFood(gameServer,55,{x:-1620, y:-810});
    this.spawnFood(gameServer,55,{x: 810, y: 1620});
    this.spawnFood(gameServer,55,{x: 810, y:-1620});
    this.spawnFood(gameServer,55,{x:-810, y: 1620});
    this.spawnFood(gameServer,55,{x:-810, y:-1620});
    // Viruses
    this.spawnVirus(gameServer,{x:     0, y: 810});
    this.spawnVirus(gameServer,{x:     0, y:-810});
    this.spawnVirus(gameServer,{x:   810, y:   0});
    this.spawnVirus(gameServer,{x:  -810, y:   0});
    this.spawnVirus(gameServer,{x: 1620, y: 1620});
    this.spawnVirus(gameServer,{x: 1620, y:-1620});
    this.spawnVirus(gameServer,{x:-1620, y: 1620});
    this.spawnVirus(gameServer,{x:-1620, y:-1620});
    this.spawnVirus(gameServer,{x:  810, y: 2430});
    this.spawnVirus(gameServer,{x:  810, y:-2430});
    this.spawnVirus(gameServer,{x: -810, y:-2430});
    this.spawnVirus(gameServer,{x: -810, y: 2430});
    this.spawnVirus(gameServer,{x:  2430, y: 810});
    this.spawnVirus(gameServer,{x:  2430, y:-810});
    this.spawnVirus(gameServer,{x: -2430, y:-810});
    this.spawnVirus(gameServer,{x: -2430, y: 810});
};

HungerGames.prototype.onPlayerSpawn = function (gameServer, player) {
    // Only spawn players if the game hasnt started yet
    if ((this.gamePhase == 0) && (this.contenders.length < this.maxContenders)) {
        player.color = gameServer.getRandomColor(); // Random color
        this.contenders.push(player); // Add to contenders list
        gameServer.spawnPlayer(player, this.getPos());
        
        if (this.contenders.length == this.maxContenders) {
            // Start the game once there is enough players
            this.startGamePrep(gameServer);
        }
    }
};
