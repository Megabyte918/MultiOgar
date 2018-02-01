// ==UserScript==
// @name         Agar.io custom skins
// @version      0.3
// @description  Custom Skins for Agar.io
// @author       Megabyte918
// @match        *.agar.io/*
// @grant        none
// ==/UserScript==

function setSkin() {
    if (document.getElementById('skin').value.match(/^http(s)?:\/\/(.*?)/)) {
        localStorage.setItem("skin", document.getElementById('skin').value);
    }
    document.getElementsByClassName('circle bordered')[0].src = document.getElementById('skin').value;
    if (document.getElementById("h").checked === true) {
        localStorage.setItem("h", "3");
        document.getElementById('hh').click();
        clearInterval(i);
    } else {
        localStorage.setItem("h", "2");
        document.getElementById('ss').click();
    }
}

function init() {
    if (document.getElementsByClassName('circle bordered')[0] && document.getElementById('skin').value.match(/^http(s)?:\/\/(.*?)/)) {
        document.getElementById('skinLabel').style.display = "none";
        document.getElementById('skinButton').className = "";
        document.getElementsByClassName('circle bordered')[0].style.display = 'block';
        document.getElementsByClassName('circle bordered')[0].src = document.getElementById('skin').value;
    }
}
document.getElementsByClassName('form-group clearfix')[1].innerHTML += '<input placeholder="Paste your image link here" id="skin" class="form-control" style="width:320px" <div id="h2u"><font size="2" color="#FF0000"><center style="margin-top: 6px; margin-bottom: -15px;">You must enter a nickname to see your skin.</center></font> <br><center style="margin-bottom: -5px;"><input type="checkbox" name="h" id="h"> Hide your nickname</center><a href="javascript:window.core.registerSkin(document.getElementById(\'nick\').value, null, document.getElementById(\'skin\').value, 2,null);" id="ss"></a><a href="javascript:window.core.registerSkin(document.getElementById(\'nick\').value, null, document.getElementById(\'skin\').value, 3, null);" id="hh"></div>';

if (localStorage.getItem("h") && localStorage.getItem("h") == 3) {
    document.getElementById("h").checked = true;
}
if (localStorage.getItem("skin") && localStorage.getItem("skin").match(/(http(s?):)|([/|.|\w|\s])*\.(?:jpg|jpeg|gif|png|bmp)/)) {
    document.getElementById('skin').value = localStorage.getItem("skin");
}
if(document.getElementById('statsContinue')){
    document.getElementById('statsContinue').addEventListener("click", function(){i=setInterval(function(){init();},500);}, false);
}
if (document.getElementsByClassName('btn btn-play-guest btn-success')[0]) {
    document.getElementsByClassName('btn btn-play-guest btn-success')[0].addEventListener("click", setSkin, false);
}
if (document.getElementsByClassName('btn btn-play btn-primary')[0]) {
    document.getElementsByClassName('btn btn-play btn-primary')[0].addEventListener("click", setSkin, false);
}
