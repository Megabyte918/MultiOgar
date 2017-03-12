// ==UserScript==
// @name         E, R, T, and P keys
// @version      1.1
// @description  Adds E, R, T, and P keys to the vanilla client
// @author       ZfsrGhS953
// @match        *.agar.io/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

/************************************************
Made by @ZfsrGhS953 on GitHub
Go check out his project! Its really nice :)
https://github.com/ZfsrGhS953/Petridish-Ogar
************************************************/

window.__WebSocket = window.WebSocket;
window._WebSocket = window.WebSocket = function(ip) {
    return new window.fakeWebSocket(ip);
};
window.key = {
    e: false,
    r: false,
    t: false,
    p: false
};
window.addEventListener("load", function() {
    OldSocket = window.__WebSocket;
    window.WebSocket = window.fakeWebSocket = function(ip) {
        var fakeWS = {};
        var ws = new OldSocket(ip);
        ws.binaryType = "arraybuffer";
        for (var i in ws) fakeWS[i] = ws[i];
        fakeWS.send = function() {
            if (window.key.e){
                arguments[0] = new Int8Array(1);
                arguments[0][0] = 22;
            } else if (window.key.r){
                arguments[0] = new Int8Array(1);
                arguments[0][0] = 23;
            } else if (window.key.t){
                arguments[0] = new Int8Array(1);
                arguments[0][0] = 24;
            } else if (window.key.p) {
                arguments[0] = new Int8Array(1);
                arguments[0][0] = 25;
            }
            window.key = {};
            return ws.send.apply(ws, arguments);
        };
        ws.onmessage = function() {
            fakeWS.onmessage && fakeWS.onmessage.apply(ws, arguments);
        };
        ws.onopen = function() {
            fakeWS.readyState = 1;
            fakeWS.onopen.apply(ws, arguments);
        };
        return fakeWS;
    };
});
document.addEventListener('keydown', function(e) {
    if (e.keyCode == 69) window.key.e = true;
    if (e.keyCode == 82) window.key.r = true;
    if (e.keyCode == 84) window.key.t = true;
    if (e.keyCode == 80) window.key.p = true;
});
