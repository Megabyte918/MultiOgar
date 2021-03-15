const Logger = require('../modules/Logger');
const fetch = require('node-fetch');
const fetch_secrets = require('../../fetch_secret.json')
var Mode = require('./Mode');

class Tournament extends Mode {
    constructor() {
        super();
        this.ID = 0;
        this.name = "Tournament";
        this.specByLeaderboard = true;
        this.IsTournament = true;
        this.roundDuration = 3 * 60 * 1000; //TODO: Dynamisch über server command (backend interface)
        this.paused = false;
        this.lastPauseTime = null;
        this.accumulatedPauseTime = 0;
        this.roundStartTime = null;
        this.roundStarted = false
    }

    onServerInit(server) {
        // Called when the server starts
        server.run = false;
    }


    onPause() {
        if(this.paused) {
            return;
        }
        this.paused = true;
        this.lastPauseTime = Date.now();
    }

    onResume() {
        if(!this.paused) {
            return;
        }
        this.paused = false;
        this.accumulatedPauseTime += (Date.now() - this.lastPauseTime);
    }

    // Gamemode Specific Functions
    onPlayerSpawn(server, player) {
        player.color = server.getRandomColor();
        // Spawn player
        server.spawnPlayer(player, server.randomPos());
    }
    onTick(server) {
        if(this.paused){
            return;
        }
        // Called on every game tick
        if(server.run && this.roundStartTime)
        {
            var timePassed = Date.now() - (this.roundStartTime + this.accumulatedPauseTime);
            if(timePassed > this.roundDuration)
            {
                this.roundEnd(server);
            }
        }
    }

    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (var i = 0, pos = 0; i < server.clients.length; i++) {
            var player = server.clients[i].playerTracker;
            if (player.isRemoved || !player.cells.length ||
                player.socket.isConnected == false || (!server.config.minionsOnLeaderboard && player.isMi))
                continue;
            for (var j = 0; j < pos; j++)
                if (lb[j]._score < player._score)
                    break;
            lb.splice(j, 0, player);
            pos++;
        }
        this.rankOne = lb[0];
    }

    updateRoundDuration(duration){
        // Called when round time length is to be changed
        if(!this.roundStarted){
            this.roundDuration = duration
            console.log("new round duration: " + this.roundDuration)
        }
        else{
            console.log("cannot update round duration until round has ended")
        }
    }

    roundStart(server) {
        Logger.info("Round started");
        server.run = true;
        this.roundStartTime = Date.now();
        this.roundStarted = true
        this.accumulatedPauseTime = 0
    }

    roundEnd(server) {
        Logger.info("Round ended");
        server.run = false;

        this.sendScores(server);
        this.roundStarted = false
    }

    sendScores(server) {

        let results = [];
        
        for (var i = 0; i < server.leaderboard.length; i++) {
            var item = server.leaderboard[i];
            if (item == null)
                return null; // bad leaderboardm just don't send it
            var name = item._name;
            var score = Math.floor(item._score);

            results.push({
                player: name,
                points: score
            })
        }

        // fetch(fetch_secrets.sheetUrl, {
        //     method: 'POST',
        //     headers: {
        //         Authorization: fetch_secrets.bearer,
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         game: 'Agario',
        //         result: results
        //     })
        // })
    }
}

module.exports = Tournament;
Tournament.prototype = new Mode();



