// Library imports
var WebSocket = require('ws');
var http = require('http');
var fs = require("fs");

// Project imports
var Packet = require('./packet');
var PlayerTracker = require('./PlayerTracker');
var PacketHandler = require('./PacketHandler');
var Entity = require('./entity');
var Logger = require('./modules/Logger');

// GameServer implementation
function GameServer() {
    // Location of source files - For renaming or moving source files!
    this.srcFiles = "../src";
    
    // Startup
    this.run = true;
    this.version = '1.4.2';
    this.httpServer = null;
    this.wsServer = null;
    this.commands;
    this.lastNodeId = 1;
    this.lastPlayerId = 1;
    this.clients = [];
    this.socketCount = 0;
    this.largestClient; // Required for spectators
    this.nodes = [];        // Total nodes
    this.nodesVirus = [];   // Virus nodes
    this.nodesFood = [];    // Food nodes
    this.nodesEjected = []; // Ejected mass nodes
    this.quadTree = null;
    
    this.movingNodes = []; // For move engine
    this.leaderboard = [];
    this.leaderboardType = -1; // no type
    
    var BotLoader = require('./ai/BotLoader');
    this.bots = new BotLoader(this);
    
    // Main loop tick
    this.startTime = Date.now();
    this.stepDateTime = 0;
    this.timeStamp = 0;
    this.updateTime = 0;
    this.updateTimeAvg = 0;
    this.timerLoopBind = null;
    this.mainLoopBind = null;
    this.tickCounter = 0;

    // Config
    this.config = {
        logVerbosity: 4,            // Console log level (0=NONE; 1=FATAL; 2=ERROR; 3=WARN; 4=INFO; 5=DEBUG)
        logFileVerbosity: 5,        // File log level
        
        serverTimeout: 300,         // Seconds to keep connection alive for non-responding client
        serverWsModule: 'ws',       // WebSocket module: 'ws' or 'uws' (install npm package before using uws)
        serverMaxConnections: 128,   // Maximum number of connections to the server. (0 for no limit)
        serverPort: 443,            // Server port
        serverBind: '0.0.0.0',      // Network interface binding
        serverTracker: 0,           // Set to 1 if you want to show your server on the tracker http://ogar.mivabe.nl/master
        serverGamemode: 0,          // Gamemode, 0 = FFA, 1 = Teams
        serverBots: 0,              // Number of player bots to spawn
        serverViewBaseX: 1920,      // Base client screen resolution. Used to calculate view area. Warning: high values may cause lag
        serverViewBaseY: 1080,      // min value is 1920x1080
        serverMinScale: 0.15,       // Min scale for player (low value leads to lags due to large visible area)
        serverSpectatorScale: 0.4,  // Scale (field of view) used for free roam spectators (low value leads to lags, vanilla=0.4, old vanilla=0.25)
        serverStatsPort: 88,        // Port for stats server. Having a negative number will disable the stats server.
        serverStatsUpdate: 60,      // Update interval of server stats in seconds
        
        serverMaxLB: 10,            // Controls the maximum players displayed on the leaderboard.
        serverChat: 1,              // Set to 1 to allow chat; 0 to disable chat.
        serverChatAscii: 1,         // Set to 1 to disable non-ANSI letters in the chat (english only mode)
        serverName: 'MultiOgar-Edited #1', // Server name
        serverWelcome1: 'Welcome to MultiOgar-Edited!',      // First server welcome message
        serverWelcome2: '',         // Second server welcome message (for info, etc)
        
        serverIpLimit: 4,           // Maximum number of connections from the same IP (0 for no limit)
        serverMinionIgnoreTime: 30, // minion detection disable time on server startup [seconds]
        serverMinionThreshold: 10,  // max connections within serverMinionInterval time period, which l not be marked as minion
        serverMinionInterval: 1000, // minion detection interval [milliseconds]
        serverScrambleLevel: 1,     // Toggles scrambling of coordinates. 0 = No scrambling, 1 = lightweight scrambling. 2 = full scrambling (also known as scramble minimap); 3 - high scrambling (no border)
        playerBotGrow: 0,           // Cells greater than 625 mass cannot grow from cells under 17 mass (set to 1 to disable)
        
        borderWidth: 14142,         // Map border size (Vanilla value: 14142)
        borderHeight: 14142,        // Map border size (Vanilla value: 14142)
        
        foodMinSize: 10,            // Minimum food size (vanilla 10)
        foodMaxSize: 20,            // Maximum food size (vanilla 20)
        foodMinAmount: 1000,        // Minimum food cells on the map
        foodMaxAmount: 2000,        // Maximum food cells on the map
        foodSpawnAmount: 30,        // The number of food to spawn per interval
        foodMassGrow: 1,            // Enable food mass grow ?
        spawnInterval: 20,          // The interval between each food cell spawn in ticks (1 tick = 50 ms)
        
        virusMinSize: 100,          // Minimum virus size (vanilla 100)
        virusMaxSize: 140,          // Maximum virus size (vanilla 140)
        virusMinAmount: 50,         // Minimum number of viruses on the map.
        virusMaxAmount: 100,        // Maximum number of viruses on the map. If this number is reached, then ejected cells will pass through viruses.
        
        ejectSize: 38,              // Size of ejected cells (vanilla 38)
        ejectSizeLoss: 43,          // Eject size which will be substracted from player cell (vanilla 43?)
        ejectCooldown: 3,           // min ticks between ejects
        ejectSpawnPercent: 0.5,     // Chance for a player to spawn from ejected mass. 0.5 = 50% (set to 0 to disable)
        
        playerMinSize: 32,          // Minimym size of the player cell (mass = 32*32/100 = 10.24)
        playerMaxSize: 1500,        // Maximum size of the player cell (mass = 1500*1500/100 = 22500)
        playerMinSplitSize: 60,     // Minimum player cell size allowed to split (mass = 60*60/100 = 36) 
        playerStartSize: 64,        // Start size of the player cell (mass = 64*64/100 = 41)
        playerMaxCells: 16,         // Max cells the player is allowed to have
        playerSpeed: 1,             // Player speed multiplier
        playerDecayRate: .002,      // Amount of player cell size lost per second
        playerRecombineTime: 30,    // Base time in seconds before a cell is allowed to recombine
        playerMaxNickLength: 15,    // Maximum nick length
        playerDisconnectTime: 60,   // The time in seconds it takes for a player cell to be removed after disconnection (If set to -1, cells are never removed)
        
        minionStartSize: 32,        // Start size of minions (mass = 32*32/100 = 10.24)
        minionMaxStartSize: 32,     // Maximum value of random start size for minions (set value higher than minionStartSize to enable)
        disableERTP: 1,             // Whether or not to disable ERTP controls for minions. (must use ERTPcontrol script in /scripts) (Set to 0 to enable)
        disableQ: 0,                // Whether or not to disable Q controls for minions. (Set 0 to enable)
        serverMinions: 0,           // Amount of minions each player gets once they spawn
        defaultName: "minion",      // Default name for all minions if name is not specified using command
        collectPellets: 0,          // Enable collect pellets mode. To use just press P or Q. (Warning: this disables Q controls, so make sure that disableERT is 0)
        
        lastManStandingShortest: 60, // Shortest amount of time possible before LMS happens in minutes
        lastManStandingLongest: 120, // Longest amount of time possible before LMS happens in minutes
        lastManStandingKickShortest: 30, //Shortest amount of minutes till kicking time
        lastManStandingKickLongest: 60,  //Longest amount of minutes till kicking time 
    };
    this.ipBanList = [];
    this.minionTest = [];
    this.userList = [];
    this.badWords = [];
    
    // Parse config
    this.loadConfig();
    this.loadIpBanList();
    this.loadUserList();
    this.loadBadWords();
    
    var QuadNode = require('./modules/QuadNode.js');
    this.setBorder(this.config.borderWidth, this.config.borderHeight);
    this.quadTree = new QuadNode(this.border, 64, 32);
    
    // Gamemodes
    var Gamemode = require('./gamemodes');
    this.gameMode = Gamemode.get(this.config.serverGamemode);
}

