/* SQL UPITI I BAZA PODATAKA */


/* TABLICE */

var tablicaIzvodjac = ' CREATE TABLE IF NOT EXISTS Izvodjac \
                     (IdIzvodjac INTEGER NOT NULL PRIMARY KEY, \
                     JamIdIzvodjac INTEGER NOT NULL, \
                     NazivAutora TEXT NOT NULL, \
                     Tagovi TEXT NOT NULL \
                     ) ';
    

var tablicaSkladba = ' CREATE TABLE IF NOT EXISTS Skladba \
                    (IdSkladbe INTEGER NOT NULL PRIMARY KEY, \
                    IdIzvodjac INTEGER NOT NULL, \
                    NazivSkladbe TEXT NOT NULL, \
                    JamIdSkladba INTEGER NOT NULL, \
                    FOREIGN KEY (IdIzvodjac) REFERENCES Izvodjac (IdIzvodjac) \
                    ) ';


var tablicaPlaylista = ' CREATE TABLE IF NOT EXISTS Playlista \
                    (IdPlaylista INTEGER NOT NULL PRIMARY KEY, \
                    IdSkladba INTEGER NOT NULL, \
                    NazivPlayliste TEXT NOT NULL, \
                    NazivKategorije TEXT NOT NULL, \
                    AudioSource TEXT NOT NULL, \
                    FOREIGN KEY (IdSkladba) REFERENCES IdSkladba (IdSkladba) \
                    ) ';


/* UNOSI PODATAKA */

var insertIzvodjac = ' INSERT INTO Izvodjac(JamIdIzvodjac, NazivAutora, Tagovi) VALUES (?, ?, ?)';
var insertSkladba = ' INSERT INTO Skladba(IdIzvodjac, JamIdSkladba, NazivSkladbe) VALUES (?, ?, ?)';
var insertPlaylista = ' INSERT INTO Playlista(IdSkladba, NazivKategorije, AudioSource, NazivPlayliste) VALUES (?, ?, ?, ?)';


/* SPAJANJE TABLICA */

var spojiTablice = ' SELECT NazivPlayliste, s.JamIdSkladba, s.NazivSkladbe, i.JamIdIzvodjac \ FROM Playlista p, Skladba s, Izvodjac i \ WHERE NazivPlayliste = ?';


/* BRISANJE TABLICA */ 


var testDrop = ' DROP TABLE Izvodjac';
var testDrop2 = ' DROP TABLE Skladba';
var testDrop3 = ' DROP TABLE Playlista';


/* BAZA PODATAKA I FUNKCIJE */

var db;
var shortName = 'KoncGl';
var version = '1.0';
var displayName = 'Baza Playlista Aplikacije';
var maxSize = 65535;

/* OTVARANJE BAZE SA SPECIFICIRANIM PODACIMA I KREIRANJE TABLICA NA TEMELJU DEFINIRANIH UPITA */

db = openDatabase(shortName, version, displayName, maxSize);
db.transaction(stvoriTablicu, errorHandler, funcOk);

function errorHandler(transaction, err) {
    alert('Greška: ' + err.message + ' kod: ' + err.code);
}

function funcOk() {
    console.log("Izvrseno!"); 
}

function stvoriTablicu(tx) {   
    //tx.executeSql(testDrop2, [], funcOk, errorHandler);
    //tx.executeSql(testDrop, [], funcOk, errorHandler);
    //tx.executeSql(testDrop3, [], funcOk, errorHandler);
      
    tx.executeSql(tablicaIzvodjac, [], funcOk, errorHandler);
    tx.executeSql(tablicaSkladba, [], funcOk, errorHandler);
    tx.executeSql(tablicaPlaylista, [], funcOk, errorHandler);
}
 

/* JAVASCRIPT KOD */

var trazeniZanr; 

/* EVENT LISTENERI I PRIKAZ ELEMENATA */

window.onload = function() {   
    
    document.getElementById("nazad").addEventListener("click", function() { window.location = "index.html"; });
    
    dobaviPostojecePlayliste();
    sakrijElemente();
    
    document.getElementById("playliste-unos").addEventListener("change", function() { 
    if (document.getElementById("playliste-unos").value == "")
        {
            document.getElementById("nazivPlay").value = "";  
            document.getElementById("playlista").disabled = false;
            document.getElementById("nazivPlay").disabled = false;
            sakrijElemente();     
        }
    
        else {
            var splitValue = document.getElementById("playliste-unos").value.split('#');
            console.log(splitValue);
            document.getElementById("playlista").value = splitValue[0];
            document.getElementById("playlista").disabled = true;
            document.getElementById("nazivPlay").value = splitValue[1];
            document.getElementById("nazivPlay").disabled = true;
            prikaziElemente();
        }      
    });
    
    document.getElementById("playlista").addEventListener("change", function() {                   
                if (document.getElementById("playlista").value != "nema") { prikaziElemente(); }         
                else { sakrijElemente(); }      
            });
}


