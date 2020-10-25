const config = require('./config.json');
var DataSet = require('./DataSet.json');
var Archive = require('./ArchiveSet.json');
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Ready as ${client.user.username}!`);
    setInterval(function() {AreWeThere()})
    
});

client.login(config.token);

function AreWeThere() {
    var currdate = Date.now.apply();
    var jsondate = Date.parse(DataSet.datum);
    console.log('------------------------------------------\nThe current time difference is: ' 
                + ((currdate - jsondate)/3600000).toString() + '\n------------------------------------------');

    if(currdate - jsondate > 86400000) {
        ArchiveList();
    }
}

function ArchiveList() {
    SaveJson(JSON.stringify(DataSet), 'ArchiveSet.json');
    console.log('Archived yesterday data\n---------------------------------------');

    GetList();
}

function GetList() {
    console.log('Refreshing list\n---------------------------------------')

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();
    var xmlhttpreq2 = new XMLHttpRequest();
    var url = "https://www.koronavirus.hr/json/?action=podaci_zadnji";
    var urlz = "https://www.koronavirus.hr/json/?action=po_danima_zupanijama_zadnji";
    var raw = {
        zarazeni : 0,
        datum : "1970-1-1 00:00",
        novozarazeni : 0,
        aktivni : 0,
        Zupanija : {
            zarazeni : 0,
            novozarazeni : 0,
            datum : 0,
            ime : 0,
            morto : 0,
            aktiv : 0
        }
    };

    var goAhead = false; 
    var gOAhead = false;

    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText + '\n---------------------------------------')
        var data = JSON.parse(this.responseText);
        raw.zarazeni = data[0].SlucajeviHrvatska;
        raw.novozarazeni = data[0].SlucajeviHrvatska - Archive.zarazeni;
        raw.datum = data[0].Datum;
        let morto = data[0].UmrliHrvatska + data[0].IzlijeceniHrvatska;
        raw.aktivni = data[0].SlucajeviHrvatska - morto;

        goAhead = true;
        }
    }; 

    xmlhttpreq2.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText + '\n---------------------------------------')
        var data = JSON.parse(this.responseText);
        raw.Zupanija.datum = data[0].Datum;
        raw.Zupanija.ime = data[0].PodaciDetaljno[19].Zupanija;
        raw.Zupanija.zarazeni = data[0].PodaciDetaljno[19].broj_zarazenih;
        raw.Zupanija.novozarazeni = data[0].PodaciDetaljno[19].broj_zarazenih - Archive.Zupanija.zarazeni;
        raw.Zupanija.morto = data[0].PodaciDetaljno[19].broj_umrlih;
        raw.Zupanija.aktiv = data[0].PodaciDetaljno[19].broj_aktivni;

        gOAhead = true;
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    xmlhttpreq2.open("GET", urlz, true);
    xmlhttpreq2.send();

    var NotDone = true;
    setInterval( function() {
        if(goAhead && gOAhead && NotDone) {
            SaveJson(JSON.stringify(raw), 'DataSet.json').then( () => {
                SendBigMessage();
                NotDone = false;
            
            
            });
        }
    }, 500);
}

function SendBigMessage() {
    var DataSet = JSON.parse(fs.readFileSync('DataSet.json', {encoding:'utf-8'}));
    var Archive = JSON.parse(fs.readFileSync('ArchiveSet.json', {encoding:'utf-8'}));
    let the_message = `** Narodne Novine: Izdanje ${DataSet.datum.split(" ")[0]}**\n\n**Hrvatska:**\nAktivni: ${DataSet.aktivni}\n`+
        `Novozarazeni: ${DataSet.novozarazeni}(${DataSet.novozarazeni - Archive.novozarazeni})` +
        `\n\n**Zadarska županija:**\nNovozarazeni: ${DataSet.Zupanija.novozarazeni}(${DataSet.Zupanija.novozarazeni - Archive.Zupanija.novozarazeni})`+
        `\nAktivni: ${DataSet.Zupanija.aktiv}`;
    //console.log(the_message);
    client.channels.cache.get('459666776054169602').send(the_message);
}

function SaveJson(data, filename) {
    return new Promise(resolve => {
        fs.writeFile(filename, data, function (err) {
            if(err) throw err;
            console.log('Saved JSON file');
            console.log("Promise (SaveJson -> this.caller): Done\n---------------------------------------");
            resolve();
        })
    });
}