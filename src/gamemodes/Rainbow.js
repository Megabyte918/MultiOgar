var FFA = require('./FFA'); // Base gamemode

function Rainbow() {
    FFA.apply(this, Array.prototype.slice.call(arguments));

    this.ID = 3;
    this.name = "Rainbow FFA";
    this.specByLeaderboard = true;
    this.speed = 1; // Speed of color change
    this.colors = [
        {'r':255, 'g':  0, 'b':  0}, // Red
        {'r':255, 'g': 32, 'b':  0},
        {'r':255, 'g': 64, 'b':  0},
        {'r':255, 'g': 96, 'b':  0},
        {'r':255, 'g':128, 'b':  0}, // Orange
        {'r':255, 'g':160, 'b':  0},
        {'r':255, 'g':192, 'b':  0},
        {'r':255, 'g':224, 'b':  0},
        {'r':255, 'g':255, 'b':  0}, // Yellow
        {'r':192, 'g':255, 'b':  0},
        {'r':128, 'g':255, 'b':  0},
        {'r': 64, 'g':255, 'b':  0},
        {'r':  0, 'g':255, 'b':  0}, // Green
        {'r':  0, 'g':192, 'b': 64},
        {'r':  0, 'g':128, 'b':128},
        {'r':  0, 'g': 64, 'b':192},
        {'r':  0, 'g':  0, 'b':255}, // Blue
        {'r': 18, 'g':  0, 'b':192},
        {'r': 37, 'g':  0, 'b':128},
        {'r': 56, 'g':  0, 'b': 64},
        {'r': 75, 'g':  0, 'b':130}, // Indigo
        {'r': 92, 'g':  0, 'b':161},
        {'r':109, 'g':  0, 'b':192},
        {'r':126, 'g':  0, 'b':223},
        {'r':143, 'g':  0, 'b':255}, // Purple
        {'r':171, 'g':  0, 'b':192},
        {'r':199, 'g':  0, 'b':128},
        {'r':227, 'g':  0, 'b': 64},
    ];
}

module.exports = Rainbow;
Rainbow.prototype = new FFA();

// Gamemode Specific Functions

Rainbow.prototype.changeColor = function (node, gameServer) {
    node.color = this.colors[Math.floor(Math.random() * this.colors.length)]
};

// Override

Rainbow.prototype.onServerInit = function () {};

Rainbow.prototype.onTick = function (gameServer) {
    // Change color
    for (var i in gameServer.nodes) {
        var node = gameServer.nodes[i];
        if (!node) continue;
        this.changeColor(node, gameServer);
    };
};