/* FUNKCIJE ZA PRIKAZ ELEMENATA NA STRANICI */

function sakrijElemente() {    
    document.getElementById("feed-container").style.display = "none";
    document.getElementById("sadrzaj-tablice").style.display = "none";
    document.getElementById("hideme").style.display = "none"; 
}


function prikaziElemente() {
    document.getElementById("feed-container").style.display = "block";
    document.getElementById("sadrzaj-tablice").style.display = "block";
    document.getElementById("hideme").style.display = "block";   
    document.getElementById("posalji").addEventListener("click", dobaviFeed);      
}


/* ZAHTJEV ZA NABAVOM PODATAKA O GLAZBENICIMA PREKO ATRIBUTA TAG - PRETRAGA ZANROVA */

function dobaviFeed() {
    document.getElementById("sadrzaj-tablice").innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            { dobaviPodatke(this); }        
    };
    
    trazeniZanr = document.getElementById("zanr").value; 
    var addr = "https://api.jamendo.com/v3.0/artists/musicinfo/?client_id=746be329&format=jsonpretty&limit=200&order=popularity_total&tag="+trazeniZanr;
    xhttp.open('GET',addr, true);
    xhttp.send();       
}


function dobaviPodatke(xhttp) {
    var podaci = JSON.parse(xhttp.responseText);
    var brPodataka = parseInt(podaci.headers.results_count);
    document.getElementById("feed-container").innerHTML = "";   
    pretragaRezultati(brPodataka, podaci.results);    
}


/* UCITAVANJE REZULTATA I FUNKCIJA U ELEMENTE */

function pretragaRezultati(brPodataka, rezultati) {
    var counter = 0;
    var feed = document.getElementById("feed-container");   
    var content = document.getElementById("sadrzaj-tablice");
    var brRez = document.createElement("p");
    var btnNaprijed = document.createElement("button");
    var btnNazad = document.createElement("button");
    
    brRez.innerHTML = "Stranica: "+(counter+1);
    feed.appendChild(brRez);
    
    btnNazad.appendChild(document.createTextNode("<"));
    feed.appendChild(btnNazad);
    
    btnNaprijed.appendChild(document.createTextNode(">"));
    feed.appendChild(btnNaprijed);
    
    
    izradiTablicu(3, 0, 10, rezultati);     // Na temelju dobivenih rezultata kreiraj tablicu 
    
    /* FUNKCIJE ZA UCITAVANJE PODATAKA PREMA ODABRANOM BROJU STRANICE */
    btnNazad.onclick = function() {
        if (counter == 0) { return; }
        else {
            content.innerHTML = "";
            counter--;
            var data = counter * 10;
            brRez.innerHTML = "Stranica: "+ (counter+1);
            izradiTablicu(3, data, 10, rezultati);
        }
    }
    
    btnNaprijed.onclick = function() {
        if (counter == (Math.floor(brPodataka/10))) { return; }
        else {
            content.innerHTML = "";
            counter++;
            var data = counter * 10;
            brRez.innerHTML = "Stranica: "+ (counter+1);
            izradiTablicu(3, data, 10, rezultati);   
        }
    } 
}


/* FUNKCIJA KOJA OMOGUĆAVA PRESLUŠAVANJE GLAZBE PRIJE DODAVANJA U PLAYLISTU */

function poslusajSkladbu(rezultati) {
    localStorage.setItem("izbor", rezultati);
    console.log(localStorage.getItem("izbor"));   
    document.getElementById("embedPlayer").src = localStorage.getItem("izbor");
    document.getElementById("embedPlayer").play();
}


/* UČITAVANJE POSTOJEĆIH PLAYLISTA U ELEMENT SELEKCIJE - AKO JE JEDNA OD OPCIJA ODABRANA, ELEMENTI UNOSA NAZIVA I KATEGORIJE SE ZAKLJUCAVAJU */

