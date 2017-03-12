var PlayerTracker = require('../PlayerTracker');
var Vec2 = require('../modules/Vec2');

function BotPlayer() {
    PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
    this.splitCooldown = 0;
}
module.exports = BotPlayer;
BotPlayer.prototype = new PlayerTracker();


BotPlayer.prototype.largest = function (list) {
    // Sort the cells by Array.sort() function to avoid errors
    var sorted = list.valueOf();
    sorted.sort(function (a, b) {
        return b._size - a._size;
    });
    return sorted[0];
};

BotPlayer.prototype.checkConnection = function () {
    if (this.socket.isCloseRequest) {
        while (this.cells.length) {
            this.gameServer.removeNode(this.cells[0]);
        }
        this.isRemoved = true;
        return;
    }
    // Respawn if bot is dead
    if (!this.cells.length)
        this.gameServer.gameMode.onPlayerSpawn(this.gameServer, this);
};

BotPlayer.prototype.sendUpdate = function () {
    if (this.splitCooldown) this.splitCooldown--;
    this.decide(this.largest(this.cells)); // Action
};

// Custom
BotPlayer.prototype.decide = function (cell) {
    if (!cell) return; // Cell was eaten, check in the next tick (I'm too lazy)
    var result = new Vec2(0, 0); // For splitting
    
    for (var i = 0; i < this.viewNodes.length; i++) {
        var check = this.viewNodes[i];
        if (check.owner == this) continue;
        
        // Get attraction of the cells - avoid larger cells, viruses and same team cells
        var influence = 0;
        if (check.cellType == 0) {
            // Player cell
            if (this.gameServer.gameMode.haveTeams && cell.owner.team == check.owner.team) {
                // Same team cell
                influence = 0;
            } else if (cell._size > check._size * 1.15) {
                // Can eat it
                influence = check._size * 2.5;
            } else if (check._size > cell._size * 1.15) {
                // Can eat me
                influence = -check._size;
            } else {
                influence = -(check._size / cell._size) / 3;
            }
        } else if (check.cellType == 1) {
            // Food
            influence = 1;
        } else if (check.cellType == 2) {
            // Virus/Mothercell
            if (cell._size > check._size * 1.15) {
                // Can eat it
                if (this.cells.length == this.gameServer.config.playerMaxCells) {
                    // Won't explode
                    influence = check._size * 2.5;
                } else {
                    // Can explode
                    influence = -1;
                }
            } else if (check.isMotherCell && check._size > cell._size * 1.15) {
                // can eat me
                influence = -1;
            }
        } else if (check.cellType == 3) {
            // Ejected mass
            if (cell._size > check._size * 1.15)
                // can eat
                influence = check._size;
        }
        
        // Apply influence if it isn't 0
        if (influence == 0) continue;
        
        // Calculate separation between cell and check
        var displacement = new Vec2(check.position.x - cell.position.x, check.position.y - cell.position.y);
        
        // Figure out distance between cells
        var distance = displacement.sqDist();
        if (influence < 0) {
            // Get edge distance
            distance -= cell._size + check._size;
        }
        
        // The farther they are the smaller influnce it is
        if (distance < 1) distance = 1; // Avoid NaN and positive influence with negative distance & attraction
        influence /= distance;
        
        // Splitting conditions
        if (check.cellType == 0 && cell._size > check._size * 1.15
            && !this.splitCooldown && this.cells.length < 8 && 
            820 - cell._size / 2 - check._size >= distance) {
            // Splitkill the target
            this.splitCooldown = 15;
            this.mouse = check.position.clone();
            this.socket.packetHandler.pressSpace = true;
            return;
        } else
            // Produce force vector exerted by this entity on the cell
            result.add(displacement.normalize(), influence);
    }
    // Set bot's mouse position
    this.mouse = new Vec2(
        cell.position.x + result.x * 800,
        cell.position.y + result.y * 800
    );
};