module.exports = GameServer;

GameServer.prototype.start = function() {
    this.timerLoopBind = this.timerLoop.bind(this);
    this.mainLoopBind = this.mainLoop.bind(this);
    this.gameMode.onServerInit(this); // Gamemode configurations
    
    // Start the server
    this.httpServer = http.createServer();
    var wsOptions = {
        server: this.httpServer, 
        perMessageDeflate: false,
        maxPayload: 4096
    };
    Logger.info("WebSocket: " + this.config.serverWsModule);
    WebSocket = require(this.config.serverWsModule);
    this.wsServer = new WebSocket.Server(wsOptions);
    this.wsServer.on('error', this.onServerSocketError.bind(this));
    this.wsServer.on('connection', this.onClientSocketOpen.bind(this));
    this.httpServer.listen(this.config.serverPort, this.config.serverBind, this.onHttpServerOpen.bind(this));
    if (this.config.serverStatsPort > 0) this.startStatsServer(this.config.serverStatsPort);
};

GameServer.prototype.onHttpServerOpen = function() {
    // Start Main Loop
    setTimeout(this.timerLoopBind, 1);
    
    // Done
    Logger.info("Listening on port " + this.config.serverPort);
    Logger.info("Current game mode is " + this.gameMode.name);
    
    // Player bots (Experimental)
    if (this.config.serverBots > 0) {
        for (var i = 0; i < this.config.serverBots; i++) {
            this.bots.addBot();
        }
        Logger.info("Added " + this.config.serverBots + " player bots");
    }
};

GameServer.prototype.addNode = function(node) {
    var x = node.position.x;
    var y = node.position.y;
    var size = node._size;
    node.quadItem = {
        cell: node,
        x: x,
        y: y,
        size: size,
        bound: { minx: x-size, miny: y-size, maxx: x+size, maxy: y+size }
    };
    this.quadTree.insert(node.quadItem);
    this.nodes.push(node);
    
    // Adds to the owning player's screen
    if (node.owner) {
        node.setColor(node.owner.color);
        node.owner.cells.push(node);
        node.owner.socket.sendPacket(new Packet.AddNode(node.owner, node));
    }
    node.onAdd(this); // Special on-add actions
};

