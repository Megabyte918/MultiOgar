"use strict";

const server_bind = "127.0.0.1";
const server_port = 3456;
const vkapi_token = ; //Get token in group settings
const admin_vkid = ; //Your VK id

const request = require('request');
const child = require('child_process');
const express = require('express');
const app = express();
const http = require('http').Server(app);

//Start game server
let gameProcess = child.spawn('nodejs', ['../src/index.js']);
let timer100, timer1000, buffer = "";

gameProcess.stdin.on("end", function () {
  process.exit(0);
});

gameProcess.stdout.on('data', function (data) {
  onNewBufferedMsg((data + "").trim());
});

gameProcess.stderr.on('data', function (data) {
  console.log('stderr: ' + data); // should be directed to logger 
});

function onNewBufferedMsg(msg) {
  buffer += msg;

  clearTimeout(timer100);
  timer100 = setTimeout(processBuffer, 100);

  if (!timer1000) {
    timer1000 = setTimeout(processBuffer, 1000);
  }
}

function processBuffer() {
  clearTimeout(timer100);
  clearTimeout(timer1000);
  timer1000 = null;

  sendVKmessage(buffer) //process buffer

  buffer = "";
}

function onIncomeVKmessage(json) {
  if (json.type == "message_new") {
    if (json.object.user_id == admin_vkid) {
      let message = json.object.body;
      gameProcess.stdin.write(message + "\n");
    }
  }
}

function sendVKmessage(message) {
  let postData = {
    "user_id": admin_vkid,
    "v": "5.0",
    "access_token": vkapi_token,
    "message": message
  };
  let URL = "https://api.vk.com/method/messages.send";
  request.post(URL, {
    form: postData
  });
}

//Configure server to process VK API Callback
app.use(function (req, resp) {
  resp.send("ok");

  let postData = [];
  req.on('data', (chunk) => {
    postData.push(chunk);
  }).on('end', () => {
    try {
      postData = JSON.parse(Buffer.concat(postData).toString());
      onIncomeVKmessage(postData);
    } catch (e) {}
  });
});

http.listen(server_port, server_bind);
console.log("Started VK gameServer");