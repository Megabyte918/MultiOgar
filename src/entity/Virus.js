var Cell = require('./Cell');

function Virus() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    this.cellType = 2;
    this.isSpiked = true;
    this.isMotherCell = false; // Not to confuse bots
    this.setColor({ r: 0x33, g: 0xff, b: 0x33 });
}

module.exports = Virus;
Virus.prototype = new Cell();

// Main Functions

Virus.prototype.canEat = function (cell) {
    return cell.cellType == 3; // virus can eat ejected mass only
};

Virus.prototype.onEat = function (prey) {
    // Called to eat prey cell
    this.setSize(Math.sqrt(this._sizeSquared + prey._sizeSquared));
    
    if (this._size >= this.gameServer.config.virusMaxSize) {
        this.setSize(this.gameServer.config.virusMinSize); // Reset mass
        this.gameServer.shootVirus(this, prey.boostDirection.angle);
    }
};

Virus.prototype.onEaten = function (c) {
    if (c.owner == null) return;

    var minSize = this.gameServer.config.playerMinSize,
    min = (minSize == 32) ? 30 : minSize, // minimun size of small splits
    cellsLeft = this.gameServer.config.playerMaxCells - c.owner.cells.length,
    numSplits = cellsLeft < (c._mass / 16) ? cellsLeft : (c._mass / 16),
    splitMass = (c._mass / numSplits) < min ? (c._mass / numSplits) : min;
    
    // Diverse explosion(s)
    var big = [];
    if (numSplits <= 0) return; // can't split anymore
    if (numSplits == 1) big = [c._mass/2];
    else if (numSplits == 2) big = [c._mass/4,c._mass/4];
    else if (numSplits == 3) big = [c._mass/4,c._mass/4,c._mass/7];
    else if (numSplits == 4) big = [c._mass/5,c._mass/7,c._mass/8,c._mass/10];
    else {
        // ckeck size of exploding
        var threshold = c._mass - numSplits * splitMass; 
        // Monotone explosion(s)
        if (threshold > 466) {
            // virus explosion multipliers
            var exp = (Math.random() * (4 - 3)) + 3; 
            while (threshold / exp > 24) {
                threshold /= exp;
                exp = (Math.random() * (3 - 2)) + 2;
                big.push(threshold >> 0);
            }
        }
    }
    numSplits -= big.length;
    // big splits
    var angle = 0;
    for (var k = 0; k < big.length; k++) {
        angle = 2 * Math.PI * Math.random(); // random directions
        this.gameServer.splitPlayerCell(c.owner, c, angle, big[k]);
    }
    // small splits
    for (var k = 0; k < numSplits; k++) {
        angle = 2 * Math.PI * Math.random(); // random directions
        this.gameServer.splitPlayerCell(c.owner, c, angle, min);
    }
};

Virus.prototype.onAdd = function (gameServer) {
    gameServer.nodesVirus.push(this);
};

Virus.prototype.onRemove = function (gameServer) {
    var index = gameServer.nodesVirus.indexOf(this);
    if (index != -1) 
        gameServer.nodesVirus.splice(index, 1);
};