GameServer.prototype.onServerSocketError = function(error) {
    Logger.error("WebSocket: " + error.code + " - " + error.message);
    switch (error.code) {
        case "EADDRINUSE":
            Logger.error("Server could not bind to port " + this.config.serverPort + "!");
            Logger.error("Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
            break;
        case "EACCES":
            Logger.error("Please make sure you are running Ogar with root privileges.");
            break;
    }
    process.exit(1); // Exits the program
};

GameServer.prototype.onClientSocketOpen = function(ws) {
    var logip = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    ws.on('error', function(err) {
        Logger.writeError("[" + logip + "] " + err.stack);
    });
    if (this.config.serverMaxConnections > 0 && this.socketCount >= this.config.serverMaxConnections) {
        ws.close(1000, "No slots");
        return;
    }
    if (this.checkIpBan(ws._socket.remoteAddress)) {
        ws.close(1000, "IP banned");
        return;
    }
    if (this.config.serverIpLimit > 0) {
        var ipConnections = 0;
        for (var i = 0; i < this.clients.length; i++) {
            var socket = this.clients[i];
            if (!socket.isConnected || socket.remoteAddress != ws._socket.remoteAddress)
                continue;
            ipConnections++;
        }
        if (ipConnections >= this.config.serverIpLimit) {
            ws.close(1000, "IP limit reached");
            return;
        }
    }
    ws.isConnected = true;
    ws.remoteAddress = ws._socket.remoteAddress;
    ws.remotePort = ws._socket.remotePort;
    ws.lastAliveTime = Date.now();
    Logger.write("CONNECTED    " + ws.remoteAddress + ":" + ws.remotePort + ", origin: \"" + ws.upgradeReq.headers.origin + "\"");
    
    var PlayerCommand = require('./modules/PlayerCommand');
    ws.playerTracker = new PlayerTracker(this, ws);
    ws.packetHandler = new PacketHandler(this, ws);
    ws.playerCommand = new PlayerCommand(this, ws.playerTracker);
    
    var self = this;
    var onMessage = function(message) {
        if (message.length == 0) {
            return;
        }
        if (message.length > 256) {
            ws.close(1009, "Spam");
            return;
        }
        ws.packetHandler.handleMessage(message);
    };
    var onError = function(error) {
        ws.sendPacket = function(data) { };
    };
    var onClose = function(reason) {
        if (ws._socket.destroy != null && typeof ws._socket.destroy == 'function') {
            ws._socket.destroy();
        }
        this.socketCount--;
        ws.isConnected = false;
        ws.sendPacket = function(data) { };
        ws.closeReason = { reason: ws._closeCode, message: ws._closeMessage };
        ws.closeTime = Date.now();
        Logger.write("DISCONNECTED " + ws.remoteAddress + ":" + ws.remotePort + ", code: " + ws._closeCode + ", reason: \"" + ws._closeMessage + "\", name: \"" + ws.playerTracker._name + "\"");
    };
    ws.on('message', onMessage);
    ws.on('error', onError);
    ws.on('close', onClose);
    this.socketCount++;
    this.clients.push(ws);
    
    // Minion detection
    if (this.config.serverMinionThreshold) {
        if ((ws.lastAliveTime - this.startTime) / 1000 >= this.config.serverMinionIgnoreTime) {
            if (this.minionTest.length >= this.config.serverMinionThreshold) {
                ws.playerTracker.isMinion = true;
                for (var i = 0; i < this.minionTest.length; i++) {
                    var playerTracker = this.minionTest[i];
                    if (!playerTracker.socket.isConnected) continue;
                    playerTracker.isMinion = true;
                }
                if (this.minionTest.length) {
                    this.minionTest.splice(0, 1);
                }
            }
            this.minionTest.push(ws.playerTracker);
        }
    }
    if (this.config.serverMinions > 0) {
        for (var i = 0; i < this.config.serverMinions; i++) {
            this.bots.addMinion(ws.playerTracker);
            ws.playerTracker.minionControl = true;
        }
    }
};

GameServer.prototype.checkIpBan = function(ipAddress) {
    if (!this.ipBanList || this.ipBanList.length == 0 || ipAddress == "127.0.0.1") {
        return false;
    }
    if (this.ipBanList.indexOf(ipAddress) >= 0) {
        return true;
    }
    var ipBin = ipAddress.split('.');
    if (ipBin.length != 4) {
        // unknown IP format
        return false;
    }
    var subNet2 = ipBin[0] + "." + ipBin[1] + ".*.*";
    if (this.ipBanList.indexOf(subNet2) >= 0) {
        return true;
    }
    var subNet1 = ipBin[0] + "." + ipBin[1] + "." + ipBin[2] + ".*";
    if (this.ipBanList.indexOf(subNet1) >= 0) {
        return true;
    }
    return false;
};

GameServer.prototype.setBorder = function(width, height) {
    var hw = width / 2, hh = height / 2;
    this.border = {
        minx: -hw, miny: -hh, maxx: hw, maxy: hh, width: width, height: height, centerx: 0, centery: 0
    };
};

GameServer.prototype.getRandomColor = function() {
    var h = 360 * Math.random();
    var s = 248 / 255;
    var v = 1;
    
    // hsv to rgb    
    var rgb = { r: v, g: v, b: v };    // achromatic (grey)
    if (s > 0) {
        h /= 60;			           // sector 0 to 5
        var i = ~~(h) >> 0;
        var f = h - i;			       // factorial part of h
        var p = v * (1 - s);
        var q = v * (1 - s * f);
        var t = v * (1 - s * (1 - f));
        switch (i) {
            case 0: rgb = { r: v, g: t, b: p }; break;
            case 1: rgb = { r: q, g: v, b: p }; break;
            case 2: rgb = { r: p, g: v, b: t }; break;
            case 3: rgb = { r: p, g: q, b: v }; break;
            case 4: rgb = { r: t, g: p, b: v }; break;
            default: rgb = { r: v, g: p, b: q }; break;
        }
    }
    // check color range
    rgb.r = Math.max(rgb.r, 0);
    rgb.g = Math.max(rgb.g, 0);
    rgb.b = Math.max(rgb.b, 0);
    rgb.r = Math.min(rgb.r, 1);
    rgb.g = Math.min(rgb.g, 1);
    rgb.b = Math.min(rgb.b, 1);
    return {
        r: (rgb.r * 255) >> 0,
        g: (rgb.g * 255) >> 0,
        b: (rgb.b * 255) >> 0
    };
};

GameServer.prototype.removeNode = function(node) {
    node.isRemoved = true;
    this.quadTree.remove(node.quadItem);
    node.quadItem = null;
    
    // Remove from main nodes list
    var index = this.nodes.indexOf(node);
    if (index != -1) {
        this.nodes.splice(index, 1);
    }
    
    // Remove from moving cells list
    index = this.movingNodes.indexOf(node);
    if (index != -1) {
        this.movingNodes.splice(index, 1);
    }
    
    // Special on-remove actions
    node.onRemove(this);
};

GameServer.prototype.updateClients = function() {
    // check minions
    for (var i = 0; i < this.minionTest.length; ) {
        var playerTracker = this.minionTest[i];
        if (this.stepDateTime - playerTracker.connectedTime > this.config.serverMinionInterval) {
            this.minionTest.splice(i, 1);
        } else {
            i++;
        }
    }
    // check dead clients
    for (var i = 0; i < this.clients.length; ) {
        playerTracker = this.clients[i].playerTracker;
        playerTracker.checkConnection();
        if (playerTracker.isRemoved) {
            // remove dead client
            this.clients.splice(i, 1);
        } else {
            i++;
        }
    }
    // update
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].playerTracker.updateTick();
    }
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].playerTracker.sendUpdate();
    }
};

GameServer.prototype.updateLeaderboard = function() {
    // Update leaderboard with the gamemode's method
    this.leaderboard = [];
    this.leaderboardType = -1;
    this.gameMode.updateLB(this);
    
    if (!this.gameMode.specByLeaderboard) {
        // Get client with largest score if gamemode doesn't have a leaderboard
        var clients = this.clients.valueOf();
        
        // Use sort function
        clients.sort(function(a, b) {
            return b.playerTracker.getScore() - a.playerTracker.getScore();
        });
        this.largestClient = null;
        if (clients[0] != null)
            this.largestClient = clients[0].playerTracker;
    } else {
        this.largestClient = this.gameMode.rankOne;
    }
};

