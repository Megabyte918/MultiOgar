var Cell = require('./Cell');

function Virus() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    this.cellType = 2;
    this.isSpiked = true;
    this.isMotherCell = false; // Not to confuse bots
    this.color = {
        r: 0x33,
        g: 0xff,
        b: 0x33
    };
}

module.exports = Virus;
Virus.prototype = new Cell();

// Main Functions

Virus.prototype.canEat = function(cell) {
    // cannot eat if virusMaxAmount is reached
    if (this.gameServer.nodesVirus.length < this.gameServer.config.virusMaxAmount)
        return cell.cellType == 3; // virus can eat ejected mass only
};

Virus.prototype.onEat = function(prey) {
    // Called to eat prey cell
    this.setSize(Math.sqrt(this.radius + prey.radius));

    if (this._size >= this.gameServer.config.virusMaxSize) {
        this.setSize(this.gameServer.config.virusMinSize); // Reset mass
        this.gameServer.shootVirus(this, prey.boostDirection.angle());
    }
};

Virus.prototype.onEaten = function(cell) {
    if (!cell.owner) return;
    var config = this.gameServer.config;

    var cellsLeft = (config.virusMaxCells || config.playerMaxCells) - cell.owner.cells.length;
    if (cellsLeft <= 0) return;
    var splitMin = config.virusMaxPoppedSize * config.virusMaxPoppedSize / 100;
    var cellMass = cell._mass, splits = [], splitCount, splitMass;

    if (config.virusEqualPopSize) {
        // definite monotone splits
        splitCount = Math.min(~~(cellMass / splitMin), cellsLeft);
        splitMass = cellMass / (1 + splitCount);
        for (var i = 0; i < splitCount; i++)
            splits.push(splitMass);
        return this.explodeCell(cell, splits);
    }

    if (cellMass / cellsLeft < splitMin) {
        // powers of 2 monotone splits
        splitCount = 2;
        splitMass = cellMass / splitCount;
        while (splitMass > splitMin && splitCount * 2 < cellsLeft)
            splitMass = cellMass / (splitCount *= 2);
        splitMass = cellMass / (splitCount + 1);
        while (splitCount-- > 0) splits.push(splitMass);
        return this.explodeCell(cell, splits);
    }

    // half-half splits
    var splitMass = cellMass / 2;
    var massLeft = cellMass / 2;
    while (cellsLeft-- > 0) {
        if (massLeft / cellsLeft < splitMin) {
            splitMass = massLeft / cellsLeft;
            while (cellsLeft-- > 0) splits.push(splitMass);
        }
        while (splitMass >= massLeft && cellsLeft > 0)
            splitMass /= 2;
        splits.push(splitMass);
        massLeft -= splitMass;
    }
    this.explodeCell(cell, splits);
};

Virus.prototype.explodeCell = function(cell, splits) {
    for (var i = 0; i < splits.length; i++)
        this.gameServer.splitPlayerCell(cell.owner, cell, 2 * Math.PI * Math.random(), splits[i]);
};

Virus.prototype.onAdd = function(gameServer) {
    gameServer.nodesVirus.push(this);
};

Virus.prototype.onRemove = function(gameServer) {
    var index = gameServer.nodesVirus.indexOf(this);
    if (index != -1)
        gameServer.nodesVirus.splice(index, 1);
};
