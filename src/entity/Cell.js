var Vec2 = require('../modules/Vec2');

function Cell(gameServer, owner, position, size) {
    this.gameServer = gameServer;
    this.owner = owner;     // playerTracker that owns this cell
    
    this.color = { r: 0, g: 0, b: 0 };
    this.position;
    this._sizeSquared = 0;
    this._size = 0;
    this._mass = 0;
    this.cellType = -1;     // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
    this.isSpiked = false;  // If true, then this cell has spikes around it
    this.isAgitated = false;// If true, then this cell has waves on it's outline
    this.killedBy = null;   // Cell that ate this cell
    this.isMoving = false;  // Indicate that cell is in boosted mode
    this.boostDistance = 0;
    this.boostDirection = new Vec2(1, 0);
    
    if (this.gameServer) {
        this.tickOfBirth = this.gameServer.tickCounter;
        this.nodeId = this.gameServer.lastNodeId++ >> 0;
        if (size) this.setSize(size);
        if (position) this.position = new Vec2(position.x, position.y);
    }
}

module.exports = Cell;

// Fields not defined by the constructor are considered private and need a getter/setter to access from a different class

Cell.prototype.setColor = function (color) {
    this.color.r = color.r;
    this.color.g = color.g;
    this.color.b = color.b;
};

Cell.prototype.setSize = function (size) {
    this._size = size;
    this._sizeSquared = size * size;
    this._mass = this._sizeSquared / 100;
};

// by default cell cannot eat anyone
Cell.prototype.canEat = function (cell) {
    return false;
};

// Returns cell age in ticks for specified game tick
Cell.prototype.getAge = function () {
    return this.gameServer.tickCounter - this.tickOfBirth;
};

// Called to eat prey cell
Cell.prototype.onEat = function (prey) {
    if (!this.gameServer.config.playerBotGrow) {
        if (this._size >= 250 && prey._size <= 41 && prey.cellType == 0)
            prey._sizeSquared = 0; // Can't grow from players under 17 mass
    }
    this.setSize(Math.sqrt(this._sizeSquared + prey._sizeSquared));
};

Cell.prototype.setBoost = function (distance, angle) {
    this.boostDistance = distance;
    this.boostDirection = new Vec2(
        Math.sin(angle),
        Math.cos(angle)
    );
    this.isMoving = true;
    if (!this.owner) {
        var index = this.gameServer.movingNodes.indexOf(this);
        if (index < 0) this.gameServer.movingNodes.push(this);
    }
};

Cell.prototype.checkBorder = function (b) {
    var r = this._size / 2;
    if (this.position.x < b.minx + r || this.position.x > b.maxx - r) {
        this.boostDirection.scale(-1, 1); // reflect left-right
        this.position.x = Math.max(this.position.x, b.minx + r);
        this.position.x = Math.min(this.position.x, b.maxx - r);
    }
    if (this.position.y < b.miny + r || this.position.y > b.maxy - r) {
        this.boostDirection.scale(1, -1); // reflect up-down
        this.position.y = Math.max(this.position.y, b.miny + r);
        this.position.y = Math.min(this.position.y, b.maxy - r);
    }
};

Cell.prototype.onEaten = function (hunter) { };
Cell.prototype.onAdd = function (gameServer) { };
Cell.prototype.onRemove = function (gameServer) { };
