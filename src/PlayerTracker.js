var Packet = require('./packet');
var Vec2 = require('./modules/Vec2');
var BinaryWriter = require("./packet/BinaryWriter");
var {Quad} = require("./modules/QuadNode.js");

class PlayerTracker {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.pID = -1;
        this.userAuth = null;
        this.isRemoved = false;
        this.isCloseRequested = false;
        this._name = "An unnamed cell";
        this._skin = "";
        this._nameUtf8 = null;
        this._skinUtf8protocol11 = null;
        this._nameUnicode = null;
        this._skinUtf8 = null;
        this.color = { r: 0, g: 0, b: 0 };
        this.viewNodes = [];
        this.clientNodes = [];
        this.cells = [];
        this.mergeOverride = false; // Triggered by console command
        this._score = 0; // Needed for leaderboard
        this._scale = 1;
        this.borderCounter = 0;
        this.connectedTime = new Date();
        this.tickLeaderboard = 0;
        this.team = 0;
        this.spectate = false;
        this.freeRoam = false; // Free-roam mode enables player to move in spectate mode
        this.spectateTarget = null; // Spectate target, null for largest player
        this.lastKeypressTick = 0;
        this.centerPos = new Vec2(0, 0);
        this.mouse = new Vec2(0, 0);
        this.viewBox = new Quad(0, 0, 0, 0);
        // Scramble the coordinate system for anti-raga
        this.scrambleX = 0;
        this.scrambleY = 0;
        this.scrambleId = 0;
        this.isMinion = false;
        this.isMuted = false;
        // Custom commands
        this.spawnmass = 0;
        this.frozen = false;
        this.customspeed = 0;
        this.rec = false;
        // Minions
        this.miQ = false;
        this.isMi = false;
        this.minionSplit = false;
        this.minionEject = false;
        this.minionFrozen = false;
        this.hasMinions = server.config.serverMinions > 0;
        // Gamemode function
        if (server) {
            // Player id
            this.pID = server.lastPlayerId++ >> 0;
            // Gamemode function
            server.mode.onPlayerInit(this);
            // Only scramble if enabled in config
            this.scramble();
        }
        var UserRoleEnum = require("./enum/UserRoleEnum");
        this.userRole = UserRoleEnum.GUEST;
    }
    // Setters/Getters
    scramble() {
        if (!this.server.config.serverScrambleLevel) {
            this.scrambleId = 0;
            this.scrambleX = 0;
            this.scrambleY = 0;
        }
        else {
            this.scrambleId = (Math.random() * 0xFFFFFFFF) >>> 0;
            // avoid mouse packet limitations
            var maxx = Math.max(0, 31767 - this.server.border.width);
            var maxy = Math.max(0, 31767 - this.server.border.height);
            var x = maxx * Math.random();
            var y = maxy * Math.random();
            if (Math.random() >= 0.5)
                x = -x;
            if (Math.random() >= 0.5)
                y = -y;
            this.scrambleX = x;
            this.scrambleY = y;
        }
        this.borderCounter = 0;
    }
    setName(name) {
        this._name = name;
        var writer = new BinaryWriter();
        writer.writeStringZeroUnicode(name);
        this._nameUnicode = writer.toBuffer();
        writer = new BinaryWriter();
        writer.writeStringZeroUtf8(name);
        this._nameUtf8 = writer.toBuffer();
    }
    setSkin(skin) {
        this._skin = skin;
        var writer = new BinaryWriter();
        writer.writeStringZeroUtf8(skin);
        this._skinUtf8 = writer.toBuffer();
        var writer1 = new BinaryWriter();
        writer1.writeStringZeroUtf8("%" + skin);
        this._skinUtf8protocol11 = writer1.toBuffer();
    }
    getScale() {
        this._score = 0; // reset to not cause bugs with leaderboard
        var scale = 0; // reset to not cause bugs with viewbox
        for (var i = 0; i < this.cells.length; i++) {
            scale += this.cells[i]._size;
            this._score += this.cells[i]._mass;
        }
        if (!scale)
            return scale = this._score = 0.4; // reset scale
        else
            return this._scale = Math.pow(Math.min(64 / scale, 1), 0.4);
    }
    joinGame(name, skin) {
        if (this.cells.length)
            return;
        if (skin)
            this.setSkin(skin);
        if (!name)
            name = "An unnamed cell";
        this.setName(name);
        this.spectate = false;
        this.freeRoam = false;
        this.spectateTarget = null;
        var packetHandler = this.socket.packetHandler;
        if (!this.isMi && this.socket.isConnected != null) {
            // some old clients don't understand ClearAll message
            // so we will send update for them
            if (packetHandler.protocol < 6) {
                packetHandler.sendPacket(new Packet.UpdateNodes(this, [], [], [], this.clientNodes));
            }
            packetHandler.sendPacket(new Packet.ClearAll());
            this.clientNodes = [];
            this.scramble();
            if (this.server.config.serverScrambleLevel < 2) {
                // no scramble / lightweight scramble
                packetHandler.sendPacket(new Packet.SetBorder(this, this.server.border));
            }
            else if (this.server.config.serverScrambleLevel == 3) {
                var ran = 10065536 * Math.random();
                // Ruins most known minimaps (no border)
                var border = new Quad(
                    this.server.border.minx - ran,
                    this.server.border.miny - ran,
                    this.server.border.maxx + ran,
                    this.server.border.maxy + ran
                );
                packetHandler.sendPacket(new Packet.SetBorder(this, border));
            }
        }
        this.server.mode.onPlayerSpawn(this.server, this);
    }
    checkConnection() {
        // Handle disconnection
        if (!this.socket.isConnected) {
            // Wait for playerDisconnectTime
            var pt = this.server.config.playerDisconnectTime;
            var dt = (this.server.stepDateTime - this.socket.closeTime) / 1e3;
            if (pt && (!this.cells.length || dt >= pt)) {
                // Remove all client cells
                while (this.cells.length)
                    this.server.removeNode(this.cells[0]);
            }
            this.cells = [];
            this.isRemoved = true;
            this.mouse = null;
            this.socket.packetHandler.pressSpace = false;
            this.socket.packetHandler.pressQ = false;
            this.socket.packetHandler.pressW = false;
            return;
        }
        // Check timeout
        if (!this.isCloseRequested && this.server.config.serverTimeout) {
            dt = (this.server.stepDateTime - this.socket.lastAliveTime) / 1000;
            if (dt >= this.server.config.serverTimeout) {
                this.socket.close(1000, "Connection timeout");
                this.isCloseRequested = true;
            }
        }
    }
    updateTick() {
        if (this.isRemoved || this.isMinion)
            return; // do not update
        this.socket.packetHandler.process();
        if (this.isMi)
            return;
        // update viewbox
        this.updateSpecView(this.cells.length);
        var scale = Math.max(this.getScale(), this.server.config.serverMinScale);
        var halfWidth = (this.server.config.serverViewBaseX + 100) / scale / 2;
        var halfHeight = (this.server.config.serverViewBaseY + 100) / scale / 2;
        this.viewBox = new Quad(
            this.centerPos.x - halfWidth,
            this.centerPos.y - halfHeight,
            this.centerPos.x + halfWidth,
            this.centerPos.y + halfHeight
        );
        // update visible nodes
        this.viewNodes = [];
        var self = this;
        this.server.quadTree.find(this.viewBox, function (check) {
            self.viewNodes.push(check);
        });
        this.viewNodes.sort(function (a, b) { return a.nodeId - b.nodeId; });
    }
    sendUpdate() {
        if (this.isRemoved || !this.socket.packetHandler.protocol ||
            !this.socket.isConnected || this.isMi || this.isMinion ||
            (this.socket._socket.writable != null && !this.socket._socket.writable) ||
            this.socket.readyState != this.socket.OPEN) {
            // do not send update for disconnected clients
            // also do not send if initialization is not complete yet
            return;
        }
        var packetHandler = this.socket.packetHandler;
        if (this.server.config.serverScrambleLevel == 2) {
            // scramble (moving border)
            if (!this.borderCounter) {
                var b = this.server.border, v = this.viewBox;
                var bound = new Quad(
                    Math.max(b.minx, v.minx - v.halfWidth),
                    Math.max(b.miny, v.miny - v.halfHeight),
                    Math.min(b.maxx, v.maxx + v.halfWidth),
                    Math.min(b.maxy, v.maxy + v.halfHeight)
                );
                packetHandler.sendPacket(new Packet.SetBorder(this, bound));
            }
            if (++this.borderCounter >= 20)
                this.borderCounter = 0;
        }
        var delNodes = [];
        var eatNodes = [];
        var addNodes = [];
        var updNodes = [];
        var oldIndex = 0;
        var newIndex = 0;
        for (; newIndex < this.viewNodes.length && oldIndex < this.clientNodes.length;) {
            if (this.viewNodes[newIndex].nodeId < this.clientNodes[oldIndex].nodeId) {
                if (this.viewNodes[newIndex].isRemoved)
                    continue;
                addNodes.push(this.viewNodes[newIndex]);
                newIndex++;
                continue;
            }
            if (this.viewNodes[newIndex].nodeId > this.clientNodes[oldIndex].nodeId) {
                var node = this.clientNodes[oldIndex];
                if (node.isRemoved)
                    eatNodes.push(node);
                else
                    delNodes.push(node);
                oldIndex++;
                continue;
            }
            var node = this.viewNodes[newIndex];
            if (node.isRemoved)
                continue;
            // only send update for moving or player nodes
            if (node.isMoving || node.type == 0 || node.type == 2 || this.server.config.serverGamemode == 3 && node.type == 1)
                updNodes.push(node);
            newIndex++;
            oldIndex++;
        }
        for (; newIndex < this.viewNodes.length; newIndex++) {
            addNodes.push(this.viewNodes[newIndex]);
        }
        for (; oldIndex < this.clientNodes.length; oldIndex++) {
            var node = this.clientNodes[oldIndex];
            if (node.isRemoved)
                eatNodes.push(node);
            else
                delNodes.push(node);
        }
        this.clientNodes = this.viewNodes;
        // Send update packet
        packetHandler.sendPacket(new Packet.UpdateNodes(this, addNodes, updNodes, eatNodes, delNodes));
        // Update leaderboard
        if (++this.tickLeaderboard > 25) {
            // 1 / 0.040 = 25 (once per second)
            this.tickLeaderboard = 0;
            if (this.server.leaderboardType >= 0)
                packetHandler.sendPacket(new Packet.UpdateLeaderboard(this, this.server.leaderboard, this.server.leaderboardType));
        }
    }
    updateSpecView(len) {
        if (!this.spectate || len) {
            // in game
            this.centerPos = this.cells.reduce(
                (average, current) => average.add(current.position.quotient(len)),
                new Vec2(0, 0)
            );
        }
        else {
            if (this.freeRoam || this.getSpecTarget() == null) {
                // free roam
                var mouseVec = this.mouse.difference(this.centerPos);
                var mouseDist = mouseVec.dist();
                if (mouseDist != 0) {
                    this.setCenterPos(this.centerPos.add(mouseVec.product(32 / mouseDist)));
                }
                var scale = this.server.config.serverSpectatorScale;
            }
            else {
                // spectate target
                var player = this.getSpecTarget();
                if (player) {
                    this.setCenterPos(player.centerPos);
                    var scale = player.getScale();
                    this.place = player.place;
                    this.viewBox = player.viewBox;
                    this.viewNodes = player.viewNodes;
                }
            }
            // sends camera packet
            this.socket.packetHandler.sendPacket(new Packet.UpdatePosition(this, this.centerPos.x, this.centerPos.y, scale));
        }
    }
    pressSpace() {
        if (this.spectate) {
            // Check for spam first (to prevent too many add/del updates)
            if (this.server.ticks - this.lastKeypressTick < 40)
                return;
            this.lastKeypressTick = this.server.ticks;
            // Space doesn't work for freeRoam mode
            if (this.freeRoam || this.server.largestClient == null)
                return;
        }
        else if (this.server.run) {
            // Disable mergeOverride on the last merging cell
            if (this.cells.length <= 2)
                this.mergeOverride = false;
            // Cant split if merging or frozen
            if (this.mergeOverride || this.frozen)
                return;
            this.server.splitCells(this);
        }
    }
    pressW() {
        if (this.spectate || !this.server.run)
            return;
        this.server.ejectMass(this);
    }
    pressQ() {
        if (this.spectate) {
            // Check for spam first (to prevent too many add/del updates)
            if (this.server.ticks - this.lastKeypressTick < 40)
                return;
            this.lastKeypressTick = this.server.ticks;
            if (this.spectateTarget == null)
                this.freeRoam = !this.freeRoam;
            this.spectateTarget = null;
        }
    }
    getSpecTarget() {
        if (this.spectateTarget == null || this.spectateTarget.isRemoved) {
            this.spectateTarget = null;
            return this.server.largestClient;
        }
        return this.spectateTarget;
    }
    setCenterPos(p) {
        p.x = Math.max(p.x, this.server.border.minx);
        p.y = Math.max(p.y, this.server.border.miny);
        p.x = Math.min(p.x, this.server.border.maxx);
        p.y = Math.min(p.y, this.server.border.maxy);
        this.centerPos = p;
    }
}

module.exports = PlayerTracker;
