// An object representing a 2D vector.
// Based on the Vector2 class from LibGDX.
// Written by Rahat Ahmed (http://rahatah.me/d).

function Vec2(x, y) {
    this.x = x;
    this.y = y;
}

Vec2.prototype.add = function(d, m) {
    this.x += d.x * m;
    this.y += d.y * m;
    return this;
}

Vec2.prototype.sub = function(x, y) {
    if (x instanceof Vec2) {
        this.x -= x.x;
        this.y -= x.y;
    } else {
        this.x -= x;
        this.y -= y;
    }
    return this;
};

Vec2.prototype.sub2 = function(d, m) {
    this.x -= d.x * m;
    this.y -= d.y * m;
    return this;
};

Vec2.prototype.angle = function() {
    return Math.atan2(this.x, this.y);
};

Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
};

Vec2.prototype.dist = function() {
    return ~~this.x * ~~this.x + ~~this.y * ~~this.y;
};

Vec2.prototype.sqDist = function() {
    return Math.sqrt(this.dist());
};

Vec2.prototype.normalize = function() {
    return this.scale(1/this.sqDist());
};

Vec2.prototype.scale = function(scaleX, scaleY) {
    this.x *= scaleX;
    this.y *= scaleY || scaleX;
    return this;
};

module.exports = Vec2;
