// External modules.
const ReadLine = require("readline");

// Project modules.
const Commands = require("./modules/CommandList.js");
const Server = require("./Server.js");
const Logger = require("./modules/Logger.js");
const express = require("express")
const path = require("path");



// Create console interface.
const inputInterface = ReadLine.createInterface(process.stdin, process.stdout);

// Create and start instance of server.
const instance = new Server();
instance.start();

// Welcome message.
Logger.info(`Running MultiOgarII ${instance.version}, a FOSS agar.io server implementation.`);

// Catch console input.
inputInterface.on("line", (input) => {
    const args = input.toLowerCase().split(" ");
    if(Commands[args[0]]) {
        Commands[args[0]](instance, args)
    };
});

//PORT 10090
//Get requests, token, damit nicht jede senden kann - uuid schauen ob statisch
//start, enden, restart - kann argumente mitgeben

// Create express app
const app = express();
const PORT = process.env.PORT || 10090;
// app.use(express.bodyParser());

app.get("/", (req, res) => {
    // res.send("Welcome to STAN's backend");
    res.sendFile(path.join(__dirname + "/backendInterface/index.html"));
});

app.get("/commands", (req, res) => {
    // console.log(req.query.command)
    // console.log("roundstart requested")
    const args = req.query.command.toLowerCase().split(" ");
    if(Commands[args[0]]) {
        Commands[args[0]](instance, args)
    };
    res.status(200).end()
});

app.listen({ port: PORT }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${PORT}`
  )
);