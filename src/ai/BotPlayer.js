const PlayerTracker = require('../PlayerTracker');
const Vec2 = require('../modules/Vec2');

const decideTypes = [
    function decidePlayer(node, cell) {
        // Same team, don't eat
        if (this.server.mode.haveTeams && cell.owner.team == node.owner.team)
            return 0;
        if (cell._size > node._size * 1.15) // Edible
            return node._size * 2.5;
        if (node._size > cell._size * 1.15) // Bigger, avoid
            return -node._size;
        return -(node._size / cell._size) / 3;
    },
    function decideFood(node, cell) { // Always edible
        return 1;
    },
    function decideEjected(node, cell) {
        if (cell._size > node._size * 1.15)
            return node._size;
        return 0;
    },
    function decideVirus(node, cell) {
        if (cell._size > node._size * 1.15) { // Edible
            if (this.cells.length == this.server.config.playerMaxCells) {
                // Reached cell limit, won't explode
                return node._size * 2.5;
            }
            // Will explode, avoid
            return -1;
        }
        if (node.isMotherCell && node._size > cell._size * 1.15) // Avoid mother cell if bigger than player
            return -1;
        return 0;
    }
];

class BotPlayer extends PlayerTracker {
    constructor(server, socket) {
        super(server, socket);
        this.influence = 0;
    }
    largest(list) {
        return list.reduce((largest, current) => {
            return current._size > largest._size ? current : largest;
        });
    }
    checkConnection() {
        // Respawn if bot is dead
        if (!this.cells.length)
            this.server.mode.onPlayerSpawn(this.server, this);
    }
    sendUpdate() {
        this.decide(this.largest(this.cells));
    }
    decide(cell) {
        if (!cell)
            return;

        const result = new Vec2(0, 0);

        for (const node of this.viewNodes) {
            if (node.owner == this)
                continue;

            // Make decisions
            this.influence = decideTypes[node.type].call(this, node, cell);

            // Conclude decisions
            // Apply this.influence if it isn't 0
            if (this.influence == 0)
                continue;

            // Calculate separation between cell and node
            const displacement = node.position.difference(cell.position);

            // Figure out distance between cells
            let distance = displacement.dist();

            if (this.influence < 0) // Get edge distance
                distance -= cell._size + node._size;

            // The farther they are the smaller influence it is
            if (distance < 1)
                distance = 1;

            this.influence /= distance;

            // Splitting conditions
            if (node.type != 1 && cell._size > node._size * 1.15 &&
                !this.splitCooldown && this.cells.length < 8 &&
                400 - cell._size / 2 - node._size >= distance) {
                // Splitkill the target
                this.splitCooldown = 15;
                this.mouse.assign(node.position);
                this.socket.packetHandler.pressSpace = true;
                return;
            } else {
                // Produce force vector exerted by this entity on the cell
                result.add(displacement.normalize().product(this.influence));
            }
        }

        // Set bot's mouse position
        this.mouse.assign(cell.position.sum(result.multiply(900)));
    }
}
module.exports = BotPlayer;