GameServer.prototype.onChatMessage = function(from, to, message) {
    if (message == null) return;
    message = message.trim();
    if (message == "") return;
    if (from && message.length > 0 && message[0] == '/') {
        // player command
        message = message.slice(1, message.length);
        from.socket.playerCommand.executeCommandLine(message);
        return;
    }
    if (!this.config.serverChat || (from && from.isMuted)) {
        // chat is disabled or player is muted
        return;
    }
    if (message.length > 64) {
        message = message.slice(0, 64);
    }
    if (this.config.serverChatAscii) {
        for (var i = 0; i < message.length; i++) {
            var c = message.charCodeAt(i);
            if (c < 0x20 || c > 0x7F) {
                if (from) {
                    this.sendChatMessage(null, from, "You can use ASCII text only!");
                }
                return;
            }
        }
    }
    if (this.checkBadWord(message)) {
        if (from) {
            this.sendChatMessage(null, from, "Stop insulting others! Keep calm and be friendly please");
        }
        return;
    }
    this.sendChatMessage(from, to, message);
};

GameServer.prototype.checkBadWord = function(value) {
    if (!value) return false;
    value = value.toLowerCase().trim();
    if (!value) return false;
    for (var i = 0; i < this.badWords.length; i++) {
        if (value.indexOf(this.badWords[i]) >= 0) {
            return true;
        }
    }
    return false;
};

GameServer.prototype.sendChatMessage = function(from, to, message) {
    for (var i = 0; i < this.clients.length; i++) {
        var client = this.clients[i];
        if (client == null) continue;
        if (to == null || to == client.playerTracker)
            client.sendPacket(new Packet.ChatMessage(from, message));
    }
};

GameServer.prototype.timerLoop = function() {
    var timeStep = 40;
    timeStep += 5;
    timeStep = Math.max(timeStep, 40);
    
    var ts = Date.now();
    var dt = ts - this.timeStamp;
    if (dt < timeStep - 5) {
        setTimeout(this.timerLoopBind, ((timeStep - 5) - dt) >> 0);
        return;
    }
    if (dt < timeStep - 1) {
        setTimeout(this.timerLoopBind, 0);
        return;
    }
    if (dt < timeStep) {
        setTimeout(this.timerLoopBind, 0);
        return;
    }
    // update average
    this.updateTimeAvg += 0.5 * (this.updateTime - this.updateTimeAvg);
    // calculate next
    if (this.timeStamp == 0)
        this.timeStamp = ts;
    this.timeStamp += timeStep;
    setTimeout(this.mainLoopBind, 0);
    setTimeout(this.timerLoopBind, 0);
};

GameServer.prototype.mainLoop = function() {
    this.stepDateTime = Date.now();
    var tStart = process.hrtime();
    
    // Loop main functions
    if (this.run) {
        // Move player cells
        for (var i in this.clients) {
            var client = this.clients[i].playerTracker;
            for (var j = 0; j < client.cells.length; j++) {
                var cell1 = client.cells[j];
                if (cell1.isRemoved)
                    continue;
                cell1.moveUser(this.border);
                cell1.move(this.border);
                this.autoSplit(client, cell1);
                this.updateNodeQuad(cell1);
            }
        }
        // Move moving cells
        for (var i = 0; i < this.movingNodes.length;) {
            cell1 = this.movingNodes[i];
            if (cell1.isRemoved)
                continue;
            cell1.move(this.border);
            this.updateNodeQuad(cell1);
            if (!cell1.isMoving)
                this.movingNodes.splice(i, 1);
            else i++;
        }
        // Scan for player cells collisions
        var self = this;
        var rigidCollisions = [];
        var eatCollisions = [];
        for (var i in this.clients) {
            client = this.clients[i].playerTracker;
            for (var j = 0; j < client.cells.length; j++) {
                cell1 = client.cells[j];
                if (cell1 == null) continue;
                this.quadTree.find(cell1.quadItem.bound, function(item) {
                    var cell2 = item.cell;
                    if (cell2 == cell1) return;
                    var c = self.checkCellCollision(cell1, cell2);
                    if (c == null) return;
                    if (self.checkRigidCollision(c))
                        rigidCollisions.push({ cell1: cell1, cell2: cell2 });
                    else
                        eatCollisions.push({ cell1: cell1, cell2: cell2 });
                });
            }
        }
        // resolve rigid body collisions, update quad tree
        for (var k = 0; k < rigidCollisions.length; k++) {
            var r = rigidCollisions[k];
            var c = this.checkCellCollision(r.cell1, r.cell2);
            if (c == null) continue;
            this.resolveRigidCollision(c, this.border);
            this.updateNodeQuad(r.cell1);
            this.updateNodeQuad(r.cell2);
        }
        rigidCollisions = null;
        
        // resolve eat collisions
        for (var k = 0; k < eatCollisions.length; k++) {
            c = eatCollisions[k];
            var manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveCollision(manifold);
        }
        eatCollisions = null;
        
        // Scan for ejected cell collisions (scan for ejected or virus only)
        rigidCollisions = [];
        eatCollisions = [];
        for (var i = 0; i < this.movingNodes.length; i++) {
            cell1 = this.movingNodes[i];
            if (cell1.isRemoved) continue;
            this.quadTree.find(cell1.quadItem.bound, function(item) {
                var cell2 = item.cell;
                if (cell2 == cell1)
                    return;
                var manifold = self.checkCellCollision(cell1, cell2);
                if (manifold == null) return;
                if (cell1.cellType == 3 && cell2.cellType == 3)
                    rigidCollisions.push({ cell1: cell1, cell2: cell2 });
                else
                    eatCollisions.push({ cell1: cell1, cell2: cell2 });
            });
        }
        // resolve rigid body collisions
        for (var k = 0; k < rigidCollisions.length; k++) {
            r = rigidCollisions[k];
            c = this.checkCellCollision(r.cell1, r.cell2);
            if (c == null) continue;
            this.resolveRigidCollision(c, this.border);
            // position changed! don't forget to update quad-tree
            this.updateNodeQuad(r.cell1);
            this.updateNodeQuad(r.cell2);
        }
        rigidCollisions = null;
        
        // resolve eat collisions
        for (var k = 0; k < eatCollisions.length; k++) {
            c = eatCollisions[k];
            manifold = this.checkCellCollision(c.cell1, c.cell2);
            if (manifold == null) continue;
            this.resolveCollision(manifold);
        }
        // check remerge
        for (var i in this.clients) {
            client = this.clients[i].playerTracker;
            for (var j = 0; j < client.cells.length; j++) {
                cell1 = client.cells[j];
                if (cell1 === null || cell1.isRemoved) continue;
                cell1.updateRemerge(this);
            }
        }
        if ((this.tickCounter & this.config.spawnInterval - 1) == 0) {
            this.spawnCells();
        }
        this.gameMode.onTick(this);
        if (((this.tickCounter + 3) & (25)) == 0) {
            // once per second
            this.updateMassDecay();
        }
    }
    this.updateClients();
    if (((this.tickCounter + 7) & (25 - 1)) == 0) {
        // once per second
        this.updateLeaderboard();
    }
    
    // ping server tracker
    if (this.config.serverTracker && (this.tickCounter & (250 - 1)) == 0) {
        // once per 30 seconds
        this.pingServerTracker();
    }
    
    if (this.run) this.tickCounter++;
    var tEnd = process.hrtime(tStart);
    this.updateTime = tEnd[0] * 1000 + tEnd[1] / 1000000;
};