function dobaviPostojecePlayliste() {
    var selekcija = document.getElementById("playliste-unos");
    var listaPlaylista = [];
    var listaKategorija = [];
    db.transaction(ucitajPlayliste, errorHandler, funcOk);
    
    function ucitajPlayliste(t) {
        t.executeSql('SELECT NazivPlayliste, NazivKategorije from Playlista;', [], obradaRezultati, errorHandler);
    }
    
    function obradaRezultati(t, r) {  
         if (r != null && r.rows != null) {
            var dataCount = r.rows.length;
            for (var i = 0; i < dataCount; i++)
                {
                    var data = r.rows.item(i);
                    
                    if (!listaPlaylista.includes(data.NazivPlayliste)) {
                        listaPlaylista.push(data.NazivPlayliste);
                        listaKategorija.push(data.NazivKategorije)
                    }   
                } 
        }
        
       for (var i = 0; i < listaPlaylista.length; i++) {
            var opcija = document.createElement("option");
            opcija.value = listaKategorija[i]+"#"+listaPlaylista[i];
            opcija.appendChild(document.createTextNode(listaPlaylista[i]));
            selekcija.appendChild(opcija);
        }
    }      
}


/* DODAVANJE SKLADBI U ODABRANU / KREIRANU LISTU */

function dodajUPlayListu(podaci, i) {
    var modL = document.getElementById("skladbe");
    var dodajBtn = document.createElement("button");
    dodajBtn.appendChild(document.createTextNode("+ "));
    dodajBtn.id = i;
    dodajBtn.onclick = function() {
        var nazivIzvodjaca = podaci.results[0].name;
        var idIzvodjaca = parseInt(podaci.results[0].id);
        var nazivZanra = localStorage.getItem("tagovi").split(',');
        var idSkladbe = podaci.results[0].tracks[i].id;
        var nazivSkladbe = podaci.results[0].tracks[i].name;
        var audioSource = podaci.results[0].tracks[i].audio;
        var nazivKategorije;
        var nazivPlayliste;
        
        if (document.getElementById('playlista').value != "nema")
            { nazivKategorije = document.getElementById('playlista').value; }
        else {
            alert('Odaberite kategoriju!');
            return;
        }
        
        if (document.getElementById('nazivPlay').value != "")
            { nazivPlayliste = document.getElementById('nazivPlay').value; }
        else {
            alert('Unesite naziv!');
            return;
        }
         
        function dodajIzvodjaca(t) { t.executeSql(insertIzvodjac, [idIzvodjaca, nazivIzvodjaca, nazivZanra], funcOk, errorHandler); } 
        function dodajSkladbu(t) { t.executeSql(insertSkladba, [idIzvodjaca, idSkladbe, nazivSkladbe], funcOk, errorHandler); }
        function kreirajPlayListu(t) { t.executeSql(insertPlaylista, [idSkladbe, nazivKategorije, audioSource, nazivPlayliste]); }
        
        db.transaction(citajPodatke, errorHandler, funcOk);

        function citajPodatke(t) { t.executeSql(spojiTablice, [nazivPlayliste], obradaRezultata, errorHandler); }
        function obradaRezultata(t, r) {
            console.log(r);
            signalIzvodjac = false;
            signalSkladba = false;
            signalPlaylista = false;
            
            if (r != null && r.rows != null) {
                var dataCount = r.rows.length;
                for (var i = 0; i < dataCount; i++) {
                    var data = r.rows.item(i);
                    
                    if (data.JamIdIzvodjac == idIzvodjaca) { 
                        signalIzvodjac = true; 
                    } 
                    
		            if (data.JamIdSkladba == idSkladbe) { 
                        if (data.NazivPlayliste == nazivPlayliste) {         
				                signalPlaylista = true; 
                        }
                        signalSkladba = true;	             
			         }
                }
                
            if (signalIzvodjac == false) { db.transaction(dodajIzvodjaca, errorHandler, funcOk); }         
            else { signalIzvodjac = false; console.log("izvodjac postoji"); }  
                  
		    if (signalSkladba == false) { 
                db.transaction(dodajSkladbu, errorHandler, funcOk);
                if (signalPlaylista == false) { db.transaction(kreirajPlayListu, errorHandler, funcOk);   }
		        else { signalPlaylista = false; console.log("skladba postoji na playlisti"); }  
            }
                
            else { signalSkladba = false; console.log("skladba postoji");}
                
            
                    
            }
        }      
    }       
    
    modL.appendChild(dodajBtn);
}


