// Imports
var GameMode = require('../gamemodes');
var Logger = require('./Logger');
var Entity = require('../entity');

function Commands() {
    this.list = {}; // Empty
}

module.exports = Commands;

// Utils
var fillChar = function(data, char, fieldLength, rTL) {
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    } else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};

// Commands
Commands.list = {
    help: function(gameServer, split) {
       Logger.print("                       ┌────────────────────────────┐                       \n"+
                    "                       │ LIST OF AVAILABLE COMMANDS │                       \n"+
                    "┌──────────────────────┴────────────────────────────┴──────────────────────┐\n"+
                    "│                         ----Players and AI----                           │\n"+
                    "│                                                                          │\n"+
                    "│ playerlist                   │ Get list of players, bots, ID's, etc      │\n"+
                    "│ minion [PlayerID] [#] [name] │ Adds suicide minions to the server        │\n"+
                    "│ addbot [number]              │ Adds bots to the server                   │\n"+
                    "│ kickbot [number]             │ Kick a number of bots                     │\n"+
                    "│ kick [PlayerID]              │ Kick player or bot by client ID           │\n"+
                    "│ kickall                      │ Kick all players and bots                 │\n"+
                    "│ kill [PlayerID]              │ Kill cell(s) by client ID                 │\n"+
                    "│ killall                      │ Kill everyone                             │\n"+
                    "│                                                                          │\n"+
                    "│                          ----Player Commands----                         │\n"+
                    "│                                                                          │\n"+
                    "│ spawn [entity] [pos] [mass]  │ Spawns an entity                          │\n"+
                    "│ mass [PlayerID] [mass]       │ Set cell(s) mass by client ID             │\n"+
                    "│ merge [PlayerID]             │ Merge all client's cells                  │\n"+
                    "│ spawnmass [PlayerID] [mass]  │ Sets a players spawn mass                 │\n"+
                    "│ freeze [PlayerID]            │ Freezes a player                          │\n"+
                    "│ speed [PlayerID]             │ Sets a players base speed                 │\n"+
                    "│ color [PlayerID] [R] [G] [B] │ Set cell(s) color by client ID            │\n"+
                    "│ name [PlayerID] [name]       │ Change cell(s) name by client ID          │\n"+
                    "│ skin [PlayerID] [string]     │ Change cell(s) skin by client ID          │\n"+
                    "│ rec [PlayerID]               │ Gives a player instant-recombine          │\n"+
                    "│ split [PlayerID] [Amount]    │ Forces a player to split                  │\n"+
                    "│ tp [X] [Y]                   │ Teleports player(s) to XY coordinates     │\n"+
                    "│ replace [PlayerID] [entity]  │ Replaces a player with an entity          │\n"+
                    "│ pop [PlayerID]               │ Pops a player with a virus                │\n"+
                    "| explode [PlayerID]           | Explodes a player into ejected mass       |\n"+
                    "│                                                                          │\n"+
                    "│                          ----Server Commands----                         │\n"+
                    "│                                                                          │\n"+
                    "│ pause                        │ Pause game, freeze all nodes              │\n"+
                    "│ board [string] [string] ...  │ Set scoreboard text                       │\n"+
                    "│ change [setting] [value]     │ Change specified settings                 │\n"+
                    "│ reload                       │ Reload config file and banlist            │\n"+
                    "│ ban [PlayerID │ IP]          │ Bans a player(s) IP                       │\n"+
                    "│ unban [IP]                   │ Unbans an IP                              │\n"+
                    "│ banlist                      │ Get list of banned IPs.                   │\n"+
                    "│ mute [PlayerID]              │ Mute player from chat                     │\n"+
                    "│ unmute [PlayerID]            │ Unmute player from chat                   │\n"+
                    "| lms                          | Starts/ends last man standing             |\n"+
                    "│                                                                          │\n"+
                    "│                          ----Miscellaneous----                           │\n"+
                    "│                                                                          │\n"+
                    "│ clear                        │ Clear console output                      │\n"+
                    "│ reset                        │ Removes all nodes                         │\n"+
                    "│ status                       │ Get server status                         │\n"+
                    "│ debug                        │ Get/check node lengths                    │\n"+
                    "│ exit                         │ Stop the server                           │\n"+
                    "│ calc                         │ Get size/mass from a specified value      │\n"+
                    "│                                                                          │\n"+
                    "├──────────────────────────────────────────────────────────────────────────┤\n"+
                    '│         Psst! Do "shortcuts" for a list of command shortcuts!            │\n'+
                    "└──────────────────────────────────────────────────────────────────────────┘");
    },
    shortcuts: function(gameServer, split) {
       Logger.print("                       ┌────────────────────────────┐                       \n"+
                    "                       │ LIST OF COMMAND SHORTCUTS  │                       \n"+
                    "┌──────────────────────┴──────┬─────────────────────┴──────────────────────┐\n"+
                    "│ st                          │ Alias for status                           │\n"+
                    "│ pl                          │ Alias for playerlist                       │\n"+
                    "│ m                           │ Alias for mass                             │\n"+
                    "│ sm                          │ Alias for spawnmass                        │\n"+
                    "│ ka                          │ Alias for killall                          │\n"+
                    "│ k                           │ Alias for kill                             │\n"+
                    "│ mg                          │ Alias for merge                            │\n"+
                    "│ s                           │ Alias for speed                            │\n"+
                    "│ mn                          │ Alias for minion                           │\n"+
                    "│ f                           │ Alias for freeze                           │\n"+
                    "│ ab                          │ Alias for addbot                           │\n"+
                    "│ kb                          │ Alias for kickbot                          │\n"+
                    "│ c                           │ Alias for change                           │\n"+
                    "│ n                           │ Alias for name                             │\n"+
                    "│ rep                         │ Alias for replace                          │\n"+
                    "| e                           | Alias for explode                          |\n"+
                    "└─────────────────────────────┴────────────────────────────────────────────┘");
    },
    debug: function(gameServer, split) {
        // Count client cells
        var clientCells = 0;
        for (var i in gameServer.clients) {
            clientCells += gameServer.clients[i].playerTracker.cells.length;
        }
        // Output node information
       Logger.print("Clients:        " + fillChar(gameServer.clients.length, " ", 4, true) + " / " + gameServer.config.serverMaxConnections + " + bots"+"\n"+
                    "Total nodes:" + fillChar(gameServer.nodes.length, " ", 8, true)+"\n"+
                    "- Client cells: " + fillChar(clientCells, " ", 4, true) + " / " + (gameServer.clients.length * gameServer.config.playerMaxCells)+"\n"+
                    "- Ejected cells:" + fillChar(gameServer.nodesEjected.length, " ", 4, true)+"\n"+
                    "- Food:        " + fillChar(gameServer.nodesFood.length, " ", 4, true) + " / " + gameServer.config.foodMaxAmount+"\n"+
                    "- Viruses:      " + fillChar(gameServer.nodesVirus.length, " ", 4, true) + " / " + gameServer.config.virusMaxAmount+"\n"+
                    "Moving nodes:   " + fillChar(gameServer.movingNodes.length, " ", 4, true)+"\n"+
                    "Quad nodes:     " + fillChar(scanNodeCount(gameServer.quadTree), " ", 4, true)+"\n"+
                    "Quad items:     " + fillChar(scanItemCount(gameServer.quadTree), " ", 4, true));
    },
    reset: function(gameServer, split) {
        Logger.warn("Removed " + gameServer.nodes.length + " nodes");
        // Remove all nodes in the entire universe
        while (gameServer.nodes.length)
            gameServer.removeNode(gameServer.nodes[0]);
        while (gameServer.nodesEjected.length)
            gameServer.removeNode(gameServer.nodesEjected[0]);
        while (gameServer.nodesFood.length)
            gameServer.removeNode(gameServer.nodesFood[0]);
        while (gameServer.nodesVirus.length)
            gameServer.removeNode(gameServer.nodesVirus[0]);
        Commands.list.killall(gameServer, split);
    },
    minion: function(gameServer, split) {
        var id = parseInt(split[1]);
        var add = parseInt(split[2]);
        var name = split.slice(3, split.length).join(' ');
            
        // Error! ID is NaN
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player id!");
            return;
        }
        
        // Find ID specified and add/remove minions for them
        for (var i in gameServer.clients) {
            var client = gameServer.clients[i].playerTracker;
            
            if (client.pID == id) {
                // Remove minions
                if (client.minionControl === true && isNaN(add)) {
                    client.minionControl = false;
                    client.miQ = 0;
                    Logger.print("Succesfully removed minions for " + getName(client._name));
                // Add minions
                } else {
                    client.minionControl = true;
                    // Add minions for client
                    if (isNaN(add)) add = 1; 
                    for (var i = 0; i < add; i++) {
                        gameServer.bots.addMinion(client, name);
                    }
                    Logger.print("Added " + add + " minions for " + getName(client._name));
                }
                break;
            }
        }
    },
    addbot: function(gameServer, split) {
        var add = parseInt(split[1]);
        if (isNaN(add)) {
            add = 1; // Adds 1 bot if user doesnt specify a number
        }
        
        for (var i = 0; i < add; i++) {
            gameServer.bots.addBot();
        }
        Logger.print("Added " + add + " player bots");
    },
    ban: function(gameServer, split) {
        // Error message
        var logInvalid = "Please specify a valid player ID or IP address!";
        
        if (split[1] === null || typeof split[1] == "undefined") {
            // If no input is given; added to avoid error
            Logger.warn(logInvalid);
            return;
        }
        
        if (split[1].indexOf(".") >= 0) {
            // If input is an IP address
            var ip = split[1];
            var ipParts = ip.split(".");
            
            // Check for invalid decimal numbers of the IP address
            for (var i in ipParts) {
                if (i > 1 && ipParts[i] == "*") {
                    // mask for sub-net
                    continue;
                }
                // If not numerical or if it's not between 0 and 255
                if (isNaN(ipParts[i]) || ipParts[i] < 0 || ipParts[i] >= 256) {
                    Logger.warn(logInvalid);
                    return;
                }
            }
            ban(gameServer, split, ip);
            return;
        }
        // if input is a Player ID
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            // If not numerical
            Logger.warn(logInvalid);
            return;
        }
        var ip = null;
        for (var i in gameServer.clients) {
            var client = gameServer.clients[i];
            if (!client || !client.isConnected)
                continue;
            if (client.playerTracker.pID == id) {
                ip = client._socket.remoteAddress;
                break;
            }
        }
        if (ip) ban(gameServer, split, ip);
        else Logger.warn("Player ID " + id + " not found!");
    },
    banlist: function(gameServer, split) {
        Logger.print("Showing " + gameServer.ipBanList.length + " banned IPs: ");
        Logger.print(" IP              | IP ");
        Logger.print("───────────────────────────────────");
                      
        for (var i = 0; i < gameServer.ipBanList.length; i += 2) {
            Logger.print(" " + fillChar(gameServer.ipBanList[i], " ", 15) + " | " +
                    (gameServer.ipBanList.length === i + 1 ? "" : gameServer.ipBanList[i + 1])
            );
        }
    },
    kickbot: function(gameServer, split) {
        var toRemove = parseInt(split[1]);
        if (isNaN(toRemove)) {
            // Kick all bots if user doesnt specify a number
            toRemove = gameServer.clients.length; 
        }
        var removed = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            if (gameServer.clients[i].isConnected != null) 
                continue; // verify that the client is a bot
            gameServer.clients[i].close();
            removed++;
            if (removed >= toRemove)
                break;
        }
        if (!removed)
            Logger.warn("Cannot find any bots");
        else if (toRemove == removed)
            Logger.warn("Kicked " + removed + " bots");
        else
            Logger.warn("Only " + removed + " bots were kicked");
    },
    board: function(gameServer, split) {
        var newLB = [];
        var reset = split[1];
        
        for (var i = 1; i < split.length; i++) {
            if (split[i]) newLB[i - 1] = split[i];
            else newLB[i - 1] = " ";
        }
        
        // Clears the update leaderboard function and replaces it with our own
        gameServer.gameMode.packetLB = 48;
        gameServer.gameMode.specByLeaderboard = false;
        gameServer.gameMode.updateLB = function (gameServer) {
            gameServer.leaderboard = newLB;
            gameServer.leaderboardType = 48;
        };
        if (reset != "reset") {
            Logger.print("Successfully changed leaderboard values");
            Logger.print('Do "board reset" to reset leaderboard');
        } else {
            // Gets the current gamemode
            var gm = GameMode.get(gameServer.gameMode.ID);
        
            // Replace functions
            gameServer.gameMode.packetLB = gm.packetLB;
            gameServer.gameMode.updateLB = gm.updateLB;
            Logger.print("Successfully reset leaderboard");
        }
    },
    change: function(gameServer, split) {
        if (split.length < 3) {
            Logger.warn("Invalid command arguments");
            return;
        }
        var key = split[1];
        var value = split[2];
        
        // Check if int/float
        if (value.indexOf('.') != -1) {
            value = parseFloat(value);
        } else {
            value = parseInt(value);
        }
        
        if (value == null || isNaN(value)) {
            Logger.warn("Invalid value: " + value);
            return;
        }
        if (!gameServer.config.hasOwnProperty(key)) {
            Logger.warn("Unknown config value: " + key);
            return;
        }
        gameServer.config[key] = value;
        
        // update/validate
        gameServer.config.playerMinSize = Math.max(32, gameServer.config.playerMinSize);
        Logger.setVerbosity(gameServer.config.logVerbosity);
        Logger.setFileVerbosity(gameServer.config.logFileVerbosity);
        Logger.print("Set " + key + " = " + gameServer.config[key]);
    },
    clear: function() {
        process.stdout.write("\u001b[2J\u001b[0;0H");
    },
    color: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        // Get colors
        var color = { r: 0, g: 0, b: 0 };
        color.r = Math.max(Math.min(parseInt(split[2]), 255), 0);
        color.g = Math.max(Math.min(parseInt(split[3]), 255), 0);
        color.b = Math.max(Math.min(parseInt(split[4]), 255), 0);
        
        // Sets color to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                client.setColor(color); // Set color
                for (var j in client.cells) {
                    client.cells[j].setColor(color);
                }
                break;
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
        Logger.print("Changed " + getName(client._name) + "'s color to: " + color.r + ", " + color.g + ", " + color.b);
    },
    exit: function(gameServer, split) {
        Logger.warn("Closing server...");
        gameServer.wsServer.close();
        process.exit(1);
    },
    kick: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        // kick player
        var count = 0;
        gameServer.clients.forEach(function (socket) {
            if (socket.isConnected === false)
               return;
            if (id !== 0 && socket.playerTracker.pID != id)
                return;
            // remove player cells
            Commands.list.kill(gameServer, split);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = getName(socket.playerTracker._name);
            Logger.print("Kicked \"" + name + "\"");
            gameServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
        if (count) return;
        if (!id) Logger.warn("No players to kick!");
        else Logger.warn("That player ID (" + id + ") is non-existant!");
    },
    mute: function(gameServer, args) {
        if (!args || args.length < 2) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var player = playerById(id, gameServer);
        if (!player) {
            Logger.warn("That player ID (" + id + ") is non-existant!");
            return;
        }
        if (player.isMuted) {
            Logger.warn("That player with ID (" + id + ") is already muted!");
            return;
        }
        Logger.print("Player \"" + getName(player._name) + "\" was muted");
        player.isMuted = true;
    },
    unmute: function(gameServer, args) {
        if (!args || args.length < 2) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var player = playerById(id, gameServer);
        if (player === null) {
            Logger.warn("That player ID (" + id + ") is non-existant!");
            return;
        }
        if (!player.isMuted) {
            Logger.warn("Player with id=" + id + " already not muted!");
            return;
        }
        Logger.print("Player \"" + getName(player._name) + "\" was unmuted");
        player.isMuted = false;
    },
    kickall: function(gameServer, split) {
        this.id = 0; //kick ALL players
        // kick player
        var count = 0;
        gameServer.clients.forEach(function (socket) {
            if (socket.isConnected === false)
               return;
            if (this.id != 0 && socket.playerTracker.pID != this.id)
                return;
            // remove player cells
            Commands.list.killall(gameServer, split);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = getName(socket.playerTracker._name);
            Logger.print("Kicked \"" + name + "\"");
            gameServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
      
        if (count) return;
        if (!this.id) Logger.warn("No players to kick!");
        else Logger.warn("That player ID (" + this.id + ") is non-existant!");
    },
    kill: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var count = 0;
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                var len = client.cells.length;
                for (var j = 0; j < len; j++) {
                    gameServer.removeNode(client.cells[0]);
                    count++;
                }
                
                Logger.print("Killed " + getName(client._name) + " and removed " + count + " cells");
                break;
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    killall: function(gameServer, split) {
        var count = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            var playerTracker = gameServer.clients[i].playerTracker;
            while (playerTracker.cells.length > 0) {
                gameServer.removeNode(playerTracker.cells[0]);
                count++;
            }
        }
        if (this.id) Logger.print("Removed " + count + " cells");
    },
    mass: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var amount = parseInt(split[2]);
        if (isNaN(amount)) {
            Logger.warn("Please specify a valid number");
            return;
        }
        var size = Math.sqrt(amount * 100);
        
        // Sets mass to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                for (var j in client.cells) {
                    client.cells[j].setSize(size);
                }
                Logger.print("Set mass of " + getName(client._name) + " to " + (size * size / 100).toFixed(3));
                break;
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    spawnmass: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var amount = Math.max(parseInt(split[2]), 9);
        var size = Math.sqrt(amount * 100);
        if (isNaN(amount)) {
            Logger.warn("Please specify a valid mass!");
            return;
        }

        // Sets spawnmass to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.spawnmass = size;
                Logger.print("Set spawnmass of "+ getName(client._name) + " to " + (size * size / 100).toFixed(3));
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },   
    speed: function(gameServer, split) {
        var id = parseInt(split[1]);
        var speed = parseInt(split[2]);
        if (isNaN(id)) {
            Logger.print("Please specify a valid player ID!");
            return;
        }
        
        if (isNaN(speed)) {
            Logger.print("Please specify a valid speed!");
            return;
        }

        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.customspeed = speed;
                // override getSpeed function from PlayerCell
                Entity.PlayerCell.prototype.getSpeed = function (dist) {
                    var speed = 2.2 * Math.pow(this._size, -0.439);
                    speed = this.owner.customspeed ?
                    speed * 40 * this.owner.customspeed : // Set by command
                    speed * 40 * this.gameServer.config.playerSpeed;
                    return Math.min(dist, speed) / dist;
                };
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
        Logger.print("Set base speed of " + getName(client._name) + " to " + speed);
    },
    merge: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // Find client with same ID as player entered
        for (var i = 0; i < gameServer.clients.length; i++) {
            if (id == gameServer.clients[i].playerTracker.pID) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                if (client.cells.length == 1) return Logger.warn("Client already has one cell!");
                // Set client's merge override
                client.mergeOverride = !client.mergeOverride;
                if (client.mergeOverride) Logger.print(getName(client._name) + " is now force merging");
                else Logger.print(getName(client._name) + " isn't force merging anymore");
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    rec: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // set rec for client
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.rec = !client.rec;
                if (client.rec) Logger.print(getName(client._name) + " is now in rec mode!");
                else Logger.print(getName(client._name) + " is no longer in rec mode");
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    split: function(gameServer, split) {
        var id = parseInt(split[1]);
        var count = parseInt(split[2]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        if (isNaN(count)) {
            Logger.print("Split player 4 times");
            count = 4;
        }
        if (count > gameServer.config.playerMaxCells) {
            Logger.print("Split player to playerMaxCells");
            count = gameServer.config.playerMaxCells;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                for (var i = 0; i < count; i++) {
                    gameServer.splitCells(client);
                }
                Logger.print("Forced " + getName(client._name) + " to split " + count + " times");
                break;
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    name: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var name = split.slice(2, split.length).join(' ');
        if (typeof name == 'undefined') {
            Logger.warn("Please type a valid name");
            return;
        }
        
        // Change name
        for (var i = 0; i < gameServer.clients.length; i++) {
            var client = gameServer.clients[i].playerTracker;
            if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
            if (client.pID == id) {
                Logger.print("Changing " + getName(client._name) + " to " + name);
                client.setName(name);
                return;
            }
        }
        
        // Error
        Logger.warn("That player ID (" + id + ") is non-existant!");
    },
    skin: function(gameServer, args) {
        if (!args || args.length < 3) {
            Logger.warn("Please specify a valid player ID and skin name!");
            return;
        }
        var id = parseInt(args[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var skin = args[2].trim();
        if (!skin) {
            Logger.warn("Please specify skin name!");
        }
        var player = playerById(id, gameServer);
        if (!player) {
            Logger.warn("That player ID (" + id + ") is non-existant!");
            return;
        }
        if (player.cells.length) {
            Logger.warn("Player is alive, skin will not be applied to existing cells");
        }
        Logger.print("Player \"" + getName(player._name) + "\"'s skin is changed to " + skin);
        player.setSkin(skin);
    },
    unban: function(gameServer, split) {
        if (split.length < 2 || !split[1] || split[1].trim().length < 1) {
            Logger.warn("Please specify a valid IP!");
            return;
        }
        var ip = split[1].trim();
        var index = gameServer.ipBanList.indexOf(ip);
        if (index < 0) {
            Logger.warn("IP " + ip + " is not in the ban list!");
            return;
        }
        gameServer.ipBanList.splice(index, 1);
        saveIpBanList(gameServer);
        Logger.print("Unbanned IP: " + ip);
    },
    playerlist: function(gameServer, split) {
        if (!gameServer.clients.length) return Logger.warn("No bots or players are currently connected to the server!");
        Logger.print("\nCurrent players: " + gameServer.clients.length);
        Logger.print('Do "playerlist m" or "pl m" to list minions\n');
        Logger.print(" ID     | IP              | P | CELLS | SCORE  |   POSITION   | " + fillChar('NICK', ' ', gameServer.config.playerMaxNickLength) + " "); // Fill space
        Logger.print(fillChar('', '─', ' ID     | IP              | CELLS | SCORE  |   POSITION   |   |  '.length + gameServer.config.playerMaxNickLength));
        var sockets = gameServer.clients.slice(0);
        sockets.sort(function (a, b) { return a.playerTracker.pID - b.playerTracker.pID; });
        for (var i = 0; i < sockets.length; i++) {
            var socket = sockets[i];
            var client = socket.playerTracker;
            var type = split[1];
            
            // ID with 3 digits length
            var id = fillChar((client.pID), ' ', 6, true);
            
            // Get ip (15 digits length)
            var ip = client.isMi ? "[MINION]" : "[BOT]";
            if (socket.isConnected && !client.isMi) {
                ip = socket.remoteAddress;
            } else if (client.isMi && type != "m") {
                continue; // do not list minions
            }
            ip = fillChar(ip, ' ', 15);
            
            // Get name and data
            var protocol = gameServer.clients[i].packetHandler.protocol;
            if (!protocol) protocol = "?";
            var nick = '',
                cells = '',
                score = '',
                position = '',
                data = '';
            if (socket.closeReason != null) {
                // Disconnected
                var reason = "[DISCONNECTED] ";
                if (socket.closeReason.code)
                    reason += "[" + socket.closeReason.code + "] ";
                if (socket.closeReason.message)
                    reason += socket.closeReason.message;
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + reason);
            } else if (!socket.packetHandler.protocol && socket.isConnected && !client.isMi) {
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + "[CONNECTING]");
            } else if (client.spectate) {
                nick = "in free-roam";
                if (!client.freeRoam) {
                    var target = client.getSpecTarget();
                    if (target) nick = getName(target._name);
                }
                data = fillChar("SPECTATING: " + nick, '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            } else if (client.cells.length) {
                nick = fillChar(getName(client._name), ' ', gameServer.config.playerMaxNickLength);
                cells = fillChar(client.cells.length, ' ', 5, true);
                score = fillChar(getScore(client) >> 0, ' ', 6, true);
                position = fillChar(getPos(client).x >> 0, ' ', 5, true) + ', ' + fillChar(getPos(client).y >> 0, ' ', 5, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + cells + " | " + score + " | " + position + " | " + nick);
            } else {
                // No cells = dead player or in-menu
                data = fillChar('DEAD OR NOT PLAYING', '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            }
        }
    },
    pause: function(gameServer, split) {
        gameServer.run = !gameServer.run; // Switches the pause state
        var s = gameServer.run ? "Unpaused" : "Paused";
        Logger.print(s + " the game.");
    },
    freeze: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.print("Please specify a valid player ID!");
            return;
        }

        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                // set frozen state
                client.frozen = !client.frozen;
                if (client.frozen) Logger.print("Froze " + getName(client._name));
                else Logger.print("Unfroze " + getName(client._name));
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    reload: function(gameServer, split) {
        gameServer.loadConfig();
        gameServer.loadIpBanList();
        Logger.print("Reloaded the config file succesully");
    },
    status: function(gameServer, split) {
        var ini = require('./ini.js');
        // Get amount of humans/bots
        var humans = 0,
            bots = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            if ('_socket' in gameServer.clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        
        Logger.print("Connected players: " + gameServer.clients.length + "/" + gameServer.config.serverMaxConnections);
        Logger.print("Players: " + humans + " - Bots: " + bots);
        Logger.print("Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        Logger.print("Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        Logger.print("Current game mode: " + gameServer.gameMode.name);
        Logger.print("Current update time: " + gameServer.updateTimeAvg.toFixed(3) + " [ms]  (" + ini.getLagMessage(gameServer.updateTimeAvg) + ")");
    },
    tp: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // Make sure the input values are numbers
        var pos = {
            x: parseInt(split[2]),
            y: parseInt(split[3])
        };
        if (isNaN(pos.x) || isNaN(pos.y)) {
            Logger.warn("Invalid coordinates");
            return;
        }
        
        // Spawn
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                for (var j in client.cells) {
                    client.cells[j].position.x = pos.x;
                    client.cells[j].position.y = pos.y;
                    gameServer.updateNodeQuad(client.cells[j]);
                }
                Logger.print("Teleported " + getName(client._name) + " to (" + pos.x + " , " + pos.y + ")");
                break;
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    spawn: function(gameServer, split) {
        var ent = split[1];
        if (ent != "virus" && ent != "food" && ent != "mothercell") {
            Logger.warn("Please specify either virus, food, or mothercell");
            return;
        }
    
        var pos = {
            x: parseInt(split[2]),
            y: parseInt(split[3])
        };
        var mass = parseInt(split[4]);
        
        // Make sure the input values are numbers
        if (isNaN(pos.x) || isNaN(pos.y)) {
            Logger.warn("Invalid coordinates");
            return;
        }
        
        // Start size for each entity 
        if (ent == "virus") {
            var size = gameServer.config.virusMinSize;
        } else if (ent == "mothercell") {
            size = gameServer.config.virusMinSize * 2.5;
        } else if (ent == "food") {
            size = gameServer.config.foodMinMass;
        }
        
        if (!isNaN(mass)) {
            size = Math.sqrt(mass * 100);
        }
        
        // Spawn for each entity
        if (ent == "virus") {
            var virus = new Entity.Virus(gameServer, null, pos, size);
            gameServer.addNode(virus);
            Logger.print("Spawned 1 virus at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "food") {
            var food = new Entity.Food(gameServer, null, pos, size);
            food.setColor(gameServer.getRandomColor());
            gameServer.addNode(food);
            Logger.print("Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "mothercell") {
            var mother = new Entity.MotherCell(gameServer, null, pos, size);
            gameServer.addNode(mother);
            Logger.print("Spawned 1 mothercell at (" + pos.x + " , " + pos.y + ")");
        }
    },
    replace: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var ent = split[2];
        if (ent != "virus" && ent != "food" && ent != "mothercell") {
            Logger.warn("Please specify either virus, food, or mothercell");
            return;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                while (client.cells.length > 0) {
                    var cell = client.cells[0];
                    gameServer.removeNode(cell);
                    // replace player with entity
                    if (ent == "virus") {
                        var virus = new Entity.Virus(gameServer, null, cell.position, cell._size);
                        gameServer.addNode(virus);
                    } else if (ent == "food") {
                        var food = new Entity.Food(gameServer, null, cell.position, cell._size);
                        food.setColor(gameServer.getRandomColor());
                        gameServer.addNode(food);
                    } else if (ent == "mothercell") {
                        var mother = new Entity.MotherCell(gameServer, null, cell.position, cell._size);
                        gameServer.addNode(mother);
                    }
                }
            }
        }
        if (ent == "virus") {
            Logger.print("Replaced " + getName(client._name) + " with a virus");
        } else if (ent == "food") {
            Logger.print("Replaced " + getName(client._name) + " with a food cell");
        } else if (ent == "mothercell") {
            Logger.print("Replaced " + getName(client._name) + " with a mothercell");
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    pop: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                var virus = new Entity.Virus(gameServer, null, client.centerPos, gameServer.config.virusMinSize);
                gameServer.addNode(virus);
                Logger.print("Popped " + getName(client._name));
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    explode: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var i = 0; i < client.cells.length; i++) {
                    var cell = client.cells[i];
                    while (cell._size > gameServer.config.playerMinSize) {
                        // remove mass from parent cell
                        var angle = 6.28 * Math.random();
                        var loss = gameServer.config.ejectSizeLoss;
                        var size = cell._sizeSquared - loss * loss;
                        cell.setSize(Math.sqrt(size));
                        // explode the cell
                        var pos = {
                            x: cell.position.x + angle,
                            y: cell.position.y + angle
                        };
                        var ejected = new Entity.EjectedMass(gameServer, null, pos, gameServer.config.ejectSize);
                        ejected.setColor(cell.color);
                        ejected.setBoost(gameServer.config.ejectVelocity * Math.random(), angle);
                        gameServer.addNode(ejected);
                    }
                    cell.setSize(gameServer.config.playerMinSize);
                }
                if (!client.cells.length) return Logger.warn("That player is either dead or not playing!");
                Logger.print("Successfully exploded " + getName(client._name));
            }
        }
        if (client == null) return void Logger.warn("That player ID is non-existant!");
    },
    lms: function(gameServer, split) {
        gameServer.disableSpawn = !gameServer.disableSpawn;
        var s = gameServer.disableSpawn ? "Started" : "Ended";
        Logger.print(s + " last man standing");
    },
    calc: function(gameServer, split) {
        var num = parseInt(split[1]);
        if (isNaN(num)) {
            Logger.warn("Please specify a valid number!");
            return;
        }
        var to = split[2];
        if (to != "toMass" && to != "toSize") {
            Logger.warn('Please specify either "toMass" or "toSize"');
            return;
        }
        if (to == "toMass") Logger.print("The specified size is " + num * num / 100 + " in mass");
        else Logger.print("The specified mass is " + (Math.sqrt(num * 100)).toFixed(2) + " in size");
    },
    
    // Aliases for commands
    
    st: function(gameServer, split) { // Status
        Commands.list.status(gameServer, split);
    },
    pl: function(gameServer, split) { // Playerlist
        Commands.list.playerlist(gameServer, split);
    },
    m: function(gameServer, split) { // Mass
        Commands.list.mass(gameServer, split);
    },
    mn: function(gameServer, split) { // Minion
        Commands.list.minion(gameServer, split);
    },
    sm: function(gameServer, split) { // Spawnmass
        Commands.list.spawnmass(gameServer, split);
    },
    ka: function(gameServer, split) { // Killall
        Commands.list.killall(gameServer, split);
    },
    k: function(gameServer, split) { // Kill
        Commands.list.kill(gameServer, split);
    },
    mg: function(gameServer, split) { // Merge
        Commands.list.merge(gameServer, split);
    },
    s: function(gameServer, split) { // Speed
        Commands.list.speed(gameServer, split);
    },
    f: function(gameServer, split) { // Freeze
        Commands.list.freeze(gameServer, split);
    },
    ab: function(gameServer, split) { // Addbot
        Commands.list.addbot(gameServer, split); 
    },
    kb: function(gameServer, split) { // Kickbot
        Commands.list.kickbot(gameServer, split);
    },
    c: function(gameServer, split) { // Change
        Commands.list.change(gameServer, split);
    },
    n: function(gameServer, split) { // Name
        Commands.list.name(gameServer, split);
    },
    rep: function(gameServer, split) {
        Commands.list.replace(gameServer, split);
    },
    e: function(gameServer, split) {
        Commands.list.explode(gameServer, split);
    }
};

// functions from GameServer

function playerById(id, gameServer) {
    if (!id) return null;
    for (var i = 0; i < gameServer.clients.length; i++) {
        var playerTracker = gameServer.clients[i].playerTracker;
        if (playerTracker.pID == id) {
            return playerTracker;
        }
    }
    return null;
}

function saveIpBanList(gameServer) {
    var fs = require("fs");
    try {
        var blFile = fs.createWriteStream('../src/ipbanlist.txt');
        // Sort the blacklist and write.
        gameServer.ipBanList.sort().forEach(function (v) {
            blFile.write(v + '\n');
        });
        blFile.end();
        Logger.info(gameServer.ipBanList.length + " IP ban records saved.");
    } catch (err) {
        Logger.error(err.stack);
        Logger.error("Failed to save " + '../src/ipbanlist.txt' + ": " + err.message);
    }
}

function ban(gameServer, split, ip) {
    var ipBin = ip.split('.');
    if (ipBin.length != 4) {
        Logger.warn("Invalid IP format: " + ip);
        return;
    }
    gameServer.ipBanList.push(ip);
    if (ipBin[2] == "*" || ipBin[3] == "*") {
        Logger.print("The IP sub-net " + ip + " has been banned");
    } else {
        Logger.print("The IP " + ip + " has been banned");
    }
    gameServer.clients.forEach(function (socket) {
        // If already disconnected or the ip does not match
        if (!socket || !socket.isConnected || !gameServer.checkIpBan(ip) || socket.remoteAddress != ip)
            return;
        // remove player cells
        Commands.list.kill(gameServer, split);
        // disconnect
        socket.close(null, "Banned from server");
        var name = getName(socket.playerTracker._name);
        Logger.print("Banned: \"" + name + "\" with Player ID " + socket.playerTracker.pID);
        gameServer.sendChatMessage(null, null, "Banned \"" + name + "\""); // notify to don't confuse with server bug
    }, gameServer);
    saveIpBanList(gameServer);
}

// functions from PlayerTracker

function getName(name) {
    if (!name.length) 
        name = "An unnamed cell";
    return name.trim();
}

function getScore(client) {
    var score = 0; // reset to not cause bugs
    for (var i = 0; i < client.cells.length; i++) {
        if (!client.cells[i]) continue;
        score += client.cells[i]._mass;
    }
    return score;
};

function getPos(client) {
    for (var i = 0; i < client.cells.length; i++) {
        if (!client.cells[i]) continue;
        return {
            x: client.cells[i].position.x / client.cells.length,
            y: client.cells[i].position.y / client.cells.length
        }
    }
}

// functions from QuadNode

function scanNodeCount(quad) {
    var count = 0;
    for (var i = 0; i < quad.childNodes.length; i++) {
        count += scanNodeCount(quad.childNodes[i]);
    }
    return 1 + count;
};

function scanItemCount(quad) {
    var count = 0;
    for (var i = 0; i < quad.childNodes.length; i++) {
        count += scanItemCount(quad.childNodes[i]);
    }
    return quad.items.length + count;
};
