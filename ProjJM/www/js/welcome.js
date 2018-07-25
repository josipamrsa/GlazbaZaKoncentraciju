/* FADEIN U POCETNU STRANICU */

$(document).ready(function() {
    $("#welcomeScreenTitle").hide();
    $(".welcomeScreenOptions").hide();
    $("#welcomeScreenTitle").fadeIn(1400);
    $(".welcomeScreenOptions").fadeIn(1400);
});


/* EVENT LISTENERI */

window.onload = function() {
    document.getElementById("pokreni").addEventListener("click", pokreniPlayer);
    document.getElementById("nova").addEventListener("click", udjiUPlaylistu);
    document.getElementById("brisi").addEventListener("click", brisiPlaylistu);
}


/* SKRIPTA ZA DROPDOWN MENU - JQUERY */

$(".welcomeScreenOptions").ready(function(){        // funkcija za izbornik
    $("#izbor").hide();                             // ispočetka sakrij ul element izbor
    $(".welcomeScreenOptions").click(function(){    // na klik dugmeta
        $("#izbor").fadeToggle("medium");           // funkcija fadeToggle - sakrij/pokazi s prijelazom
    });
});


/* NAVIGACIJA */

function pokreniPlayer() {
    window.location = "player.html";
}

function udjiUPlaylistu() {
    window.location = "playlista.html";
}

function brisiPlaylistu() {
    window.location = "popis.html";
}