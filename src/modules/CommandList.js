// Imports
var GameMode = require('../gamemodes');
var Logger = require('./Logger');
var Entity = require('../entity');

function Commands() {
    this.list = {}; // Empty
}

module.exports = Commands;

// Utils
var fillChar = function (data, char, fieldLength, rTL) {
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
    help: function (gameServer, split) {
        console.log("                       ╭────────────────────────────╮                       ");
        console.log("                       │ LIST OF AVAILABLE COMMANDS │                       ");
        console.log("╭──────────────────────┴────────────────────────────┴──────────────────────╮");
        console.log("|                         ----Players and AI----                           |");
        console.log("|                                                                          |");
        console.log("│ playerlist                   │ Get list of players, bots, ID's, etc      │");
        console.log("│ minion [PlayerID] [#] [name] │ Adds suicide minions to the server        │");
        console.log("│ addbot [number]              │ Adds bots to the server                   │");
        console.log("│ kickbot [number]             │ Kick a number of bots                     │");
        console.log("│ kick [PlayerID]              │ Kick player or bot by client ID           │");
        console.log("│ kickall                      │ Kick all players and bots                 │");
        console.log("│ kill [PlayerID]              │ Kill cell(s) by client ID                 │");
        console.log("│ killall                      │ Kill everyone                             │");
        console.log("|                                                                          |");
        console.log("|                          ----Player Commands----                         |");
        console.log("|                                                                          |");
        console.log("| spawn [entity] [pos] [mass]  | Spawns an entity                          |");
        console.log("│ mass [PlayerID] [mass]       │ Set cell(s) mass by client ID             │");
        console.log("│ merge [PlayerID]             │ Merge all client's cells                  │");
        console.log("│ spawnmass [PlayerID] [mass]  │ Sets a players spawn mass                 │");
        console.log("│ freeze [PlayerID]            │ Freezes a player                          │");
        console.log("│ speed [PlayerID]             │ Sets a players base speed                 │");
        console.log("│ color [PlayerID] [R] [G] [B] │ Set cell(s) color by client ID            │");
        console.log("│ name [PlayerID] [name]       │ Change cell(s) name by client ID          │");
        console.log("| skin [PlayerID] [string]     | Change cell(s) skin by client ID          |");
        console.log("│ rec [PlayerID]               │ Gives a player instant-recombine          │");
        console.log("| split [PlayerID] [Amount]    | Forces a player to split                  |");
        console.log("| tp [X] [Y]                   | Teleports player(s) to XY coordinates     |");
        console.log("| replace [PlayerID] [entity]  | Replaces a player with an entity          |");
        console.log("| pop [PlayerID]               | Pops a player with a virus                |");
        console.log("|                                                                          |");
        console.log("|                          ----Server Commands----                         |");
        console.log("|                                                                          |");
        console.log("│ pause                        │ Pause game, freeze all nodes              │");
        console.log("│ board [string] [string] ...  │ Set scoreboard text                       │");
        console.log("│ change [setting] [value]     │ Change specified settings                 │");
        console.log("│ reload                       │ Reload config file                        │");
        console.log("│ ban [PlayerID | IP]          │ Bans a player(s) IP                       │");
        console.log("│ unban [IP]                   │ Unbans an IP                              │");
        console.log("│ banlist                      │ Get list of banned IPs.                   │");
        console.log("│ mute [PlayerID]              │ Mute player from chat                     │");
        console.log("│ unmute [PlayerID]            │ Unmute player from chat                   │");
        console.log("|                                                                          |");
        console.log("|                          ----Miscellaneous----                           |");
        console.log("|                                                                          |");
        console.log("│ clear                        │ Clear console output                      │");
        console.log("| reset                        | Removes all nodes                         |");
        console.log("│ status                       │ Get server status                         │");
        console.log("| debug                        | Get/check node lengths                    |");
        console.log("│ exit                         │ Stop the server                           │");
        console.log("|                                                                          |");
        console.log("├──────────────────────────────────────────────────────────────────────────┤");
        console.log('│         Psst! Do "shortcuts" for a list of command shortcuts!            |');
        console.log("╰──────────────────────────────────────────────────────────────────────────╯");
    },
    shortcuts: function (gameServer, split) {
        console.log("                       ╭────────────────────────────╮                       ");
        console.log("                       │ LIST OF COMMAND SHORTCUTS  │                       ");
        console.log("╭──────────────────────┴──────┬─────────────────────┴──────────────────────╮");
        console.log("│ st                          │ Alias for status                           │");
        console.log("│ pl                          │ Alias for playerlist                       │");
        console.log("│ m                           │ Alias for mass                             │");
        console.log("│ sm                          │ Alias for spawnmass                        │");
        console.log("│ ka                          │ Alias for killall                          │");
        console.log("│ k                           │ Alias for kill                             │");
        console.log("│ mg                          │ Alias for merge                            │");
        console.log("│ s                           │ Alias for speed                            │");
        console.log("| mn                          | Alias for minion                           |");
        console.log("| f                           | Alias for freeze                           |");
        console.log("| ab                          | Alias for addbot                           |");
        console.log("| kb                          | Alias for kickbot                          |");
        console.log("| c                           | Alias for change                           |");
        console.log("| n                           | Alias for name                             |");
        console.log("| rep                         | Alias for replace                          |");
        console.log("╰─────────────────────────────┴────────────────────────────────────────────╯");
    },
    debug: function (gameServer, split) {
        // Count client cells
        var clientCells = 0;
        for (var i in gameServer.clients) {
            clientCells += gameServer.clients[i].playerTracker.cells.length;
        }
        // Output node information
        console.log("Clients:        " + fillChar(gameServer.clients.length, " ", 4, true) + " / " + gameServer.config.serverMaxConnections + " + bots");
        console.log("Total nodes:" + fillChar(gameServer.nodes.length, " ", 8, true));
        console.log("- Client cells: " + fillChar(clientCells, " ", 4, true) + " / " + (gameServer.clients.length * gameServer.config.playerMaxCells));
        console.log("- Ejected cells:" + fillChar(gameServer.nodesEjected.length, " ", 4, true));
        console.log("- Foods:        " + fillChar(gameServer.nodesFood.length, " ", 4, true) + " / " + gameServer.config.foodMaxAmount);
        console.log("- Viruses:      " + fillChar(gameServer.nodesVirus.length, " ", 4, true) + " / " + gameServer.config.virusMaxAmount);
        console.log("Moving nodes:   " + fillChar(gameServer.movingNodes.length, " ", 4, true));
        console.log("Quad nodes:     " + fillChar(gameServer.quadTree.scanNodeCount(), " ", 4, true));
        console.log("Quad items:     " + fillChar(gameServer.quadTree.scanItemCount(), " ", 4, true));
    },
    reset: function (gameServer, split) {
        Logger.warn("Removed " + gameServer.nodes.length + " nodes");
        for (var i = 0; i < gameServer.nodes.length; i++) {
            gameServer.removeNode(gameServer.nodes[i]);
        }
        // just to make sure the jobs done
        for (var i = 0; i < gameServer.nodesEjected.length; i++) {
            gameServer.removeNode(gameServer.nodesEjected[i]);
        }
        for (var i = 0; i < gameServer.nodesFood.length; i++) {
            gameServer.removeNode(gameServer.nodesFood[i]);
        }
        for (var i = 0; i < gameServer.nodesVirus.length; i++) {
            gameServer.removeNode(gameServer.nodesVirus[i]);
        }
        for (var i in gameServer.clients) {
            for (var i = 0; i < gameServer.clients[i].playerTracker.cells.length; i++) {
                gameServer.removeNode(gameServer.clients.playerTracker.cells[0]);
            }
        }
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
                if (client.minionControl == true && isNaN(add)) {
                    client.minionControl = false;
                    client.miQ = 0;
                    console.log("Succesfully removed minions for " + client.getFriendlyName());
                // Add minions
                } else {
                    client.minionControl = true;
                    // Add minions for client
                    if (isNaN(add)) add = 1; 
                    for (var i = 0; i < add; i++) {
                        gameServer.bots.addMinion(client, name);
                    }
                    console.log("Added " + add + " minions for " + client.getFriendlyName());
                }
                break;
            }
        }
    },
    addbot: function (gameServer, split) {
        var add = parseInt(split[1]);
        if (isNaN(add)) {
            add = 1; // Adds 1 bot if user doesnt specify a number
        }
        
        for (var i = 0; i < add; i++) {
            gameServer.bots.addBot();
        }
        console.log("Added " + add + " player bots");
    },
    ban: function (gameServer, split) {
        // Error message
        var logInvalid = "Please specify a valid player ID or IP address!";
        
        if (split[1] == null) {
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
                // TODO: Catch string "e" as it means "10^".
                if (isNaN(ipParts[i]) || ipParts[i] < 0 || ipParts[i] >= 256) {
                    Logger.warn(logInvalid);
                    return;
                }
            }
            
            if (ipParts.length != 4) {
                // an IP without 3 decimals
                Logger.warn(logInvalid);
                return;
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
        ip = null;
        for (var i in gameServer.clients) {
            var client = gameServer.clients[i];
            if (client == null || !client.isConnected)
                continue;
            if (client.playerTracker.pID == id) {
                ip = client._socket.remoteAddress;
                break;
            }
        }
        if (ip) ban(gameServer, split, ip);
        else Logger.warn("Player ID " + id + " not found!");
    },
    banlist: function (gameServer, split) {
        Logger.print("Showing " + gameServer.ipBanList.length + " banned IPs: ");
        Logger.print(" IP              | IP ");
        Logger.print("-----------------------------------");
        for (var i = 0; i < gameServer.ipBanList.length; i += 2) {
            Logger.print(" " + fillChar(gameServer.ipBanList[i], " ", 15) + " | " 
                    + (gameServer.ipBanList.length === i + 1 ? "" : gameServer.ipBanList[i + 1])
            );
        }
    },
    kickbot: function (gameServer, split) {
        var toRemove = parseInt(split[1]);
        if (isNaN(toRemove)) {
            toRemove = -1; // Kick all bots if user doesnt specify a number
        }
        if (toRemove < 1) {
            Logger.warn("Invalid argument!");
            return;
        }
        var removed = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            var socket = gameServer.clients[i];
            if (socket.isConnected != null) continue;
            socket.close();
            removed++;
            if (removed >= toRemove)
                break;
        }
        if (removed == 0)
            Logger.warn("Cannot find any bots");
        else if (toRemove == removed)
            Logger.warn("Kicked " + removed + " bots");
        else
            Logger.warn("Only " + removed + " bots were kicked");
    },
    board: function (gameServer, split) {
        var newLB = [], reset = split[1];
        for (var i = 1; i < split.length; i++) {
            if (split[i]) {
                newLB[i - 1] = split[i];
            } else {
                newLB[i - 1] = " ";
            }
        }
        
        // Clears the update leaderboard function and replaces it with our own
        gameServer.gameMode.packetLB = 48;
        gameServer.gameMode.specByLeaderboard = false;
        gameServer.gameMode.updateLB = function (gameServer) {
            gameServer.leaderboard = newLB;
            gameServer.leaderboardType = 48;
        };
        console.log("Successfully changed leaderboard values");
        console.log('Do "board reset" to reset leaderboard');
        if (reset == "reset") {
            // Gets the current gamemode
            var gm = GameMode.get(gameServer.gameMode.ID);
        
            // Replace functions
            gameServer.gameMode.packetLB = gm.packetLB;
            gameServer.gameMode.updateLB = gm.updateLB;
            console.log("Successfully reset leaderboard");
        }
    },
    change: function (gameServer, split) {
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
    clear: function () {
        process.stdout.write("\u001b[2J\u001b[0;0H");
    },
    color: function (gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var color = {
            r: 0,
            g: 0,
            b: 0
        };
        color.r = Math.max(Math.min(parseInt(split[2]), 255), 0);
        color.g = Math.max(Math.min(parseInt(split[3]), 255), 0);
        color.b = Math.max(Math.min(parseInt(split[4]), 255), 0);
        
        // Sets color to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.setColor(color); // Set color
                for (var j in client.cells) {
                    client.cells[j].setColor(color);
                }
                break;
            }
        }
    },
    exit: function (gameServer, split) {
        Logger.warn("Closing server...");
        gameServer.wsServer.close();
        process.exit(1);
    },
    kick: function (gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        // kick player
        var count = 0;
        gameServer.clients.forEach(function (socket) {
            if (socket.isConnected == false)
               return;
            if (id != 0 && socket.playerTracker.pID != id)
                return;
            // remove player cells
            socket.playerTracker.cells.forEach(function (cell) {
                gameServer.removeNode(cell);
            }, gameServer);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = socket.playerTracker.getFriendlyName();
            Logger.print("Kicked \"" + name + "\"");
            gameServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
        if (count > 0) return;
        if (id == 0)
            Logger.warn("No players to kick!");
        else
            Logger.warn("Player with ID " + id + " not found!");
    },
    mute: function (gameServer, args) {
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
        if (player == null) {
            Logger.warn("Player with id=" + id + " not found!");
            return;
        }
        if (player.isMuted) {
            Logger.warn("Player with id=" + id + " already muted!");
            return;
        }
        Logger.print("Player \"" + player.getFriendlyName() + "\" was muted");
        player.isMuted = true;
    },
    unmute: function (gameServer, args) {
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
        if (player == null) {
            Logger.warn("Player with id=" + id + " not found!");
            return;
        }
        if (!player.isMuted) {
            Logger.warn("Player with id=" + id + " already not muted!");
            return;
        }
        Logger.print("Player \"" + player.getFriendlyName() + "\" was unmuted");
        player.isMuted = false;
    },
    kickall: function (gameServer, split) {
        var id = 0; //kick ALL players
        // kick player
        var count = 0;
        gameServer.clients.forEach(function (socket) {
            if (socket.isConnected == false)
               return;
            if (id != 0 && socket.playerTracker.pID != id)
                return;
            // remove player cells
            socket.playerTracker.cells.forEach(function (cell) {
                gameServer.removeNode(cell);
            }, gameServer);
            // disconnect
            socket.close(1000, "Kicked from server");
            var name = socket.playerTracker.getFriendlyName();
            Logger.print("Kicked \"" + name + "\"");
            gameServer.sendChatMessage(null, null, "Kicked \"" + name + "\""); // notify to don't confuse with server bug
            count++;
        }, this);
        if (count > 0) return;
        if (id == 0)
            Logger.warn("No players to kick!");
        else
            Logger.warn("Player with ID " + id + " not found!");
    },
    kill: function (gameServer, split) {
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
                
                console.log("Killed " + client.getFriendlyName() + " and removed " + count + " cells");
                break;
            }
        }
    },
    killall: function (gameServer, split) {
        var count = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            var playerTracker = gameServer.clients[i].playerTracker;
            while (playerTracker.cells.length > 0) {
                gameServer.removeNode(playerTracker.cells[0]);
                count++;
            }
        }
        console.log("Removed " + count + " cells");
    },
    mass: function (gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        var amount = Math.max(parseInt(split[2]), 9);
        if (isNaN(amount)) {
            Logger.warn("Please specify a valid number");
            return;
        }
        var size = Math.sqrt(amount * 100);
        
        // Sets mass to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].setSize(size);
                }
                
                console.log("Set mass of " + client.getFriendlyName() + " to " + (size * size / 100).toFixed(3));
                break;
            }
        }
    },
    spawnmass: function (gameServer, split) {
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
                console.log("Set spawnmass of "+ client.getFriendlyName() + " to " + (size * size / 100).toFixed(3));
            }
        }
    },   
    speed: function (gameServer, split) {
        var id = parseInt(split[1]);
        var speed = parseInt(split[2]);
        if (isNaN(id)) {
            console.log("Please specify a valid player ID!");
            return;
        }
        
        if (isNaN(speed)) {
            console.log("Please specify a valid speed!");
            return;
        }

        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.customspeed = speed;
            }
        }
        console.log("Set base speed of "+ client.getFriendlyName() + " to " + speed);
    },
    merge: function (gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        var set = split[2];
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        
        // Find client with same ID as player entered
        var client;
        for (var i = 0; i < gameServer.clients.length; i++) {
            if (id == gameServer.clients[i].playerTracker.pID) {
                client = gameServer.clients[i].playerTracker;
                break;
            }
        }
        
        if (!client) {
            Logger.warn("Client is nonexistent!");
            return;
        }
        
        if (client.cells.length == 1) {
            Logger.warn("Client already has one cell!");
            return;
        }
        
        // Set client's merge override
        var state;
        if (set == "true") {
            client.mergeOverride = true;
            client.mergeOverrideDuration = 100;
            state = true;
        } else if (set == "false") {
            client.mergeOverride = false;
            client.mergeOverrideDuration = 0;
            state = false;
        } else {
            if (client.mergeOverride) {
                client.mergeOverride = false;
                client.mergeOverrideDuration = 0;
            } else {
                client.mergeOverride = true;
                client.mergeOverrideDuration = 100;
            }
            state = client.mergeOverride;
        }
        
        // Log
        if (state) console.log(client.getFriendlyName() + " is now force merging");
        else console.log(client.getFriendlyName() + " isn't force merging anymore");
    },
    rec: function (gameServer, split) {
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
                if (client.rec) console.log(client.getFriendlyName() + " is now in rec mode!");
                else console.log(client.getFriendlyName() + " is no longer in rec mode");
            }
        }
    },
    split: function (gameServer, split) {
        var id = parseInt(split[1]);
        var count = parseInt(split[2]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        if (isNaN(count)) {
            console.log("Split player 4 times");
            count = 4;
        }
        if (count > gameServer.config.playerMaxCells) {
            console.log("Split player to playerMaxCells");
            count = gameServer.config.playerMaxCells;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var i = 0; i < count; i++) {
                    gameServer.splitCells(client);
                }
                console.log("Forced " + client.getFriendlyName() + " to split " + count + " times");
                break;
            }
        }
    },
    name: function (gameServer, split) {
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
            
            if (client.pID == id) {
                console.log("Changing " + client.getFriendlyName() + " to " + name);
                client.setName(name);
                return;
            }
        }
        
        // Error
        Logger.warn("Player " + id + " was not found");
    },
    skin: function (gameServer, args) {
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
        if (player == null) {
            Logger.warn("Player with id=" + id + " not found!");
            return;
        }
        if (player.cells.length > 0) {
            Logger.warn("Player is alive, skin will not be applied to existing cells");
        }
        Logger.print("Player \"" + player.getFriendlyName() + "\"'s skin is changed to " + skin);
        player.setSkin(skin);
    },
    unban: function (gameServer, split) {
        if (split.length < 2 || split[1] == null || split[1].trim().length < 1) {
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
    playerlist: function (gameServer, split) {
        Logger.print("Current players: " + gameServer.clients.length);
        Logger.print('Do "playerlist m" or "pl m" to list minions');
        Logger.print(" ID     | IP              | P | " + fillChar('NICK', ' ', gameServer.config.playerMaxNickLength) + " | CELLS | SCORE  | POSITION    "); // Fill space
        Logger.print(fillChar('', '-', ' ID     | IP              |   |  | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength));
        var sockets = gameServer.clients.slice(0);
        sockets.sort(function (a, b) { return a.playerTracker.pID - b.playerTracker.pID; });
        for (var i = 0; i < sockets.length; i++) {
            var socket = sockets[i];
            var client = socket.playerTracker;
            var ip = (client.isMi) ? "[MINION]" : "[BOT]";
            var type = split[1];
            
            // list minions
            if (client.isMi) {
                if (typeof type == "undefined" || type == "" || type != "m") {
                    continue;
                } else if (type == "m") {
                    ip = "[MINION]";
                }
            }
            
            // ID with 3 digits length
            var id = fillChar((client.pID), ' ', 6, true);
            
            // Get ip (15 digits length)
            if (socket.isConnected != null) {
                ip = socket.remoteAddress;
            }
            ip = fillChar(ip, ' ', 15);
            var protocol = gameServer.clients[i].packetHandler.protocol;
            if (protocol == null)
                protocol = "?";
            // Get name and data
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
            } else if (!socket.packetHandler.protocol && socket.isConnected) {
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + "[CONNECTING]");
            } else if (client.spectate) {
                nick = "in free-roam";
                if (!client.freeRoam) {
                    var target = client.getSpectateTarget();
                    if (target != null) {
                        nick = target.getFriendlyName();
                    }
                }
                data = fillChar("SPECTATING: " + nick, '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            } else if (client.cells.length > 0) {
                nick = fillChar(client.getFriendlyName(), ' ', gameServer.config.playerMaxNickLength);
                cells = fillChar(client.cells.length, ' ', 5, true);
                score = fillChar((client.getScore() / 100) >> 0, ' ', 6, true);
                position = fillChar(client.centerPos.x >> 0, ' ', 5, true) + ', ' + fillChar(client.centerPos.y >> 0, ' ', 5, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + nick + " | " + cells + " | " + score + " | " + position);
            } else {
                // No cells = dead player or in-menu
                data = fillChar('DEAD OR NOT PLAYING', '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                Logger.print(" " + id + " | " + ip + " | " + protocol + " | " + data);
            }
        }
    },
    pause: function (gameServer, split) {
        gameServer.run = !gameServer.run; // Switches the pause state
        var s = gameServer.run ? "Unpaused" : "Paused";
        console.log(s + " the game.");
    },
    freeze: function (gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log("Please specify a valid player ID!");
            return;
        }

        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.frozen = !client.frozen;
                if (client.frozen) {
                    console.log("Froze " + client.getFriendlyName());
                } else {
                    console.log("Unfroze " + client.getFriendlyName());
                }
                break;
            }
        }
    },
    reload: function (gameServer, split) {
        gameServer.loadConfig();
        gameServer.loadIpBanList();
        console.log("Reloaded the config file succesully");
    },
    status: function (gameServer, split) {
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
        
        console.log("Connected players: " + gameServer.clients.length + "/" + gameServer.config.serverMaxConnections);
        console.log("Players: " + humans + " - Bots: " + bots);
        console.log("Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        console.log("Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        console.log("Current game mode: " + gameServer.gameMode.name);
        console.log("Current update time: " + gameServer.updateTimeAvg.toFixed(3) + " [ms]  (" + ini.getLagMessage(gameServer.updateTimeAvg) + ")");
    },
    tp: function (gameServer, split) {
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
                for (var j in client.cells) {
                    client.cells[j].setPosition(pos);
                    gameServer.updateNodeQuad(client.cells[j]);
                }
                
                console.log("Teleported " + client.getFriendlyName() + " to (" + pos.x + " , " + pos.y + ")");
                break;
            }
        }
    },
    spawn: function (gameServer, split) {
        var ent = split[1];
        if (typeof ent == "undefined" || ent == "" || (ent != "virus" && ent != "food" && ent != "mothercell")) {
            Logger.warn("Please specify either virus, food, or mothercell");
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
            console.log("Spawned 1 virus at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "food") {
            var food = new Entity.Food(gameServer, null, pos, size);
            food.setColor(gameServer.getRandomColor());
            gameServer.addNode(food);
            console.log("Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
        } else if (ent == "mothercell") {
            var mother = new Entity.MotherCell(gameServer, null, pos, size);
            gameServer.addNode(mother);
            console.log("Spawned 1 mothercell at (" + pos.x + " , " + pos.y + ")");
        }
    },
    replace: function (gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        var ent = split[2];
        if (typeof ent == "undefined" || ent == "" || (ent != "virus" && ent != "food" && ent != "mothercell")) {
            Logger.warn("Please specify either virus, food, or mothercell");
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                while (client.cells.length > 0) {
                    var cell = client.cells[0];
                    gameServer.removeNode(cell);
                    // replace player with entity
                    if (ent == "virus") {
                        var virus = new Entity.Virus(gameServer, null, cell.position, cell._size);
                        gameServer.addNode(virus);
                        console.log("Replaced " + client.getFriendlyName() + " with a virus");
                    } else if (ent == "food") {
                        var food = new Entity.Food(gameServer, null, cell.position, cell._size);
                        food.setColor(gameServer.getRandomColor());
                        gameServer.addNode(food);
                        console.log("Replaced " + client.getFriendlyName() + " with a food cell");
                    } else if (ent == "mothercell") {
                        var mother = new Entity.MotherCell(gameServer, null, cell.position, cell._size);
                        gameServer.addNode(mother);
                        console.log("Replaced " + client.getFriendlyName() + " with a mothercell");
                    }
                }
            }
        }
    },
    pop: function (gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            Logger.warn("Please specify a valid player ID!");
            return;
        }
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                var virus = new Entity.Virus(gameServer, null, client.centerPos, gameServer.config.virusMinSize);
                gameServer.addNode(virus);
                console.log("Popped " + client.getFriendlyName());
            }
        }
    },
    
    // Aliases for commands
    
    st: function (gameServer, split) { // Status
        Commands.list.status(gameServer, split);
    },
    pl: function (gameServer, split) { // Playerlist
        Commands.list.playerlist(gameServer, split);
    },
    m: function (gameServer, split) { // Mass
        Commands.list.mass(gameServer, split);
    },
    mn: function (gameServer, split) { // Minion
        Commands.list.minion(gameServer, split);
    },
    sm: function (gameServer, split) { // Spawnmass
        Commands.list.spawnmass(gameServer, split);
    },
    ka: function (gameServer, split) { // Killall
        Commands.list.killall(gameServer, split);
    },
    k: function (gameServer, split) { // Kill
        Commands.list.kill(gameServer, split);
    },
    mg: function (gameServer, split) { // Merge
        Commands.list.merge(gameServer, split);
    },
    s: function (gameServer, split) { // Speed
        Commands.list.speed(gameServer, split);
    },
    f: function (gameServer, split) { // Freeze
        Commands.list.freeze(gameServer, split);
    },
    ab: function (gameServer, split) { // Addbot
        Commands.list.addbot(gameServer, split); 
    },
    kb: function (gameServer, split) { // Kickbot
        Commands.list.kickbot(gameServer, split);
    },
    c: function (gameServer, split) { // Change
        Commands.list.change(gameServer, split);
    },
    n: function (gameServer, split) { // Name
        Commands.list.name(gameServer, split);
    },
    rep: function (gameServer, split) {
        Commands.list.replace(gameServer, split);
    }
};

// functions from GameServer

function playerById (id, gameServer) {
    if (id == null) return null;
    for (var i = 0; i < gameServer.clients.length; i++) {
        var playerTracker = gameServer.clients[i].playerTracker;
        if (playerTracker.pID == id) {
            return playerTracker;
        }
    }
    return null;
}

function saveIpBanList (gameServer) {
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

function ban (gameServer, split, ip) {
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
        if (socket == null || !socket.isConnected || !gameServer.checkIpBan(socket.remoteAddress))
            return;
    
        // remove player cells
        socket.playerTracker.cells.forEach(function (cell) {
            gameServer.removeNode(cell);
        }, gameServer);
    
        // disconnect
        socket.close(1000, "Banned from server");
        var name = socket.playerTracker.getFriendlyName();
        Logger.print("Banned: \"" + name + "\" with Player ID " + socket.playerTracker.pID);
        gameServer.sendChatMessage(null, null, "Banned \"" + name + "\""); // notify to don't confuse with server bug
    }, gameServer);
    saveIpBanList(gameServer);
}
