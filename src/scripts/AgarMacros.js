// ==UserScript==
// @name         13 macro's for Agar.io :)
// @version      0.5
// @description  13 macro's. For feeding, linesplits, tricksplits, etc :)
// @author       Megabyte918
// @match        *.agar.io/*
// ==/UserScript==

window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
document.getElementById("nick").maxLength = "9e9";

// List instructions
var i = document.getElementById("instructions");
i.innerHTML += "<center class='text-muted'>Hold <b>W</b> for macro feed</center>";
i.innerHTML += "<center class='text-muted'>Press <b>Shift</b> or <b>4</b> to split 4x</center>";
i.innerHTML += "<center class='text-muted'>Press <b>A</b> or <b>3</b> to split 3x</center>";
i.innerHTML += "<center class='text-muted'>Press <b>D</b> or <b>2</b> to split 2x</center>";
i.innerHTML += "<center class='text-muted'>Press <b>S</b> or <b>1</b> to split 1x</center>";
i.innerHTML += "<center class='text-muted'>Press <b>H</b> for horizontal linesplit</center>";
i.innerHTML += "<center class='text-muted'>Press <b>V</b> for vertical linesplit</center>";
i.innerHTML += "<center class='text-muted'>Press <b>C</b> for popsplit macro</center>";
i.innerHTML += "<center class='text-muted'>Press <b>F</b> for solo-tricksplit</center>";

// Load macros
var canFeed = false;
function keydown(event) {
    if (event.keyCode == 87) {
        // Feeding Macro (w)
        canFeed = true;
        feed();
    }
    if (event.keyCode == 70) {
        // Solo-tricksplit (f)
        for (var a = 0; a < 4; a++) {
            setTimeout(function() {
                split();
                $("body").trigger($.Event("keydown", { keyCode: 87}));
                $("body").trigger($.Event("keyup", { keyCode: 87}));
            }, a * 50);
        }
    }
    if (event.keyCode == 67) {
        // Popsplit macro (C)
        split();
        setTimeout(split, Math.random() * (350 - 200) + 200);
    }
    if (event.keyCode == 49 || event.keyCode == 83) {
        // Space macro (s or 1)
        split();
    }
    if (event.keyCode == 16 || event.keyCode == 52) {
        // Tricksplit Macro (shift or 4)
        for (var b = 0; b < 4; b++) setTimeout(split, b * 50);
    }
    if (event.keyCode == 65 || event.keyCode == 51) {
        // Triplesplit Macro (a or 3)
        for (var c = 0; c < 3; c++) setTimeout(split, c * 50);
    }
    if (event.keyCode == 68 || event.keyCode == 50) {
        // Doublesplit Macro (d or 2)
        split();
        setTimeout(split, 50);
    }
    if (event.keyCode == 72) {
        // Horizontal linesplit (h)
        X = window.innerWidth / 2;
        Y = window.innerHeight / 2;
        $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
    }
    if (event.keyCode == 86) {
        // Vertical linesplit (v)
        X = window.innerWidth / 2;
        Y = window.innerHeight / 2.006;
        $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
    }
}

// When a player lets go of W stop feeding
function keyup(event) {
    if (event.keyCode == 87) canFeed = false;
}

// Alias for W key
function feed() {
    if (!canFeed) return;
    window.onkeydown({keyCode: 87});
    window.onkeyup({keyCode: 87});
    setTimeout(feed, 0);
}

// Alias for space
function split() {
    $("body").trigger($.Event("keydown", { keyCode: 32}));
    $("body").trigger($.Event("keyup", { keyCode: 32}));
}
