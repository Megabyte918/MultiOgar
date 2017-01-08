var Cell = require('./Cell');

function FakeMinion() {
    Cell.apply(this, Array.prototype.slice.call(arguments));
    
    this.cellType = 4;
}

module.exports = FakeMinion;
FakeMinion.prototype = new Cell();
