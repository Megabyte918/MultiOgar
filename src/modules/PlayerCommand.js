const Logger = require('./Logger');
const UserRoleEnum = require("../enum/UserRoleEnum");
const Food = require('../entity/Food');

class Command {
    constructor(name, description, usage, minimumCredential, handler) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.minCred = minimumCredential;
        this.handler = handler;
    }
}

const send = (player, msg) => player.server.sendChatMessage(null, player, msg);
const findPlayer = (server, id) => {
    const c = server.clients.find(c => c.playerTracker.pID == id);
    return c && c.playerTracker;
};

let commandMap = new Map();

const commands = [
    new Command("help", "lists available commands, or command usage", "[cmd]", UserRoleEnum.GUEST, (player, args) => {
        let cmd = args[1];
        if (cmd && (cmd = commandMap.get(cmd)))
            return send(player, `usage: /${cmd.name} ${cmd.usage}`);
        send(player, "~".repeat(70));
        for (const cmd of commands)
            if (player.userRole >= cmd.minCred)
                send(player, `/${cmd.name} - ${cmd.description}.`)
        send(player, "~".repeat(70));
    }),
    new Command("id", "gets your playerID", "", UserRoleEnum.GUEST, (player, args) => {
        send(player, `Your PlayerID is ${player.pID}`);
    }),
    new Command("kill", "self kill", "", UserRoleEnum.GUEST, (player, args) => {
        if (!player.cells.length)
            return send(player, "You cannot kill yourself, because you're not joined to the game!");
        while (player.cells.length) {
            let cell = player.cells[0];
            player.server.removeNode(cell);
            // replace with food
            let food = new Food(player.server, null, cell.position, cell._size);
            food.color = cell.color;
            player.server.addNode(food);
        }
        send(player, "You killed yourself");
    }),
    new Command("skin", "change skin", "[skin]", UserRoleEnum.GUEST, (player, args) => {
        if (player.cells.length)
            return send(player, "ERROR: Cannot change skin while in game!");
        const skinName = args[1] || "";
        player.setSkin(skinName);
        send(player, `Your skin ${skinName ? "set to " + skinName : "was removed"}`);
    }),
    new Command("login", "upgrade your credential to access more commands", "<password>", UserRoleEnum.GUEST, (player, args) => {
        let pass = args[1];
        if (!pass || !(pass = pass.trim()))
            return send(player, "ERROR: missing password argument!");
        let user = player.server.userList.find(c => c.password == pass && (c.ip == player.socket.remoteAddress || c.ip == "*"));
        if (!user) return send(player, "ERROR: login failed!");

        Logger.write(`LOGIN ${player.socket.remoteAddress}:${player.socket.remotePort} as "${user.name}"`);
        player.userRole = user.role;
        player.userAuth = user.name;
        send(player, `Login done as "${user.name}"`);
    }),
    new Command("logout", "remove your credentials", "", UserRoleEnum.GUEST, (player, args) => {
        if (player.userRole == UserRoleEnum.GUEST)
            return send(player, "ERROR: not logged in");
        Logger.write(`LOGOUT${player.socket.remoteAddress}:${player.socket.remotePort} as "${player.userAuth}"`);
        player.userRole = UserRoleEnum.GUEST;
        player.userAuth = null;
        send(player, "Logout done");
    }),
    new Command("mass", "gives mass to yourself or to other player", "<mass> [id]", UserRoleEnum.MODER, (player, args) => {
        const mass = parseInt(args[1]);
        if (isNaN(mass)) return send(player, "ERROR: missing mass argument!");
        const size = Math.sqrt(mass * 100);
        const id = parseInt(args[2]);
        let p;
        if (isNaN(id)) {
            send(player, "Warn: missing ID argument. This will change your mass.");
            p = player;
        } else p = findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        for (const cell of p.cells) cell.setSize(size);
        send(player, `Set mass of ${player._name} to ${mass}`);
        if (p != player) send(p, player._name + " changed your mass to " + mass);
    }),
    new Command("status", "shows status of the server", "", UserRoleEnum.MODER, (player, args) => {
        const memoryUsage = process.memoryUsage();
        const heapUsed = Math.round(memoryUsage.heapUsed / 1048576 * 10) / 10;
        const heapTotal = Math.round(memoryUsage.heapTotal / 1048576 * 10) / 10;
        // Get amount of humans/bots
        let humans = 0,
            bots = 0;
        for (const client of player.server.clients)
            client.hasOwnProperty('_socket') ? humans++ : bots++;
        send(player, "~".repeat(57));
        send(player, `Connected players: ${player.server.clients.length}/` + player.server.config.serverMaxConnections);
        send(player, `Players: ${humans} - Bots: ` + bots);
        send(player, `Server has been running for ${process.uptime() / 60 | 0} minutes`);
        send(player, `Current memory usage: ${heapUsed}/${heapTotal} mb`);
        send(player, "Current game mode: " + player.server.mode.name);
        send(player, `Update time: ${player.server.updateTimeAvg.toFixed(3)}ms`);
        send(player, "~".repeat(57));
    }),
    new Command("add-minion", "gives yourself or other player minions", "<count> [id] [name]", UserRoleEnum.MODER, (player, args) => {
        const count = parseInt(args[1]);
        if (isNaN(count)) return send(player, "ERROR: missing count argument!");
        const id = parseInt(args[2]);
        const name = args.slice(3).join(" ");

        let p;
        if (isNaN(id)) {
            send(player, "Warn: missing ID argument. This will give you minions.");
            p = player;
        } else p = findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        const s = p.server.config.minionMaxStartSize;
        const mass = s * s / 100;
        for (let i = 0; i < count; ++i) p.server.bots.addMinion(p, name, mass);
        if (count > 0) p.hasMinions = true;
        send(player, `Added ${count} minions for ` + p._name);
        if (p != player) send(p, player._name + ` gave you ${count} minions.`);
    }),
    new Command("rm-minion", "removes minions from yourself or others", "[id]", UserRoleEnum.MODER, (player, args) => {
        const id = parseInt(args[1]);
        let p = isNaN(id) ? player : findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        p.hasMinions = p.miQ = false;
        send(player, "Succesfully removed minions for " + p._name);
        if (p != player) send(p, player._name + " removed all of your minions.");
    }),
    new Command("killall", "kills everyone", "", UserRoleEnum.MODER, (player, args) => {
        let count = 0;
        for (const client of player.server.clients) {
            const p = client.playerTracker;
            while (p.cells.length > 0) {
                p.server.removeNode(p.cells[0]);
                ++count;
            }
            send(p, player._name + " killed everyone.");
        }
        send(player, `You killed everyone. (${count} cells)`);
    }),
    new Command("spawnmass", "gives yourself or other player spawnmass", "<mass> [id]", UserRoleEnum.ADMIN, (player, args) => {
        const mass = parseInt(args[1]);
        if (isNaN(mass))
            return send(player, "ERROR: missing mass argument!");
        const size = Math.sqrt(mass * 100);
        const id = parseInt(args[2]);

        let p;
        if (isNaN(id)) {
            send(player, "Warn: missing ID argument. This will change your spawnmass.");
            p = player;
        } else p = findPlayer(player.server, id);
        if (!p) return send(player, "Didn't find player with id " + id);
        p.spawnmass = size; // it's called spawnmass, not spawnsize, but ok.
        send(player, `Set spawnmass of ${p._name} to ` + mass);
        if (p != player) send(p, player._name + " changed your spawn mass to " + mass);
    }),
    new Command("addbot", "adds AI bots to the server", "<count>", UserRoleEnum.ADMIN, (player, args) => {
        const count = parseInt(args[1]);
        if (isNaN(count)) return send(player, "ERROR: missing count argument.");
        for (let i = 0; i < count; ++i) player.server.bots.addBot();
        Logger.warn(player.socket.remoteAddress + ` ADDED ${count} BOTS`);
        send(player, `Added ${count} Bots`);
    }),
    new Command("roundstart", "Starts the game round", "", UserRoleEnum.ADMIN, (player, args) => {
        player.server.mode.roundStart(player.server);
    }),
    new Command("shutdown", "SHUTS DOWN THE SERVER", "", UserRoleEnum.ADMIN, (player, args) => {
        Logger.warn(`SHUTDOWN REQUEST FROM ${player.socket.remoteAddress} as ` + player.userAuth);
        process.exit(0);
    }),
    new Command("restart", "restarts the server", "", UserRoleEnum.ADMIN, (player, args) => {
        Logger.warn(`RESTART REQUEST FROM ${player.socket.remoteAddress} as ` + player.userAuth);
        process.exit(3);
    })
];

for (const cmd of commands) commandMap.set(cmd.name, cmd);

class PlayerCommand {
    constructor(server, playerTracker) {
        this.server = server;
        this.playerTracker = playerTracker;
    }
    processMessage(from, msg) {
        msg = msg.slice(1); // remove forward-slash
        let args = msg.split(" ");
        const cmdName = args[0];
        const cmd = commandMap.get(cmdName);
        if (cmd)
            if (from.userRole >= cmd.minCred) cmd.handler(from, args);
            else send(from, "ERROR: access denied! " + from.userRole + ", " + cmd.minCred);
        else send(from, "Invalid command, please use /help to get a list of available commands");
    }
}

module.exports = PlayerCommand;