/* SLANJE ZAHTJEVA ZA SVIM SKLADBAMA ODABRANOG IZVODJACA */

function dobaviSkladbeIzvodjaca(aid) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            {       
                var modL = document.getElementById("skladbe");
                var podaci = JSON.parse(this.responseText);
                var brSkladbi;     
                
                if (podaci.results.length == 0) { modL.innerHTML = "Nema pjesama!"; }
                else {
                    brSkladbi = podaci.results[0].tracks.length; 
                    for(var i = 0; i < brSkladbi; i++)  {
                    
                    var audioLnk = podaci.results[0].tracks[i].audio;         
                    var br = document.createElement("br");
                    var imeSkladbe = podaci.results[0].tracks[i].name;
                    
                    var lnk = document.createElement('a');
                    lnk.style.color = "white";
                    lnk.setAttribute("border-bottom", 1);
                        
                    dodajUPlayListu(podaci, i);
                    lnk.src = audioLnk;
                    lnk.onclick = function() {poslusajSkladbu(this.src);}
                    lnk.appendChild(document.createTextNode(imeSkladbe));
                    lnk.appendChild(br);
                    
                    modL.appendChild(lnk);                  
                    }
                }
                                      
            }         
    }
    
    var addr = "https://api.jamendo.com/v3.0/artists/tracks/?client_id=746be329&format=jsonpretty&limit=20&id="+aid;
    console.log(addr);
    xhttp.open('GET',addr, true);
    xhttp.send();
}


/* SLUZI KASNIJE ZA SPREMANJE U BAZU PODATAKA */

function posaljiZanrove(aid) {
    var xhttpZanr = new XMLHttpRequest();
    xhttpZanr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var podaci = JSON.parse(this.responseText);
            localStorage.setItem("tagovi", podaci.results[0].musicinfo.tags);      
        }   
    }
    addr = "https://api.jamendo.com/v3.0/artists/musicinfo/?client_id=746be329&format=jsonpretty&id="+aid;
    xhttpZanr.open('GET', addr, true);
    xhttpZanr.send();
}


/* FUNKCIJA ZA IZRADU TABLICE REZULTATA NA TEMELJU DOBIVENIH PODATAKA */

function izradiTablicu(m, data, n, rezultati) {  
    var body = document.getElementById("sadrzaj-tablice");  
    var tablica = document.createElement("table");  
    tablica.style.width = '100%';   
    var tBody = document.createElement('tbody');
   
    for (var i = 0; i <= n; i++)
        {
            var tRed = document.createElement('tr');
            tBody.appendChild(tRed);
            data++;
             
            for (var j = 0; j < m; j++)
                {
                    var tStupac = document.createElement('td'); 
                    var tBtn = document.createElement('button');
                    var kliknuto;
                    
                    if (i == 0)
                        { 
                            if (j == 0)
                             {
                                tStupac.appendChild(document.createTextNode("ID"));
                             }
                            
                            else if (j == 1)
                             {
                                tStupac.appendChild(document.createTextNode("Ime"));
                             }
                        }                            
                    
                    
                    else {
                        if (j == 0)
                             {   
                                var childId = document.createTextNode(rezultati[data-2].id);
                                tStupac.appendChild(childId);
                             }
                            
                        else if (j == 1)
                             {            
                                var childName = document.createTextNode(rezultati[data-2].name);
                                tStupac.appendChild(childName);    
                             }
                        
                        else if (j == 2)
                            {
                                tBtn.appendChild(document.createTextNode(">"));                       
                                tBtn.id = rezultati[data-2].id;
                                tBtn.onclick = function() { kliknuto = this.id; }
                                tStupac.appendChild(tBtn);      
                            }                     
                    }
                       
                    tStupac.setAttribute('height', 5);        
                    tRed.appendChild(tStupac);
                    tBtn.addEventListener("click", function() {
                        
                        document.getElementById("skladbe").innerHTML = "";
                        var modal = document.getElementById('myModal'); 
                        modal.style.display = "block";         
                        posaljiZanrove(kliknuto);
                            
                        window.onclick = function(event) {
                            if (event.target == modal) {
                                modal.style.display = "none";
                                document.getElementById("embedPlayer").pause();
                                document.getElementById("embedPlayer").currentTime = 0;
                            }
                        }
                        dobaviSkladbeIzvodjaca(kliknuto);});
                    
                    }
            }
     
    tablica.appendChild(tBody);
    body.appendChild(tablica);     
   
}