var Cell = require('./Cell');

function PlayerCell() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 0;
    this._speed = null;
    this._canRemerge = false;
}

module.exports = PlayerCell;
PlayerCell.prototype = new Cell();

// Main Functions

PlayerCell.prototype.updateRemerge = function () {
    var age = this.getAge(this.gameServer.tickCounter);
    var r = this.gameServer.config.playerRecombineTime;
    var ttr = Math.max(r, (this._size * 0.2) >> 0); // seconds
    if (age < 15) this._canRemerge = false;
    if (r == 0 || this.owner.rec) {
        // instant merge
        this._canRemerge = this.boostDistance < 100;
        return;
    }
    // seconds to ticks (tickStep = 0.040 sec => 1 / 0.040 = 25)
    ttr *= 25;
    this._canRemerge = age >= ttr;
};

PlayerCell.prototype.canEat = function (cell) {
    return true; // player cell can eat anyone
};

// Movement
PlayerCell.prototype.moveUser = function (border) {
    if (this.owner.socket.isConnected === false || 
        this.owner == null || this.owner.frozen) {
        return;
    }
    var x = this.owner.mouse.x;
    var y = this.owner.mouse.y;
    if (isNaN(x) || isNaN(y)) {
        return;
    }
    var dx = ~~(x - this.position.x);
    var dy = ~~(y - this.position.y);
    var squared = dx * dx + dy * dy;
    if (squared < 1) return;
    
    // distance, normal
    var d = Math.sqrt(squared);
    var nx = dx * (1 / d);
    var ny = dy * (1 / d);
    
    // normalized distance (0..1)
    d = Math.min(d, 64) / 32;
    var speed = this.getSpeed() * d;
    if (speed <= 0) return;
    
    this.position.x += nx * speed;
    this.position.y += ny * speed;
    this.checkBorder(border);
};

PlayerCell.prototype.getSpeed = function () {
    var speed = 2.1106 / Math.pow(this._size, 0.449);
    // tickStep = 40ms
    this._speed = (this.owner.customspeed > 0) ? 
    speed * 40 * this.owner.customspeed : // Set by command
    speed * 40 * this.gameServer.config.playerSpeed / 2;
    return this._speed;
};

PlayerCell.prototype.onAdd = function (gameServer) {
    // Gamemode actions
    gameServer.gameMode.onCellAdd(this);
};

PlayerCell.prototype.onRemove = function (gameServer) {
    // Remove from player cell list
    var index = this.owner.cells.indexOf(this);
    if (index != -1) {
        this.owner.cells.splice(index, 1);
    }
    // Gamemode actions
    gameServer.gameMode.onCellRemove(this);
};
