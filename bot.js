require('dotenv').config();
const discord_token = process.env.discord_token;
var Discord = require("discord.js");
var client = new Discord.Client();
const fetch = require('node-fetch');

//Putting these vars here so they can be reset monthly to avoid -30 timespans
var LastZupSent = new Date();  //Zup var
LastZupSent.setDate(LastZupSent.getDate() );
var LastGlobSent = new Date();  //Glob var
LastGlobSent.setDate(LastGlobSent.getDate() )

client.once('ready', () =>{
    console.log(`Ready as ${client.user.username}!`);
    GetGlobal();
    GetZupan();
    setInterval(function(){GetGlobal(); GetZupan()}, 60*1000);  // 1 minute interval
});

//console.log(discord_token);
client.login(discord_token);

function GetZupan(){
    var url = 'https://www.koronavirus.hr/json/?action=po_danima_zupanijama';

    console.log('(Zupanija )Getting list\n---------------------------------------');

    fetch(url)
        .then(rsp => rsp.json())
        .then((json) => {
            const data = [
                {
                    "Zarazeni" : json[0].PodaciDetaljno[19].broj_zarazenih,
                    "Aktivni" : json[0].PodaciDetaljno[19].broj_aktivni,
                    "Umrli" : json[0].PodaciDetaljno[19].broj_umrlih,
                    "Datum" : json[0].Datum
                },
                {
                    "Zarazeni" : json[1].PodaciDetaljno[19].broj_zarazenih,
                    "Aktivni" : json[1].PodaciDetaljno[19].broj_aktivni,
                    "Umrli" : json[1].PodaciDetaljno[19].broj_umrlih,
                    "Datum" : json[1].Datum
                },
                {
                    "Zarazeni" : json[2].PodaciDetaljno[19].broj_zarazenih,
                    "Aktivni" : json[2].PodaciDetaljno[19].broj_aktivni,
                    "Umrli" : json[2].PodaciDetaljno[19].broj_umrlih,
                    "Datum" : json[2].Datum
                }
            ];
            let Json_date = new Date(Date.parse(data[0].Datum));
            let datespan = Json_date.getDate() - LastZupSent.getDate();
            console.log('Date.last():' + (LastZupSent.getDate()) + ' / Date.Json():' + Json_date.getDate());
            console.log('(Zupanija) timespan is ' + datespan + ' day(s)\n---------------------------------------');

            //spaghetti fix
            if(Json_date.getMonth() - LastZupSent.getMonth() == 0)
            {
                if(datespan <1)
                    return 0;
            }

            SendBigMessage(true, data)
        }
    );
}

function GetGlobal(){
    var url = 'https://www.koronavirus.hr/json/?action=podaci';

    console.log('(Hrvatska) Getting list\n---------------------------------------');

    fetch(url)
        .then(rsp => rsp.json())
        .then((json) => {
            const data = [
                {
                    "SlucajeviHrvatska" : json[0].SlucajeviHrvatska,
                    "IzlijeceniHrvatska" : json[0].IzlijeceniHrvatska,
                    "UmrliHrvatska" : json[0].UmrliHrvatska,
                    "Datum" : json[0].Datum
                },
                {
                    "SlucajeviHrvatska" : json[1].SlucajeviHrvatska,
                    "IzlijeceniHrvatska" : json[1].IzlijeceniHrvatska,
                    "UmrliHrvatska" : json[1].UmrliHrvatska,
                    "Datum" : json[1].Datum
                },
                {
                    "SlucajeviHrvatska" : json[2].SlucajeviHrvatska,
                    "IzlijeceniHrvatska" : json[2].IzlijeceniHrvatska,
                    "UmrliHrvatska" : json[2].UmrliHrvatska,
                    "Datum" : json[2].Datum
                }
            ];

            let Json_date = new Date(Date.parse(data[0].Datum));
            let datespan = Json_date.getDate() - LastGlobSent.getDate();
            console.log('Date.last():' + (LastGlobSent.getDate()) + ' / Date.Json():' + Json_date.getDate());
            console.log('(Hrvatska) timespan is ' + datespan + ' day(s)\n---------------------------------------');

            //spaghetti fix
            if(Json_date.getMonth() - LastGlobSent.getMonth() == 0)
            {
                if(datespan <1)
                    return 0;
            }

            SendBigMessage(false, data)
        }
    );
}

function SendBigMessage(flag, data){
    var send = 'Something broke with the machine: 500 (idk)';
    if(!flag){
        LastGlobSent = new Date(Date.now());

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
        LastZupSent = new Date(Date.now());

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

    var identifier = '(Hrvatska)';
    if(flag)
        identifier = '(Zupanija)';

    //console.log(send + '\n---------------------------------------');
    client.channels.cache.get('459666776054169602').send(send);
    console.log(identifier + ' Sent message\n---------------------------------------');
    }