GameServer.prototype.updateMassDecay = function() {
    if (!this.config.playerDecayRate) return;
    
    var decay = 1 - this.config.playerDecayRate * this.gameMode.decayMod;
    // Loop through all player cells
    for (var i = 0; i < this.clients.length; i++) {
        var playerTracker = this.clients[i].playerTracker;
        for (var j = 0; j < playerTracker.cells.length; j++) {
            var cell = playerTracker.cells[j];
            if (cell === null || cell.isRemoved) 
                continue;
            var size = cell._size;
            if (size <= this.config.playerMinSize)
                continue;
            size = Math.sqrt(size * size * decay);
            size = Math.max(size, this.config.playerMinSize);
            if (size != cell._size) {
                cell.setSize(size);
            }
        }
    }
};

GameServer.prototype.autoSplit = function(client, cell1) {
    if (cell1._size < this.config.playerMaxSize) return;
    
    // check size limit
    var checkSize = !client.mergeOverride || client.cells.length == 1;
    if (checkSize && cell1._size > this.config.playerMaxSize && cell1.getAge(this.tickCounter) >= 15) {
        if (client.cells.length >= this.config.playerMaxCells) {
            // cannot split => just limit
            cell1.setSize(this.config.playerMaxSize);
        } else {
            // split
            var maxSplit = this.config.playerMaxCells - client.cells.length,
            count = (cell1._sizeSquared / (this.config.playerMaxSize * this.config.playerMaxSize)) >> 0,
            count1 = Math.min(count, maxSplit),
            splitSize = cell1._size / Math.sqrt(count1 + 1),
            splitMass = splitSize * splitSize / 100,
            angle = Math.random() * 2 * Math.PI,
            step = 2 * Math.PI / count1;
            for (var k = 0; k < count1; k++) {
                this.splitPlayerCell(client, cell1, angle, splitMass);
                angle += step;
            }
        }
    }
};

GameServer.prototype.splitPlayerCell = function(client, parent, angle, mass, maxCells) {
    // Player cell limit
    if (client.cells.length >= maxCells) 
        return false;
    
    var size1 = 0;
    var size2 = 0;
    if (mass == null) {
        size1 = parent._size * 1 / Math.sqrt(2);
        size2 = size1;
    } else {
        size2 = Math.sqrt(mass * 100);
        size1 = Math.sqrt(parent._size * parent._size - size2 * size2);
    }
    if (isNaN(size1) || size1 < this.config.playerMinSize) {
        return false;
    }
    
    // Remove mass from parent cell first
    parent.setSize(size1);
    
    // make a small shift to the cell position to prevent extrusion in wrong direction
    var pos = {
        x: parent.position.x + 40 * Math.sin(angle),
        y: parent.position.y + 40 * Math.cos(angle)
    };
    
    // Create cell
    var newCell = new Entity.PlayerCell(this, client, pos, size2);
    newCell.setBoost(780, angle);
    
    // Add to node list
    this.addNode(newCell);
    return true;
};

GameServer.prototype.updateNodeQuad = function(node) {
    var item = node.quadItem;
    var x = node.position.x;
    var y = node.position.y;
    var size = node._size;
    // check for change
    if (item.x === x && item.y === y && item.size === size) {
        return;
    }
    // update quad tree
    item.x = x;
    item.y = y;
    item.size = size;
    item.bound.minx = x - size;
    item.bound.miny = y - size;
    item.bound.maxx = x + size;
    item.bound.maxy = y + size;
    this.quadTree.update(item);
};

// Checks if collision is rigid body collision
GameServer.prototype.checkRigidCollision = function(c) {
    if (!c.cell1.owner || !c.cell2.owner)
        return false;
    if (c.cell1.owner != c.cell2.owner) {
        // Different owners
        return this.gameMode.haveTeams && 
            c.cell1.owner.team == c.cell2.owner.team;
    }
    // The same owner
    if (c.cell1.owner.mergeOverride)
        return false;
    if (c.cell1.getAge(this.tickCounter) < 14 || c.cell2.getAge(this.tickCounter) < 14) {
        // just splited => ignore
        return false;
    }
    return !c.cell1._canRemerge || !c.cell2._canRemerge;
};

// Checks cells for collision
GameServer.prototype.checkCellCollision = function(cell, check) {
    var m = cell._mass + check._mass;
    var r = ~~(cell._size + check._size);
    var dx = check.position.x - cell.position.x;
    var dy = check.position.y - cell.position.y;
    var squared = dx * dx + dy * dy; // squared distance from cell to check
    if (squared > r * r) {
        return null; // no collision
    }
    // create collision manifold
    return {
        cell1: cell,
        cell2: check,
        r: r,               // radius sum
        m: m,               // body impulse
        dx: dx,             // delta x from cell1 to cell2
        dy: dy,             // delta y from cell1 to cell2
        squared: squared    // squared distance from cell1 to cell2
    };
};

