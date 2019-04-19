const Cell = require('./Cell');
const Food = require('./Food');
const Virus = require('./Virus');

class MotherCell extends Virus {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.onEat = Cell.prototype.onEat;
        
        this.type = 2;
        this.isVirus = true;
        this.isMotherCell = true;
        this.color = {
            r: 0xce,
            g: 0x63,
            b: 0x63
        };

        this.motherCellMinSize = 149;
        this.motherCellSpawnAmount = 2;

        if (!this._size) {
            this.setSize(this.motherCellMinSize);
        };
    };

    canEat(cell) {
        const maxMass = this.server.config.motherCellMaxMass;
        if (maxMass && this._mass >= maxMass)
            return false;
        return cell.type == 0 || // can eat player cell
            cell.type == 2 || // can eat virus
            cell.type == 3; // can eat ejected mass
    };
        
    onUpdate() {
        if (this._size == this.motherCellMinSize) {
            return;
        };

        let size1 = this._size;
        let size2 = this.server.config.foodMinSize;
        for (let i = 0; i < this.motherCellSpawnAmount; i++) {
            size1 = Math.sqrt(size1 * size1 - (size2 * size2) * 2);
            size1 = Math.max(size1, this.motherCellMinSize);
            this.setSize(size1);

            // Spawn food with size2
            const angle = Math.random() * 2 * Math.PI;
            const pos = {x: this.position.x + size1 * Math.sin(angle), y: this.position.y + size1 * Math.cos(angle)};

            // Spawn food
            const food = new Food(this.server, null, pos, size2);
            food.color = this.server.getRandomColor();
            food.overrideReuse = true;
            this.server.addNode(food);

            // Eject to random distance
            food.setBoost(32 + 42 * Math.random(), angle);
        };

        this.server.updateNodeQuad(this);
    };
};

module.exports = MotherCell;