require('dotenv').config();
const discord_token = process.env.discord_token;
var Discord = require("discord.js");
var client = new Discord.Client();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

client.once('ready', () =>{
    console.log(`Ready as ${client.user.username}!`);
    GetGlobal();
    GetZupan();
    setInterval(function(){GetGlobal(); GetZupan()}, 60*1000);
});

console.log(discord_token);
client.login(discord_token);
//Test command
client.on('message', message => {

    if (message.content === 'ping') {

       message.reply('pong');

       }

});

//Glob var
var LastZupSent = new Date(Date.now.apply());

function GetZupan(){
    var url = 'https://www.koronavirus.hr/json/?action=po_danima_zupanijama';

    console.log('(Zupanija )Getting list\n---------------------------------------');

    //The part that activates when ever it feels like it.
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200){
        //console.log(this.responseText + '\n---------------------------------------');
        var response = JSON.parse(this.responseText);
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

        //If the time difference between now and JSON.date greater then 40s (40s past since JSON.date was created)
        let the_date = new Date(Date.parse(data[0].Datum)).getDate();
        let datespan = the_date - LastZupSent.getDate();
        console.log('Date.now():' + LastZupSent.getDate() + ' / Date.Json():' + the_date);
        console.log('(Zupanija) timespan is ' + datespan + ' day(s)\n---------------------------------------');
        if(true)
        return 0;
        
        SendBigMessage(false, data);
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Glob var
var LastGlobSent = new Date();

function GetGlobal(){
    var url = 'https://www.koronavirus.hr/json/?action=podaci';

    console.log('(Hrvatska) Getting list\n---------------------------------------');

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
            },{
            SlucajeviHrvatska : response[1].SlucajeviHrvatska, 
            UmrliHrvatska : response[1].UmrliHrvatska,
            IzlijeceniHrvatska : response[1].IzlijeceniHrvatska,
            },{
                SlucajeviHrvatska : response[2].SlucajeviHrvatska, 
            }];

        //If the time difference between now and JSON.date greater then 40s (40s past since JSON.date was created)
        let the_date = new Date(Date.parse(data[0].Datum)).getDate();
        let datespan = the_date - LastGlobSent.getDate();
        console.log('Date.now():' + LastGlobSent.getDate() + ' / Date.Json():' + the_date);
        console.log('(Hrvatska) timespan is ' + datespan + ' day(s)\n---------------------------------------');
        if(datespan <1)
        return 0;

        SendBigMessage(true, data);
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function SendBigMessage(flag, data){
    var send = 'Something broke with the machine: 500 (idk)';
    if(flag){
        LastZupSent = Date().now;

        var morto = data[0].SlucajeviHrvatska - data[0].IzlijeceniHrvatska - data[0].UmrliHrvatska;

        var diffAktiv = morto - (data[1].SlucajeviHrvatska - data[1].IzlijeceniHrvatska - data[1].UmrliHrvatska);
        if(diffAktiv > 0)
            diffAktiv = '+' + diffAktiv.toString();

        var diffnovo = (data[0].SlucajeviHrvatska - data[1].SlucajeviHrvatska) - (data[1].SlucajeviHrvatska - data[2].SlucajeviHrvatska);
        if(diffnovo > 0)
            diffnovo = '+' + diffnovo.toString();

        var diffumrli = data[0].UmrliHrvatska - data[1].UmrliHrvatska;
        if(diffumrli > 0)
            diffumrli = '+' + diffumrli.toString();

        var Aktivni = `Aktivni : ${morto} (${diffAktiv})`;
        var Novozarazeni = `Novozarazeni : ${data[0].SlucajeviHrvatska - data[1].SlucajeviHrvatska} (${diffnovo})`;
        var umrli = `Umrli : ${data[0].UmrliHrvatska} (${diffumrli})`;
        send = `**Narodne Novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Novozarazeni}\n${Aktivni}\n${umrli}`;
    }
    else{
        LastGlobSent = Date().now;

        var diffAktiv = data[0].Aktivni - data[1].Aktivni;
        if(diffAktiv > 0)
            diffAktiv = '+' + diffAktiv.toString();

        var diffNovo = (data[0].Zarazeni - data[1].Zarazeni) - (data[1].Zarazeni - data[2].Zarazeni);
        if(diffNovo > 0)
            diffNovo = '+' + diffNovo.toString();

        var diffUmrli = data[0].Umrli - data[1].Umrli;
        if(diffUmrli > 0)
            diffUmrli = '+' + diffUmrli.toString();

        var Umrli = `Umrli : ${data[0].Umrli} (${diffUmrli})`;
        var Novozarazeni = `Novozarazeni : ${data[0].Zarazeni - data[1].Zarazeni} (${diffNovo})`;        
        var Aktivni = `Aktivni : ${data[0].Aktivni} (${diffAktiv})`;
        send = `**Županijske novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Aktivni}\n${Novozarazeni}\n${Umrli}`;
    }

    var identifier = '(Zupanija)';
    if(flag)
        identifier = '(Hrvatska)';
    //console.log(send + '\n---------------------------------------');
    client.channels.cache.get('459666776054169602').send(send);
    console.log(identifier + 'Sent message\n---------------------------------------');
}