// Resolves rigid body collision
GameServer.prototype.resolveRigidCollision = function(c) {
    // distance from cell1 to cell2
    var d = Math.sqrt(c.squared);
    if (d <= 0) return;
    // body impulse
    var m1 = ~~c.cell1._mass * (1 / c.m);
    var m2 = ~~c.cell2._mass * (1 / c.m);
    // apply extrusion force
    var force = Math.min((c.r - d) / d, c.r - d);
    c.cell1.position.x -= ~~((force * ~~c.dx) * m2);
    c.cell1.position.y -= ~~((force * ~~c.dy) * m2);
    c.cell2.position.x += ~~((force * ~~c.dx) * m1);
    c.cell2.position.y += ~~((force * ~~c.dy) * m1);
};

// Resolves non-rigid body collision
GameServer.prototype.resolveCollision = function(manifold) {
    var cell = manifold.cell1;
    var check = manifold.cell2;
    if (cell._size > check._size) {
        cell = manifold.cell2;
        check = manifold.cell1;
    }
    // check if any cell already eaten
    if (cell.isRemoved || check.isRemoved)
        return;
    // check distance
    var eatDistance = check._size - cell._size / 3;
    if (manifold.squared >= eatDistance * eatDistance) {
        // too far => can't eat
        return;
    }
    // collision check for players
    if (cell.cellType <= 0 || check.cellType <= 0) {
        if (cell.owner && cell.owner == check.owner) {
            // collision owned => ignore, resolve, or remerge
            if (cell.getAge(this.tickCounter) < 14 || check.getAge(this.tickCounter) < 14) {
                // just splited => ignore
                return;
            }
            // Disable mergeOverride on the last merging cell
            if (cell.owner.cells.length <= 2) {
                cell.owner.mergeOverride = false;
            }
        } else {
            if (check._size < cell._size * 1.15) return; // size check
            if (!check.canEat(cell)) return; // cell refuses to be eaten
        }
    }
    // Now maxCell can eat minCell
    cell.isRemoved = true;
    
    // Consume effect
    check.onEat(cell);
    cell.onEaten(check);
    cell.killedBy = check;
  
    // update bounds & Remove cell
    this.updateNodeQuad(check);
    this.removeNode(cell);
};

GameServer.prototype.getRandomPosition = function() {
    return {
        x: (this.border.minx + this.border.width * Math.random()) >> 0,
        y: (this.border.miny + this.border.height * Math.random()) >> 0
    };
};

GameServer.prototype.spawnCells = function() {
    var maxCount = this.config.foodMinAmount - this.nodesFood.length;
    var spawnCount = Math.min(maxCount, this.config.foodSpawnAmount);
    for (var i = 0; i < spawnCount; i++) {
        var cell = new Entity.Food(this, null, this.getRandomPosition(), this.config.foodMinSize);
        if (this.config.foodMassGrow) {
            var size = cell._size;
            var maxGrow = this.config.foodMaxSize - size;
            size += maxGrow * Math.random();
            cell.setSize(size);
        }
        cell.setColor(this.getRandomColor());
        this.addNode(cell);
    }
    maxCount = this.config.virusMinAmount - this.nodesVirus.length;
    spawnCount = Math.min(maxCount, 2);
    for (var i = 0; i < spawnCount; i++) {
        var pos = this.getRandomPosition();
        for (var i = 0; i < 10 && this.willCollide(pos, this.config.virusMinSize); i++) {
            pos = this.getRandomPosition();
        }
        var v = new Entity.Virus(this, null, pos, this.config.virusMinSize);
        this.addNode(v);
    }
};

GameServer.prototype.spawnPlayer = function(player) {
    var pos = this.getRandomPosition(),
    size = this.config.playerStartSize,
    index = (this.nodesEjected.length - 1) * Math.random() >> 0,
    eject = this.nodesEjected[index],
    
    // Check for special start size(s)
    start = this.config.minionStartSize,
    max = this.config.minionMaxStartSize;
    if (player.spawnmass > 0 && !player.isMi) {
        size = player.spawnmass;
    } else if (player.isMi) {
        if (max > start) {
            size = ((Math.random() * (max - start)) + start) >> 0;
        } else {
            size = this.config.minionStartSize;
        }
    }
    
    // Check if can spawn from ejected mass
    if (Math.random() <= this.config.ejectSpawnPercent && this.nodesEjected.length > 0
        && !eject.isRemoved && !eject.boostDistance == 0) {
        // Spawn as same color
        player.setColor(eject.color);
        // Spawn from ejected mass
        this.removeNode(eject);
        pos = {
            x: eject.position.x,
            y: eject.position.y
        };
        if (!size) size = Math.max(eject._size, this.config.playerStartSize);
    }
    // 10 attempts to find safe position
    for (var i = 0; i < 10 && this.willCollide(pos, this.config.playerMinSize); i++) {
        pos = this.getRandomPosition();
    }
    // Spawn player and add to world
    var cell = new Entity.PlayerCell(this, player, pos, size);
    this.addNode(cell);
    
    // Set initial mouse coords
    player.mouse = {
        x: pos.x,
        y: pos.y
    };
};

GameServer.prototype.willCollide = function(pos, size) {
    // Look if there will be any collision with the current nodes
    var bound = {
        minx: pos.x - size,
        miny: pos.y - size,
        maxx: pos.x + size,
        maxy: pos.y + size
    };
    return this.quadTree.any(
        bound, 
        function(item) {
            return item.cell.cellType == 0  // check players
                || item.cell.cellType == 2; // check viruses
        });
};

GameServer.prototype.splitCells = function(client) {
    if (client.frozen) return; // Player is frozen 
    
    // It seems that vanilla uses order by cell age
    var cellToSplit = [];
    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        if (cell._size < this.config.playerMinSplitSize) {
            continue;
        }
        cellToSplit.push(cell);
        // rec mode
        if (!client.rec) var maxCells = this.config.playerMaxCells;
        else maxCells = this.config.playerMaxCells * this.config.playerMaxCells;
            
        if (cellToSplit.length + client.cells.length >= maxCells)
            break;
    }
    var splitCells = 0; // How many cells have been split
    for (var i = 0; i < cellToSplit.length; i++) {
        cell = cellToSplit[i];
        var dx = (client.mouse.x - cell.position.x) >> 0;
        var dy = (client.mouse.y - cell.position.y) >> 0;
        var dl = dx * dx + dy * dy;
        if (dl < 1) {
            dx = 1;
            dy = 0;
        }
        var angle = Math.atan2(dx, dy);
        if (isNaN(angle)) angle = Math.PI / 2;
        if (this.splitPlayerCell(client, cell, angle, null, maxCells)) {
            splitCells++;
        }
    }
};

