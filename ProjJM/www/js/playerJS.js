/* OTVARANJE BAZE S ISTIM PODACIMA */

var db;
var shortName = 'KoncGl';
var version = '1.0';
var displayName = 'Baza Playlista Aplikacije';
var maxSize = 65535;

db = openDatabase(shortName, version, displayName, maxSize);

function errorHandler(transaction, err) {
    alert('Greška: ' + err.message + ' kod: ' + err.code);
}

function funcOk() {
    console.log("Izvrseno!"); 
}



/* JAVASCRIPT KOD */

/* LISTA ZA NABAVU AUDIO SOURCE LINKOVA */
var audioSrcList = [];

/* EVENT LISTENERI, IZBOR VIDEA, PROVJERA UNOSA */

window.onload = function() {   
    var playListaTrenutno = "";
    var izborVidea = document.getElementById("vizualizacija");
    var video = document.getElementById("myVideo");
    
    dobaviPlayliste(); 
    document.getElementById("nazad").addEventListener("click", function() { window.location = "index.html"; });
    document.getElementById("izbor-playlista").addEventListener("change", function() { 
        if (document.getElementById("izbor-playlista").value == "nema")
        {
            console.log("odaberite playlistu");
            return;
        }
    
        else {
            audioSrcList = [];
            playListaTrenutno = document.getElementById("izbor-playlista").value; 
            dobaviAudio(playListaTrenutno, audioSrcList);
        }  
    });
    
    video.src = izborVidea.value;
    video.play();
    izborVidea.addEventListener("change", function() {
        video.src = izborVidea.value;
        video.play();
    });
}


/* FUNKCIJA ZAUSTAVLJANJA PLAYERA */

function zaustavi() {
    document.getElementById("player").pause();
    document.getElementById("player").currentTime = 0;
}


/* FUNKCIJA DOBAVLJANJA PLAYLISTA IZ BAZE PODATAKA I UČITAVANJA U ELEMENT SELEKCIJE */

function dobaviPlayliste() {
    var selekcija = document.getElementById("izbor-playlista");   
    var listaPlaylista = [];
    db.transaction(ucitajPlayliste, errorHandler, funcOk);
       
    function ucitajPlayliste(t) { t.executeSql('SELECT NazivPlayliste from Playlista;', [], obradaRezultati, errorHandler); }
    
    function obradaRezultati(t, r) {
         if (r != null && r.rows != null) {
            var dataCount = r.rows.length;
            for (var i = 0; i < dataCount; i++)
                {
                    var data = r.rows.item(i);
                    
                    if (!listaPlaylista.includes(data.NazivPlayliste)) {
                        listaPlaylista.push(data.NazivPlayliste);
                    }                 
                }                  
        }
        
       for (var i = 0; i < listaPlaylista.length; i++) {
            var opcija = document.createElement("option");
            opcija.value = listaPlaylista[i];
            opcija.appendChild(document.createTextNode(opcija.value));
            selekcija.appendChild(opcija);
        }
    }        
}


/* NABAVA AUDIO DATOTEKA PREMA ODABRANOJ PLAYLISTI */

function dobaviAudio(playListaTrenutno, audioSrcList) {
    var count = 0;
    var skladbaFd = document.getElementById("fd");
    var skladbaBk = document.getElementById("bk");
    var audioPlayBtn = document.getElementById("play");
        
    db.transaction(ucitajAudio, errorHandler, funcOk);
       
    function ucitajAudio(t) {
        t.executeSql('SELECT AudioSource from Playlista WHERE NazivPlayliste = ?;', [playListaTrenutno], obradaRezultati, errorHandler);       
    }
    
    function obradaRezultati(t, r) {
        if (r != null && r.rows != null) {
            var dataCount = r.rows.length;
            for (var i = 0; i < dataCount; i++) {
                var data = r.rows.item(i);
                audioSrcList.push(data.AudioSource);   
            }
        }
        
        skladbaFd.onclick = function() {
            if (count < audioSrcList.length - 1) {
                count++; 
                document.getElementById("player").autoplay = true;
                audioPokreni(audioSrcList, count);
            } 
        }
        
        skladbaBk.onclick = function() {
            if (count > 0) {
                count--; 
                document.getElementById("player").autoplay = true;
                audioPokreni(audioSrcList, count);
            }  
        }
        
        audioPlayBtn.onclick = function() {
               audioPokreni(audioSrcList, count);
        }
    }
}


/* POKRETANJE PLAYLISTE */

function audioPokreni(audioSrcList, count) {
    var audioPlayer = document.getElementById("player");
    audioPlayer.src = audioSrcList[count];
    audioPlayer.play();
    
    audioPlayer.onended = function() {
        audioPlayer.autoplay = true;
        count++;
        audioPlayer.src = audioSrcList[count];
        if (count == audioSrcList.length) {count = 0;}
        audioPokreni(audioSrcList, count);
    }  
}

















