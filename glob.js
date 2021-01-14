require('dotenv').config();
const discord_token = process.env.discord_token;
var Discord = require("discord.js");
var client = new Discord.Client();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Putting these vars here so they can be reset monthly to avoid -30 timespans
var LastGlobSent = new Date(Date.now());  //Glob var

client.once('ready', () =>{
    console.log(`Ready as ${client.user.username}!`);
    GetGlobal();
    GetZupan();
    setInterval(function(){GetGlobal();}, 60*1000);  // 1 minute interval
});

console.log(discord_token);
client.login(discord_token);

//Test command
client.on('message', message => {
    if (message.content === 'ping') {
       message.reply('pong');
    }
});

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
        let Json_date = new Date(Date.parse(data[0].Datum));
        let datespan = Json_date.getDate() - LastGlobSent.getDate();
        console.log('Date.now():' + LastGlobSent.getDate() + ' / Date.Json():' + Json_date.getDate());
        console.log('(Hrvatska) timespan is ' + datespan + ' day(s)\n---------------------------------------');
        
        //spaghetti fix
        if(Json_date.getMonth() - LastGlobSent.getMonth() == 0)
        {
            if(datespan <1)
                return 0;
        }

        SendBigMessage(true, data);
        }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function SendBigMessage(data){

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

    let send = `**Narodne Novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Novozarazeni}\n${Aktivni}\n${umrli}`;

    //console.log(send + '\n---------------------------------------');
    client.channels.cache.get('459666776054169602').send(send);
    console.log('(Hrvatska) Sent message\n---------------------------------------');
}
