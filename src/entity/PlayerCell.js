var Cell = require('./Cell');
var Packet = require('../packet');

function PlayerCell() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    this.cellType = 0;
    this._canRemerge = false;
}

module.exports = PlayerCell;
PlayerCell.prototype = new Cell();

// Main Functions

PlayerCell.prototype.canEat = function (cell) {
    return true; // player cell can eat anyone
};

PlayerCell.prototype.getSpeed = function (dist) {
    var speed = 2.2 * Math.pow(this._size, -0.439);
    speed *= 40 * this.gameServer.config.playerSpeed;
    return Math.min(dist, speed) / dist;
};

PlayerCell.prototype.onAdd = function (gameServer) {
    // Add to player nodes list
    this.color = this.owner.color;
    this.owner.cells.push(this);
    this.owner.socket.packetHandler.sendPacket(new Packet.AddNode(this.owner, this));
    this.gameServer.nodesPlayer.unshift(this);
    // Gamemode actions
    gameServer.gameMode.onCellAdd(this);
};

PlayerCell.prototype.onRemove = function (gameServer) {
    // Remove from player cell list
    var index = this.owner.cells.indexOf(this);
    if (index != -1) this.owner.cells.splice(index, 1);

    index = this.gameServer.nodesPlayer.indexOf(this);
    if (index != -1) this.gameServer.nodesPlayer.splice(index, 1);
    // Gamemode actions
    gameServer.gameMode.onCellRemove(this);
};
