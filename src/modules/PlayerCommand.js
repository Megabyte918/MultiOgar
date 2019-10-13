var Logger = require('./Logger');
var UserRoleEnum = require("../enum/UserRoleEnum");

class PlayerCommand {
    constructor(server, playerTracker) {
        this.server = server;
        this.playerTracker = playerTracker;
    }

    writeLine(text) {
        this.server.sendChatMessage(null, this.playerTracker, text);
    }

    help(args) {
        if (this.playerTracker.userRole == UserRoleEnum.MODER) {
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/killall - kills everyone.")
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("/mass - gives mass to yourself or to other player");
            this.writeLine("/minion - gives yourself or other player minions");
            this.writeLine("/minion remove - removes all of your minions or other players minions");
            this.writeLine("/status - Shows Status of the Server");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }
        if (this.playerTracker.userRole == UserRoleEnum.ADMIN) {
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/killall - kills everyone.")
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("/mass - gives mass to yourself or to other player");
            this.writeLine("/spawnmass - gives yourself or other player spawnmass");
            this.writeLine("/minion - gives yourself or other player minions");
            this.writeLine("/minion remove - removes all of your minions or other players minions");
            this.writeLine("/addbot - Adds AI Bots to the Server");
            this.writeLine("/shutdown - SHUTDOWNS THE SERVER");
            this.writeLine("/status - Shows Status of the Server");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        } else {
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            this.writeLine("/skin %shark - change skin");
            this.writeLine("/kill - self kill");
            this.writeLine("/help - this command list");
            this.writeLine("/id - Gets your playerID");
            this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        };
    };

    id(args) {
        this.writeLine("Your PlayerID is " + this.playerTracker.pID);
    };

    skin(args) {
        if (this.playerTracker.cells.length) {
            this.writeLine("ERROR: Cannot change skin while player in game!");
            return;
        }
        var skinName = "";
        if (args[1]) skinName = args[1];
        this.playerTracker.setSkin(skinName);
        if (skinName == "")
            this.writeLine("Your skin was removed");
        else
            this.writeLine("Your skin set to " + skinName);
    };

    kill(args) {
        if (!this.playerTracker.cells.length) {
            this.writeLine("You cannot kill yourself, because you're still not joined to the game!");
            return;
        }
        while (this.playerTracker.cells.length) {
            var cell = this.playerTracker.cells[0];
            this.server.removeNode(cell);
            // replace with food
            var food = require('../entity/Food');
            food = new food(this.server, null, cell.position, cell._size);
            food.color = cell.color;
            this.server.addNode(food);
        }
        this.writeLine("You killed yourself");
    };

    killall(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN && this.playerTracker.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var count = 0;
        var cell = this.playerTracker.cells[0];
        for (var i = 0; i < this.server.clients.length; i++) {
            var playerTracker = this.server.clients[i].playerTracker;
            while (playerTracker.cells.length > 0) {
                this.server.removeNode(playerTracker.cells[0]);
                count++;
            }
        }
        this.writeLine("You killed everyone. (" + count + (" cells.)"));
    };

    mass(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN && this.playerTracker.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var mass = parseInt(args[1]);
        var id = parseInt(args[2]);
        var size = Math.sqrt(mass * 100);

        if (isNaN(mass)) {
            this.writeLine("ERROR: missing mass argument!");
            return;
        }

        if (isNaN(id)) {
            this.writeLine("Warn: missing ID arguments. This will change your mass.");
            for (var i in this.playerTracker.cells) {
                this.playerTracker.cells[i].setSize(size);
            }
            this.writeLine("Set mass of " + this.playerTracker._name + " to " + size * size / 100);
        } else {
            for (var i in this.server.clients) {
                var client = this.server.clients[i].playerTracker;
                if (client.pID == id) {
                    for (var j in client.cells) {
                        client.cells[j].setSize(size);
                    }
                    this.writeLine("Set mass of " + client._name + " to " + size * size / 100);
                    var text = this.playerTracker._name + " changed your mass to " + size * size / 100;
                    this.server.sendChatMessage(null, client, text);
                    break;
                }
            }
        }
    };

    spawnmass(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var mass = parseInt(args[1]);
        var id = parseInt(args[2]);
        var size = Math.sqrt(mass * 100);

        if (isNaN(mass)) {
            this.writeLine("ERROR: missing mass argument!");
            return;
        }

        if (isNaN(id)) {
            this.playerTracker.spawnmass = size;
            this.writeLine("Warn: missing ID arguments. This will change your spawnmass.");
            this.writeLine("Set spawnmass of " + this.playerTracker._name + " to " + size * size / 100);
        } else {
            for (var i in this.server.clients) {
                var client = this.server.clients[i].playerTracker;
                if (client.pID == id) {
                    client.spawnmass = size;
                    this.writeLine("Set spawnmass of " + client._name + " to " + size * size / 100);
                    var text = this.playerTracker._name + " changed your spawn mass to " + size * size / 100;
                    this.server.sendChatMessage(null, client, text);
                }
            }
        };
    };

