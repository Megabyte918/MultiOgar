// Imports
var Logger = require('./modules/Logger');
var Commands = require('./modules/CommandList');
var GameServer = require('./GameServer');
var figlet = require('figlet');

// Init variables
var showConsole = true;

// Start msg
setLoggerColorscheme();
Logger.start();

process.on('exit', function (code) {
    Logger.debug("process.exit(" + code + ")");
    Logger.shutdown();
});

process.on('uncaughtException', function (err) {
    Logger.fatal(err.stack);
    process.exit(1);
});

// Run MultiOgar-Edited
var gameServer = new GameServer();
Logger.info("\u001B[1m\u001B[32mMultiOgar-Edited " + gameServer.version + "\u001B[37m - An open source multi-protocol ogar server\u001B[0m");

// Handle arguments
process.argv.forEach(function (item) {
    
    switch (item){
        case "--help":
            console.log("Proper Usage: node index.js");
            console.log("    -n, --name             Set name");
            console.log("    -g, --gameport         Set game port");
            console.log("    -s, --statsport        Set stats port");
            console.log("    -m, --gamemode         Set game mode (id)");
            console.log("    -c, --connections      Set max connections limit");
            console.log("    -t, --tracker          Set serverTracker");
            console.log("    -l, --light-background Set a light-background colorscheme for logger")
            console.log("    --noconsole            Disables the console");
            console.log("    --help                 Help menu");
            console.log("");
            break;
            
        case "-n": 
        case "--name": 
            setParam("serverName", getValue(item));
            break;
            
        case "-g": 
        case "--gameport": 
            setParam("serverPort", parseInt(getValue(item)));
            break;
        case "-s": 
        case "--statsport": 
            setParam("serverStatsPort", parseInt(getValue(item)));
            break;
            
        case "-m": 
        case "--gamemode":
            setParam("serverGamemode", getValue(item));
            break;
            
        case "-c": 
        case "--connections":
            setParam("serverMaxConnections", parseInt(getValue(item)));
            break;
        case "-t": 
        case "--tracker":
            setParam("serverTracker", parseInt(getValue(item)));
            break;

        case "-l":
        case "--light-background":
            //Has already been processed before logger initialisation
            break;
        
        case "--noconsole":
            showConsole = false;
            break;
    }
});

function setLoggerColorscheme(){
    if (process.argv.indexOf("-l") != -1
        || process.argv.indexOf("--light-background") != -1) {
        Logger.setLightBackgroundColorscheme();
    }
}

function getValue(param){
    var ind = process.argv.indexOf(param);
    var item  = process.argv[ind + 1]
    if (!item || item.indexOf('-') != -1){
        Logger.error("No value for " + param);
        return null;
    } else{
        return item;
    }
}

function setParam(paramName, val){
    if (!gameServer.config.hasOwnProperty(paramName)){
        Logger.error("Wrong parameter");
    }
    if (val || val === 0) {
        if (typeof val === 'string'){
            val = "'" + val + "'";
        }
        eval("gameServer.config." + paramName + "=" + val);
    }
}


gameServer.start();
figlet(('MultiOgar-Edited  ' + gameServer.version), function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});

// Initialize the server console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Console functions

function prompt() {
    in_.question(">", function (str) {
        try {
            parseCommands(str);
        } catch (err) {
            Logger.error(err.stack);
        } finally {
            setTimeout(prompt, 0);
        }
    });
}

function parseCommands(str) {
    // Log the string
    Logger.write(">" + str);
    
    // Don't process ENTER
    if (str === '')
        return;
    
    // Splits the string
    var split = str.split(" ");
    
    // Process the first string value
    var first = split[0].toLowerCase();
    
    // Get command function
    var execute = Commands.list[first];
    if (typeof execute != 'undefined') {
        execute(gameServer, split);
    } else {
        Logger.warn("Invalid Command!");
    }
};

exports.gameServer = gameServer;
