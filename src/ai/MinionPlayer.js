var PlayerTracker = require('../PlayerTracker');

function MinionPlayer() {
    PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
    this.isMi = true;   // Marks as minion
    this.socket.isConnected = true;
}

module.exports = MinionPlayer;
MinionPlayer.prototype = new PlayerTracker();

MinionPlayer.prototype.checkConnection = function () {
    if (this.socket.isCloseRequest) {
        while (this.cells.length) {
            this.gameServer.removeNode(this.cells[0]);
        }
        this.isRemoved = true;
        return;
    }
    if (!this.cells.length) {
        this.gameServer.gameMode.onPlayerSpawn(this.gameServer, this);
        if (!this.cells.length) this.socket.close();
    }

    // remove if owner has disconnected or has no control
    if (this.owner.socket.isConnected == false || !this.owner.minionControl) 
        this.socket.close();

    // frozen or not
    if (this.owner.minionFrozen) this.frozen = true;
    else this.frozen = false;

    // split cells
    if (this.owner.minionSplit) 
        this.socket.packetHandler.pressSpace = true;

    // eject mass
    if (this.owner.minionEject)
        this.socket.packetHandler.pressW = true;

    // follow owners mouse by default
    this.mouse = this.owner.mouse;
    
    // pellet-collecting mode
    if (this.owner.collectPellets) {
	this.viewNodes = [];
	var self = this;
	this.viewBox = this.owner.viewBox;
	this.gameServer.quadTree.find(this.viewBox, function (quadItem) {
        if (quadItem.cell.cellType == 1)
            self.viewNodes.push(quadItem.cell);
        });
	var bestDistance = 8e4;
	for (var i in this.viewNodes) {
	    var cell = this.viewNodes[i];
	    var dx = this.cells[0].position.x - cell.position.x;
            var dy = this.cells[0].position.y - cell.position.y;
            if (dx * dx + dy * dy < bestDistance) {
                bestDistance = dx * dx + dy * dy;
                this.mouse = cell.position;
	    }
        }
    }
};