    minion(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN && this.playerTracker.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        var add = args[1]
        var id = parseInt(args[2]);
        var name;
        var mass = parseInt(args.slice(-1, 2 + args.length));
        var player = this.playerTracker;

        /** For you **/
        if (isNaN(id)) {
            // Add check if mass is not a number
            if (isNaN(mass)) {
                name = args.slice(2).join(' ');
            } else {
                name = args.slice(2, -1).join(' ');
            }
            this.writeLine("Warn: missing ID arguments. This will give you minions.");
            // Add checks if the first argument is the same as Mass, this add prevention from Amount of Bots with same Mass
            if (parseInt(add) === mass) {
                mass = this.server.config.minionMaxStartSize * this.server.config.minionMaxStartSize / 100;
            }
            // Remove minions
            if (add == "remove") {
                player.miQ = false;
                this.writeLine("Succesfully removed minions for " + player._name);
                // Add minions
            } else {
                // Add minions for self
                if (isNaN(parseInt(add))) add = 1;
                for (var i = 0; i < add; i++) {
                    this.server.bots.addMinion(player, name, mass);
                }
                this.writeLine("Added " + add + " minions for " + player._name);
            }

        } else {
            /** For others **/
            if (isNaN(mass)) {
                name = args.slice(3).join(' ');
            } else {
                name = args.slice(3, -1).join(' ');
            }
            for (var i in this.server.clients) {
                var client = this.server.clients[i].playerTracker;
                if (client.pID == id) {

                    // Prevent the user from giving minions, to minions
                    if (client.isMi) {
                        Logger.warn("You cannot give minions to a minion!");
                        return;
                    };
                    // Add checks if the second argument is the same as Mass, this add prevention from Player ID with same Mass
                    if (id === mass) {
                        mass = this.server.config.minionMaxStartSize * this.server.config.minionMaxStartSize / 100;
                    }
                    // Remove minions
                    if (add == "remove") {
                        client.miQ = false;
                        this.writeLine("Succesfully removed minions for " + client._name);
                        var text = this.playerTracker._name + " removed all off your minions.";
                        this.server.sendChatMessage(null, client, text);
                        // Add minions
                    } else {
                        // Add minions for client
                        if (isNaN(add)) add = 1;
                        for (var i = 0; i < add; i++) {
                            this.server.bots.addMinion(client, name, mass);
                        }
                        this.writeLine("Added " + add + " minions for " + client._name);
                        var text = this.playerTracker._name + " gave you " + add + " minions.";
                        this.server.sendChatMessage(null, client, text);
                    }
                }
            }
        }
    };

    addbot(args) {
        var add = parseInt(args[1]);
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        for (var i = 0; i < add; i++) {
            this.server.bots.addBot();
        }
        Logger.warn(this.playerTracker.socket.remoteAddress + " ADDED " + add + " BOTS");
        this.writeLine("Added " + add + " Bots");
    };

    status(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN && this.playerTracker.userRole != UserRoleEnum.MODER) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        // Get amount of humans/bots
        var humans = 0,
            bots = 0;
        for (var i = 0; i < this.server.clients.length; i++) {
            if ('_socket' in this.server.clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        this.writeLine("Connected players: " + this.server.clients.length + "/" + this.server.config.serverMaxConnections);
        this.writeLine("Players: " + humans + " - Bots: " + bots);
        this.writeLine("Server has been running for " + Math.floor(process.uptime() / 60) + " minutes");
        this.writeLine("Current memory usage: " + Math.round(process.memoryUsage().heapUsed / 1048576 * 10) / 10 + "/" + Math.round(process.memoryUsage().heapTotal / 1048576 * 10) / 10 + " mb");
        this.writeLine("Current game mode: " + this.server.mode.name);
        this.writeLine(`Update time: ${this.server.updateTimeAvg.toFixed(3)}ms`);
        this.writeLine("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    };
    processMessage(from, msg) {
        const invalid = "Invalid command, please use /help to get a list of available commands";
        msg = msg.slice(1); // remove forward-slash
        let args = msg.split(" ");
        const cmd = args[0];
        if (!this[cmd])
            return this.server.sendChatMessage(null, from, invalid);
        this[cmd](args, from);
    }
    login(args, player) {
        var password = args[1];
        if (!password || !(password = password.trim())) {
            this.writeLine("ERROR: missing password argument!");
            return;
        }

        let user = null;
        for (const cur of this.server.userList) {
            if (cur.password != password)
                continue;
            if (cur.ip && cur.ip != player.socket.remoteAddress && cur.ip != "*") // * - means any IP
                continue;
            user = cur;
            break;
        }

        if (!user) {
            this.writeLine("ERROR: login failed!");
            return;
        }
        Logger.write("LOGIN        " + this.playerTracker.socket.remoteAddress + ":" + this.playerTracker.socket.remotePort + " as \"" + user.name + "\"");
        this.playerTracker.userRole = user.role;
        this.playerTracker.userAuth = user.name;
        this.writeLine("Login done as \"" + user.name + "\"");
        return;
    };

    logout(args) {
        if (this.playerTracker.userRole == UserRoleEnum.GUEST) {
            this.writeLine("ERROR: not logged in");
            return;
        }
        Logger.write("LOGOUT       " + this.playerTracker.socket.remoteAddress + ":" + this.playerTracker.socket.remotePort + " as \"" + this.playerTracker.userAuth + "\"");
        this.playerTracker.userRole = UserRoleEnum.GUEST;
        this.playerTracker.userAuth = null;
        this.writeLine("Logout done");
    };

    shutdown(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        Logger.warn("SHUTDOWN REQUEST FROM " + this.playerTracker.socket.remoteAddress + " as " + this.playerTracker.userAuth);
        process.exit(0);
    };

    restart(args) {
        if (this.playerTracker.userRole != UserRoleEnum.ADMIN) {
            this.writeLine("ERROR: access denied!");
            return;
        }
        Logger.warn("RESTART REQUEST FROM " + this.playerTracker.socket.remoteAddress + " as " + this.playerTracker.userAuth);
        process.exit(3);
    };
};

module.exports = PlayerCommand;
