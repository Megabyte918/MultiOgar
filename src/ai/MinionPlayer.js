const PlayerTracker = require('../PlayerTracker');

class MinionPlayer extends PlayerTracker {
    constructor(server, socket, owner) {
        super(server, socket);
        this.owner = owner;
        this.isMi = true;
        this.socket.isConnected = true;
    };

    checkConnection() {
        if(this.socket.isCloseRequest) {
            while(this.cells.length)
                this.server.removeNode(this.cells[0]);

            return this.isRemoved = true;
        };

        if(!this.cells.length && this.owner.hasMinions) {
            return this.server.mode.onPlayerSpawn(this.server, this);
        } else if (!this.owner.hasMinions){
            this.socket.isCloseRequest = true;
        };

        if(!this.owner.socket.isConnected) {
            return this.socket.close();
        };

        this.frozen = this.owner.minionFrozen;

        this.socket.packetHandler.pressSpace = this.owner.minionSplit;
        this.socket.packetHandler.pressW = this.owner.minionEject;

        this.mouse = this.owner.mouse;
    };
};

module.exports = MinionPlayer;
