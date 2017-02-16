// ==UserScript==
// @name         15 macro's for Agar.io :)
// @version      0.3
// @description  15 macro's for feeding, linesplits, tricksplits, etc. And enables show mass and skip stats by default :)
// @author       Megabyte918
// @match        http://agar.io/*
// @match        http://old.ogarul.io/*
// ==/UserScript==
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
document.getElementById("nick").maxLength = "100";

//List instructions
var i = document.getElementById("instructions");
i.innerHTML += "<center>Press & hold <b>W</b> for macro feed</center>";
i.innerHTML += "<center>Press <b>Shift</b> to split 4x</center>";
i.innerHTML += "<center>Press <b>A</b> or <b>3</b> to split 3x</center>";
i.innerHTML += "<center>Press <b>D</b> or <b>2</b> to split 2x</center>";
i.innerHTML += "<center>Press <b>S</b> or <b>1</b> to split 1x</center>";
i.innerHTML += "<center>Press <b>H</b> for horizontal linesplit position</center>";
i.innerHTML += "<center>Press <b>V</b> for vertical linesplit position</center>";
i.innerHTML += "<center>Press <b>g</b> and <b>j</b> to move left and right during a horizontal linesplit</center>";
i.innerHTML += "<center>Press <b>y</b> and <b>n</b> to move up and down during a vertical linesplit</center>";

//Auto-enable show mass/skip stats
//IMPORTANT: You must uncheck showmass/skip stats first then recheck them for it to auto save every time
function autoSet() {
    var m = document.getElementById('showMass'), s = document.getElementById('skipStats');
    if (document.getElementById("overlays").style.display!= "none") {
        document.getElementById("settings").style.display = "block";
        if (m.checked) {m.click();} m.click(); //Show mass
        if (s.checked) {s.click();} s.click(); //Skip stats
    } else setTimeout(autoSet, 100);
}

//Load macros
var canFeed = false;
function keydown(event) {
    switch (event.keyCode) {
        case 87: //Feeding Macro (w)
            canFeed = true;
            feed();
            break;
        case 16: //Tricksplit Macro (shift)
            var e = 35;
            for (var e2 = 0; e2 < 4; e2++) {
                setTimeout(split, e);
                e *= 2;
            }
            break;
        case 52: //Tricksplit Macro (4)
            var four = 35;
            for (var four2 = 0; four2 < 4; four2++) {
                setTimeout(split, four);
                four *= 2;
            }
            break;
        case 65: //Triplesplit Macro (a)
            var a = 35;
            for (var a2 = 0; a2 < 3; a2++) {
                setTimeout(split, a);
                a *= 2;
            }
            break;
        case 51: //Triplesplit Macro (3)
            var three = 35;
            for (var three2 = 0; three2 < 3; three2++) {
                setTimeout(split, three);
                three *= 2;
            }
            break;
        case 68: //Doublesplit Macro (d)
            split();
            setTimeout(split, 50);
            break;
        case 50: //Doublesplit Macro (2)
            split();
            setTimeout(split, 50);
            break;
        case 83: //Popsplit Macro (s) For people that are too lazy to press space twice and instead use the double split macro and complain when they fail their popsplits. Don't worry your not alone :)
            var time1 = Math.random() * (350 - 200) + 200;
            split();
            setTimeout(split, time1);
            break;
        case 72: //Horizontal linesplit (h)
            X = window.innerWidth / 2;
            Y = window.innerHeight / 2;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
        case 86: //Vertical linesplit (v)
            X = window.innerWidth / 2;
            Y = window.innerHeight / 2.006;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
        case 71: //Move left Horizontal (g)
            X = window.innerWidth / 2.4;
            Y = window.innerHeight / 2;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
        case 74: //Move right Horizontal (j)
            X = window.innerWidth / 1.6;
            Y = window.innerHeight / 2;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
        case 80: // Move up Veritcal (y)
            X = window.innerWidth / 2;
            Y = window.innerHeight / 2.4;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
        case 78: // Move down Veritcal (n)
            X = window.innerWidth / 2;
            Y = window.innerHeight / 1.6;
            $("canvas").trigger($.Event("mousemove", {clientX: X, clientY: Y}));
            break;
    }
}

//When a player lets go of W stop feeding
function keyup(event) {
    if (event.keyCode == 87)
        canFeed = false;
}

//Alias for W key
function feed() {
    if (canFeed) {
        window.onkeydown({keyCode: 87});
        window.onkeyup({keyCode: 87});
        setTimeout(feed, 0);
    }
}

//Alias for space
function split() {
    $("body").trigger($.Event("keydown", { keyCode: 32}));
    $("body").trigger($.Event("keyup", { keyCode: 32}));
}
