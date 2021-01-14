require('dotenv').config();
const discord_token = process.env.discord_token;
var Discord = require("discord.js");
var client = new Discord.Client();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Putting these vars here so they can be reset monthly to avoid -30 timespans
var LastSent = new Date(Date.now());  //Zup var

client.once('ready', () =>{
    console.log(`Ready as ${client.user.username}!`);
    GetZupan();
    setInterval(GetZupan(), 60*1000);  // 1 minute interval
});

console.log(discord_token);
client.login(discord_token);

//Test command
client.on('message', message => {
    if (message.content === 'ping') {
       message.reply('pong');
    }
});

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
        let Json_date = new Date(Date.parse(data[0].Datum));
        let datespan = Json_date.getDate() - LastSent.getDate();
        console.log('Date.now():' + (LastSent.getDate()) + ' / Date.Json():' + Json_date.getDate());
        console.log('(Zupanija) timespan is ' + datespan + ' day(s)\n---------------------------------------');

         //spaghetti fix
         if(Json_date.getMonth() - LastGlobSent.getMonth() == 0)
         {
             if(datespan <1)
                 return 0;
         }
 
         SendBigMessage(data);
         }
    }; 

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function SendBigMessage( data){
    LastSent = new Date(Date.now());

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
    let send = `**Županijske novine izdanje : ${data[0].Datum.split(" ")[0]}**\n${Aktivni}\n${Novozarazeni}\n${Umrli}`;

    //console.log(send + '\n---------------------------------------');
    client.channels.cache.get('459666776054169602').send(send);
    console.log('(Zupanija) Sent message\n---------------------------------------');
}