GameServer.prototype.canEjectMass = function(client) {
    if (client.lastEject == null || !client.frozen) {
        // first eject
        client.lastEject = this.tickCounter;
        return true;
    }
    var dt = this.tickCounter - client.lastEject;
    if (dt < this.config.ejectCooldown || client.frozen ) {
        // reject (cooldown)
        return false;
    }
    client.lastEject = this.tickCounter;
    return true;
};

GameServer.prototype.ejectMass = function(client) {
    if (!this.canEjectMass(client))
        return;
    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        if (!cell) continue;
        
        if (cell._size < this.config.playerMinSplitSize) {
            continue;
        }
        var size2 = this.config.ejectSize;
        var sizeLoss = this.config.ejectSizeLoss;
        var sizeSquared = cell._sizeSquared - sizeLoss * sizeLoss;
        var size1 = Math.sqrt(sizeSquared);
        
        var dx = client.mouse.x - cell.position.x;
        var dy = client.mouse.y - cell.position.y;
        var dl = dx * dx + dy * dy;
        if (dl < 1) {
            dx = 1;
            dy = 0;
        } else {
            dl = Math.sqrt(dl);
            dx /= dl;
            dy /= dl;
        }
        
        // Remove mass from parent cell first
        cell.setSize(size1);
        
        // Get starting position
        var pos = {
            x: cell.position.x + dx * cell._size,
            y: cell.position.y + dy * cell._size
        };
        
        var angle = Math.atan2(dx, dy);
        if (isNaN(angle)) angle = Math.PI / 2;
        
        // Randomize angle
        angle += (Math.random() * 0.6) - 0.3;
        
        // Create cell
        var ejected = new Entity.EjectedMass(this, null, pos, size2);
        ejected.ejector = cell;
        ejected.setColor(cell.color);
        ejected.setBoost(780, angle);
        
        this.addNode(ejected);
    }
};

GameServer.prototype.shootVirus = function(parent, angle) {
    var parentPos = {
        x: parent.position.x,
        y: parent.position.y,
    };
    
    var newVirus = new Entity.Virus(this, null, parentPos, this.config.virusMinSize);
    newVirus.setBoost(780, angle);
    
    // Add to moving cells list
    this.addNode(newVirus);
};

GameServer.prototype.loadConfig = function() {
    var fileNameConfig = this.srcFiles + '/gameserver.ini';
    var ini = require(this.srcFiles + '/modules/ini.js');
    try {
        if (!fs.existsSync(fileNameConfig)) {
            // No config
            Logger.warn("Config not found... Generating new config");
            // Create a new config
            fs.writeFileSync(fileNameConfig, ini.stringify(this.config), 'utf-8');
        } else {
            // Load the contents of the config file
            var load = ini.parse(fs.readFileSync(fileNameConfig, 'utf-8'));
            // Replace all the default config's values with the loaded config's values
            for (var key in load) {
                if (this.config.hasOwnProperty(key)) {
                    this.config[key] = load[key];
                } else {
                    Logger.error("Unknown gameserver.ini value: " + key);
                }
            }
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameConfig + ": " + err.message);
    }
    // check config (min player size = 32 => mass = 10.24)
    this.config.playerMinSize = Math.max(32, this.config.playerMinSize);
    Logger.setVerbosity(this.config.logVerbosity);
    Logger.setFileVerbosity(this.config.logFileVerbosity);
};

GameServer.prototype.loadBadWords = function() {
    var fileNameBadWords = this.srcFiles + '/badwords.txt';
    try {
        if (!fs.existsSync(fileNameBadWords)) {
            Logger.warn(fileNameBadWords + " not found");
        } else {
            var words = fs.readFileSync(fileNameBadWords, 'utf-8');
            words = words.split(/[\r\n]+/);
            words = words.map(function(arg) { return arg.trim().toLowerCase(); });
            words = words.filter(function(arg) { return !!arg; });
            this.badWords = words;
            Logger.info(this.badWords.length + " bad words loaded");
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameBadWords + ": " + err.message);
    }
};

GameServer.prototype.loadUserList = function() {
    var UserRoleEnum = require(this.srcFiles + '/enum/UserRoleEnum');
    var fileNameUsers = this.srcFiles + '/enum/userRoles.json';
    try {
        this.userList = [];
        if (!fs.existsSync(fileNameUsers)) {
            Logger.warn(fileNameUsers + " is missing.");
            return;
        }
        var usersJson = fs.readFileSync(fileNameUsers, 'utf-8');
        var list = JSON.parse(usersJson.trim());
        for (var i = 0; i < list.length; ) {
            var item = list[i];
            if (!item.hasOwnProperty("ip") ||
                !item.hasOwnProperty("password") ||
                !item.hasOwnProperty("role") ||
                !item.hasOwnProperty("name")) {
                list.splice(i, 1);
                continue;
            }
            if (!item.password || !item.password.trim()) {
                Logger.warn("User account \"" + item.name + "\" disabled");
                list.splice(i, 1);
                continue;
            }
            if (item.ip) {
                item.ip = item.ip.trim();
            }
            item.password = item.password.trim();
            if (!UserRoleEnum.hasOwnProperty(item.role)) {
                Logger.warn("Unknown user role: " + item.role);
                item.role = UserRoleEnum.USER;
            } else {
                item.role = UserRoleEnum[item.role];
            }
            item.name = (item.name || "").trim();
            i++;
        }
        this.userList = list;
        Logger.info(this.userList.length + " user records loaded.");
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameUsers + ": " + err.message);
    }
};

GameServer.prototype.loadIpBanList = function() {
    var fileNameIpBan = this.srcFiles + '/ipbanlist.txt';
    try {
        if (fs.existsSync(fileNameIpBan)) {
            // Load and input the contents of the ipbanlist file
            this.ipBanList = fs.readFileSync(fileNameIpBan, "utf8").split(/[\r\n]+/).filter(function(x) {
                return x != ''; // filter empty lines
            });
            Logger.info(this.ipBanList.length + " IP ban records loaded.");
        } else {
            Logger.warn(fileNameIpBan + " is missing.");
        }
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to load " + fileNameIpBan + ": " + err.message);
    }
};


