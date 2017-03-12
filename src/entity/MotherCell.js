var Cell = require('./Cell');
var Food = require('./Food');
var Virus = require('./Virus');

function MotherCell() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 2;
    this.isSpiked = true;
    this.isMotherCell = true;       // Not to confuse bots
    this.setColor({ r: 0xce, g: 0x63, b: 0x63 });
    this.motherCellMinSize = 149;   // vanilla 149 (mass = 149*149/100 = 222.01)
    this.motherCellSpawnAmount = 2;
    if (!this._size) {
        this.setSize(this.motherCellMinSize);
    }
}

module.exports = MotherCell;
MotherCell.prototype = new Cell();

// Main Functions
MotherCell.prototype.onEaten = Virus.prototype.onEaten; // Copies the virus prototype function

MotherCell.prototype.canEat = function (cell) {
    var maxMass = this.gameServer.config.motherCellMaxMass;
    if (maxMass && this._mass >= maxMass) return false;
    return cell.cellType == 0 ||  // can eat player cell
           cell.cellType == 2 ||  // can eat virus
           cell.cellType == 3;    // can eat ejected mass
};

MotherCell.prototype.onUpdate = function () {
    if (this._size <= this.motherCellMinSize) {
        return;
    }
    var maxFood = this.gameServer.config.foodMaxAmount;
    if (this.gameServer.nodesFood.length >= maxFood) {
        return;
    }
    var size1 = this._size;
    var size2 = this.gameServer.config.foodMinSize;
    for (var i = 0; i < this.motherCellSpawnAmount; i++) {
        size1 = Math.sqrt(size1 * size1 - size2 * size2);
        size1 = Math.max(size1, this.motherCellMinSize);
        this.setSize(size1);
        
        // Spawn food with size2
        var angle = Math.random() * 2 * Math.PI;
        var r = this._size;
        var pos = {
            x: this.position.x + r * Math.sin(angle),
            y: this.position.y + r * Math.cos(angle)
        };
        
        // Spawn food
        var food = new Food(this.gameServer, null, pos, size2);
        food.setColor(this.gameServer.getRandomColor());
        this.gameServer.addNode(food);
        
        // Eject to random distance
        food.setBoost(32 + 32 * Math.random(), angle);
        
        if (this.gameServer.nodesFood.length >= maxFood || size1 <= this.motherCellMinSize) {
            break;
        }
    }
    this.gameServer.updateNodeQuad(this);
};

MotherCell.prototype.onAdd = function () {
};

MotherCell.prototype.onRemove = function () {
};
