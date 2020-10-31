const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log(`Ready as ${client.user.username}!`);
    GetGlobal();
    GetZupan();
    setInterval(function() {GetGlobal(); GetZupan()}, 60*1000);
});

client.login(config.token);

function GetZupan() {
    var url = 'https://www.koronavirus.hr/json/?action=po_danima_zupanijama';

    console.log('(Zupanija )Getting list\n---------------------------------------');

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();

    //The part that activates when ever it feels like it.
    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        //console.log(this.responseText + '\n---------------------------------------');
        let response = JSON.parse(this.responseText);
        var data = [{
            Datum : response[0].Datum,
            Aktivni : response[0].PodaciDetaljno[19].broj_aktivni,
            Umrli : response[0].PodaciDetaljno[19].broj_umrlih,
            Zarazeni : response[0].PodaciDetaljno[19].broj_zarazenih
        },{
            Aktivni : response[1].PodaciDetaljno[19].broj_aktivni,
            Umrli : response[1].PodaciDetaljno[19].broj_umrlih,
            Zarazeni : response[1].PodaciDetaljno[19].broj_zarazenih
        },{
            Zarazeni : response[2].PodaciDetaljno[19].broj_zarazenih
        }];

        //If the time difference between now and JSON.date is under 19h
        let timespan = Date.now.apply() - Date.parse(data[0].Datum);
        console.log('(Zupanija) timespan is ' + timespan + 'ms\n---------------------------------------');
        if(timespan < 68400000 && timespan > 40000)
            return 0;

        SendBigMessage(false, data);
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function GetGlobal() {
    /*
    repetition protection goes here 
    */

    var url = 'https://www.koronavirus.hr/json/?action=podaci';

    console.log('(Hrvatska) Getting list\n---------------------------------------');

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        //console.log(this.responseText + '\n---------------------------------------');
        let response = JSON.parse(this.responseText);
        var data = [{
            SlucajeviHrvatska : response[0].SlucajeviHrvatska, 
            UmrliHrvatska : response[0].UmrliHrvatska,
            IzlijeceniHrvatska : response[0].IzlijeceniHrvatska,
            Datum : response[0].Datum
            }, {
            SlucajeviHrvatska : response[1].SlucajeviHrvatska, 
            UmrliHrvatska : response[1].UmrliHrvatska,
            IzlijeceniHrvatska : response[1].IzlijeceniHrvatska,
            }, {
                SlucajeviHrvatska : response[2].SlucajeviHrvatska, 
            }];

        //If the time difference between now and JSON.date is under 19h
        let timespan = Date.now.apply() - Date.parse(data[0].Datum);
        console.log('(Hrvatska) timespan is ' + timespan + 'ms\n---------------------------------------');
        if(timespan < 68400000 && timespan > 40000)
            return 0;

        SendBigMessage(true, data);
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function SendBigMessage(flag, data) {
    var send = 'Something broke with the machine: 500 (idk)';
    if(flag) {
        var morto = data[0].SlucajeviHrvatska - data[0].IzlijeceniHrvatska - data[0].UmrliHrvatska;

        var diffAktiv = morto - (data[1].SlucajeviHrvatska - data[1].IzlijeceniHrvatska - data[1].UmrliHrvatska);
        if(diffAktiv > 0)
            diffAktiv = '+' + diffAktiv.toString();

        var diffnovo = (data[0].SlucajeviHrvatska - data[1].SlucajeviHrvatska) - (data[1].SlucajeviHrvatska - data[2].SlucajeviHrvatska);
        if(diffnovo > 0)
            difnovo = '+' + difnovo.toString();

        var diffumrli = data[0].UmrliHrvatska - data[1].UmrliHrvatska;
        if(diffumrli > 0)
            diffumrli = '+' + diffumrli.toString();

        var Aktivni = `Aktivni : ${morto} (${diffAktiv})`;
        var Novozarazeni = `Novozarazeni : ${data[0].SlucajeviHrvatska - data[1].SlucajeviHrvatska} (${diffnovo})`;
        var umrli = `Umrli : ${data[0].UmrliHrvatska} (${diffumrli})`;
        send = `**Narodne Novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Novozarazeni}\n${Aktivni}\n${umrli}`;
    }
    else {
        let diffAktiv = data[0].Aktivni - data[1].Aktivni;
        if(diffAktiv > 0)
            diffAktiv = '+' + diffAktiv.toString();

        let diffNovo = (data[0].Zarazeni - data[1].Zarazeni) - (data[1].Zarazeni - data[2].Zarazeni);
        if(diffNovo > 0)
            diffNovo = '+' + diffNovo.toString();

        let diffUmrli = data[0].Umrli - data[1].Umrli;
        if(diffUmrli > 0)
            diffUmrli = '+' + diffUmrli.toString();

        var Umrli = `Umrli : ${data[0].Umrli} (${diffUmrli})`;
        var Novozarazeni = `Novozarazeni : ${data[0].Zarazeni - data[1].Zarazeni} (${diffNovo})`;        
        var Aktivni = `Aktivni : ${data[0].Aktivni} (${diffAktiv})`;
        send = `**Županijske novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Aktivni}\n${Novozarazeni}\n${Umrli}`;
    }

    let identifier = '(Zupanija)';
    if(flag)
        identifier = '(Hrvatska)';
    //console.log(send + '\n---------------------------------------');
    client.channels.cache.get('459666776054169602').send(send);
    console.log(identifier + 'Sent message\n---------------------------------------');
}