GameServer.prototype.startStatsServer = function(port) {
    // Create stats
    this.stats = "Test";
    this.getStats();
    
    // Show stats
    this.httpServer = http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(this.stats);
    }.bind(this));
    this.httpServer.on('error', function(err) {
        Logger.error("Stats Server: " + err.message);
    });
    
    var getStatsBind = this.getStats.bind(this);
    this.httpServer.listen(port, function() {
        // Stats server
        Logger.info("Started stats server on port " + port);
        setInterval(getStatsBind, this.config.serverStatsUpdate * 1000);
    }.bind(this));
};

GameServer.prototype.getStats = function() {
    // Get server statistics
    var totalPlayers = 0;
    var alivePlayers = 0;
    var spectatePlayers = 0;
    for (var i = 0; i < this.clients.length; i++) {
        var socket = this.clients[i];
        if (socket == null || !socket.isConnected)
            continue;
        totalPlayers++;
        if (socket.playerTracker.cells.length > 0)
            alivePlayers++;
        else
            spectatePlayers++;
    }
    var s = {
        'server_name': this.config.serverName,
        'server_chat': this.config.serverChat ? "true" : "false",
        'border_width': this.border.width,
        'border_height': this.border.height,
        'gamemode': this.gameMode.name,
        'max_players': this.config.serverMaxConnections,
        'current_players': totalPlayers,
        'alive': alivePlayers,
        'spectators': spectatePlayers,
        'update_time': this.updateTimeAvg.toFixed(3),
        'uptime': Math.round((this.stepDateTime - this.startTime) / 1000 / 60),
        'start_time': this.startTime
    };
    this.stats = JSON.stringify(s);
};

// Pings the server tracker, should be called every 30 seconds
// To list us on the server tracker located at http://ogar.mivabe.nl/master
GameServer.prototype.pingServerTracker = function() {
    // Get server statistics
    var os = require('os');
    var totalPlayers = 0;
    var alivePlayers = 0;
    var spectatePlayers = 0;
    var robotPlayers = 0;
    for (var i = 0; i < this.clients.length; i++) {
        var socket = this.clients[i];
        if (socket == null || socket.isConnected === false)
            continue;
        if (socket.isConnected == null) {
            robotPlayers++;
        }
        else {
            totalPlayers++;
            if (socket.playerTracker.cells.length > 0)
                alivePlayers++;
            else
                spectatePlayers++;
        }
    }

    // ogar-tracker.tk
    var obj = {
        port: this.config.serverPort,               // [mandatory] web socket port which listens for game client connections
        name: this.config.serverName,               // [mandatory] server name
        mode: this.gameMode.name,                   // [mandatory] game mode
        total: totalPlayers,                        // [mandatory] total online players (server bots is not included!)
        alive: alivePlayers,                        // [mandatory] alive players (server bots is not included!)
        spect: spectatePlayers,                     // [mandatory] spectate players (server bots is not included!)
        robot: robotPlayers,                        // [mandatory] server bots
        limit: this.config.serverMaxConnections,    // [mandatory] maximum allowed connection count
        protocol: 'M',                              // [mandatory] required protocol id or 'M' for multiprotocol (if all protocols is supported)   
        uptime: process.uptime() >> 0,              // [mandatory] server uptime [seconds]
        w: this.border.width >> 0,                  // [mandatory] map border width [integer]
        h: this.border.height >> 0,                 // [mandatory] map border height [integer]
        version: 'MultiOgar-Edited ' + this.version,       // [optional]  server version
        stpavg: this.updateTimeAvg >> 0,            // [optional]  average server loop time
        chat: this.config.serverChat ? 1 : 0,       // [optional]  0 - chat disabled, 1 - chat enabled
        os: os.platform()                           // [optional]  operating system
    };
    trackerRequest({
        host: 'ogar-tracker.tk',
        port: 80,
        path: '/api/ping',
        method: 'PUT'
    }, 'application/json', JSON.stringify(obj));
    

    // mivabe.nl
    var data = 'current_players=' + totalPlayers +
               '&alive=' + alivePlayers +
               '&spectators=' + spectatePlayers +
               '&max_players=' + this.config.serverMaxConnections +
               '&sport=' + this.config.serverPort +
               '&gamemode=[**] ' + this.gameMode.name +             // we add [**] to indicate that this is MultiOgar-Edited server
               '&agario=true' +                                     // protocol version
               '&name=Unnamed Server' +                             // we cannot use it, because other value will be used as dns name
               '&opp=' + os.platform() + ' ' + os.arch() +          // "win32 x64"
               '&uptime=' + process.uptime() +                      // Number of seconds server has been running
               '&version=MultiOgar ' + this.version +
               '&start_time=' + this.startTime;
    trackerRequest({
        host: 'ogar.mivabe.nl',
        port: 80,
        path: '/master',
        method: 'POST'
    }, 'application/x-www-form-urlencoded', data);
    
    // c0nsume.me
    trackerRequest({
        host: 'c0nsume.me',
        port: 80,
        path: '/tracker.php',
        method: 'POST'
    }, 'application/x-www-form-urlencoded', data);
};

// Custom prototype function
WebSocket.prototype.sendPacket = function(packet) {
    if (packet == null) return;
    if (this.readyState == WebSocket.OPEN) {
        if (this._socket.writable != null && !this._socket.writable) {
            return;
        }
        var buffer = packet.build(this.playerTracker.socket.packetHandler.protocol);
        if (buffer != null) {
            this.send(buffer, { binary: true });
        }
    } else {
        this.readyState = WebSocket.CLOSED;
        this.emit('close');
    }
};

function trackerRequest(options, type, body) {
    if (options.headers == null) options.headers = {};
    options.headers['user-agent'] = 'MultiOgar' + this.version;
    options.headers['content-type'] = type;
    options.headers['content-length'] = body == null ? 0 : Buffer.byteLength(body, 'utf8');
    var req = http.request(options, function(res) {
        if (res.statusCode != 200) {
            Logger.writeError("[Tracker][" + options.host + "]: statusCode = " + res.statusCode);
            return;
        }
        res.setEncoding('utf8');
    });
    req.on('error', function(err) {
        Logger.writeError("[Tracker][" + options.host + "]: " + err);
    });
    req.shouldKeepAlive = false;
    req.on('close', function() {
        req.destroy();
    });
    req.write(body);
    req.end();
}
