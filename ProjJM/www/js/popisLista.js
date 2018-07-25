/* SQL UPITI */

var spojiTablice = ' SELECT NazivPlayliste, NazivKategorije, s.NazivSkladbe, i.NazivAutora \
                    FROM Playlista p   \
                    INNER JOIN Skladba s ON p.IdSkladba = s.JamIdSkladba   \
                    INNER JOIN Izvodjac i ON s.IdIzvodjac = i.JamIdIzvodjac \
                    WHERE NazivPlayliste = ?';

var brisiPlaylistu = ' DELETE FROM Playlista WHERE NazivPlayliste = ?;';

    

/* OTVARANJE / KREIRANJE BAZE PODATAKA */

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


/* EVENT LISTENERI, PROVJERA UNOSA, PRIKAZ ELEMENATA */

window.onload = function() {
    document.getElementById("nazad").addEventListener("click", function() {
        window.location = "index.html";
    });
    
    var playListaTrenutno = "";
    dobaviPListe();
    $('#info').hide();
    $('#brisi-playlistu').hide();
    document.getElementById("popis-playlista").addEventListener("change", function() { 
        if (document.getElementById("popis-playlista").value == "nema")
        {
            $('#info').hide();
            $('#info').fadeIn(400);  
            $('#brisi-playlistu').hide();
            document.getElementById("info").innerHTML = "<h1>Informacije o playlisti</h1>";
            document.getElementById("info").innerHTML += "Odaberite playlistu!";
            return;
        }
    
        else {
            $('#info').hide();
            $('#info').fadeIn(400);
            $('#brisi-playlistu').hide();
            $('#brisi-playlistu').fadeIn(400);
            playListaTrenutno = document.getElementById("popis-playlista").value; 
            playlistaInfo(playListaTrenutno);
            document.getElementById("brisi-playlistu").addEventListener("click", function() { brisiPlayLS(playListaTrenutno); });   
        }   
    });
}

/* DOBAVI POSTOJEĆE PLAYLISTE */

function dobaviPListe() {
    var selekcija = document.getElementById("popis-playlista");
    var listaPlaylista = [];
    
    db.transaction(ucitajPlayliste, errorHandler, funcOk);
    
    function ucitajPlayliste(t) { t.executeSql('SELECT NazivPlayliste, NazivKategorije from Playlista;', [], obradaRezultati, errorHandler); }
    
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
            opcija.appendChild(document.createTextNode(listaPlaylista[i]));
            selekcija.appendChild(opcija);
        }
    }    
}


/* DOBAVI INFORMACIJE O PLAYLISTI - UPIT spojiTablice */

function playlistaInfo(playListaTrenutno) {
    
    db.transaction(ucitajInfo, errorHandler, funcOk);
    
    function ucitajInfo(t) { t.executeSql(spojiTablice, [playListaTrenutno], obradaRezultata, errorHandler); }
    
    function obradaRezultata(t, r) {     
        document.getElementById("info").innerHTML = "<h1>Informacije o playlisti</h1>";
        document.getElementById("info").innerHTML += "<h2>Naziv playliste: " + playListaTrenutno + "<h2>";
        if (r != null && r.rows != null) {
            var dataCount = r.rows.length;
            for (var i = 0; i < dataCount; i++)
                {
                    var data = r.rows.item(i);        
                    document.getElementById("info").innerHTML += (i+1)+". "+data.NazivAutora + " - " + data.NazivSkladbe+"<br>";  
                }            
        }          
    }    
}

/* BRISI PLAYLISTU UKOLIKO KORISNIK TO POTVRDI */

function brisiPlayLS(playListaTrenutno) {
    
    var selekcija = document.getElementById("popis-playlista");
    var divInfo = document.getElementById("info");
    var potvrda = confirm("Jeste li sigurni da želite obrisati playlistu?");
    
    if (potvrda) {
        db.transaction(obrisiPl, errorHandler, funcOk);
        divInfo.innerHTML = "";
        selekcija.remove(playListaTrenutno);
    }
    
    function obrisiPl(t) { t.executeSql(brisiPlaylistu, [playListaTrenutno], funcOk, errorHandler); }
}


