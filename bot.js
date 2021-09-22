require('dotenv').config();
const discord_token = process.env.discord_token;
const { Client, Intents} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const axios = require('axios');

//Putting these vars here so they can be reset monthly to avoid -30 timespans
var LastZupSent = new Date();  //Zup var
LastZupSent.setDate(LastZupSent.getDate() );
var LastGlobSent = new Date();  //Glob var
LastGlobSent.setDate(LastGlobSent.getDate() )

client.once('ready', () => {
	console.log('Ready!');
    // No more covid update, no worky on Heroku, don't care enough to fix for now.
    //setInterval( ()=> {GetGlob(); GetZupan();}, 3600000)
});

var Messages = [' nam se pridružio, imaš cedu pokraj šporeta.',
                ', sačekaj sekund, idem do tommya po pivicu.',
                ' daj mi sekund, moran lasanje izvadit iz špakera'
            ]
let rNum = Math.floor((Math.random() * Messages.length) + 1);

client.on('guildMemberAdd', function(member){
    const channel = await client.channels.fetch('459666776054169602');

    await channel.send(`${member.user}` + Messages[rNum])
});

client.on("guildMemberRemove", function(member){
    const channel = await client.channels.fetch('459666776054169602');

    await channel.send(`${member.displayName} pobiže on.`)
});

client.login(discord_token);

async function GetZupan(){
    var url = 'https://www.koronavirus.hr/json/?action=po_danima_zupanijama';

    console.log('(Zupanija) Getting list\n---------------------------------------');

    axios.get(url)
    .then(function (response) {
        // handle success
        let data = response.data;

        let dataDate = new Date();
        dataDate.setDate(data[0].Datum);
        // SendBigMessage(data, false);
        if(dataDate.getDate() - LastZupSent.getDate() > 0)
        {
            console.log('(Zupanija) Creating list\n---------------------------------------');
            SendBigMessage(data, false);
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}

async function GetGlob(){
    var url = 'https://www.koronavirus.hr/json/?action=podaci';

    console.log('(Hrvatska) Getting list\n---------------------------------------');

    axios.get(url)
    .then(function (response) {
        // handle success
        let data = response.data;

        let dataDate = new Date();
        dataDate.setDate(data[0].Datum);
        // SendBigMessage(data, true);
        if(dataDate.getDate() - LastZupSent.getDate() > 0)
        {
            console.log('(Hrvatska) Creating list\n---------------------------------------')
            SendBigMessage(data, true);
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}

async function SendBigMessage(data, flag) 
{
    if(!flag) {
        let aktivniLine = `Aktivni: ${data[0].PodaciDetaljno[19].broj_aktivni} (${diff(data[0].PodaciDetaljno[19].broj_aktivni, data[1].PodaciDetaljno[19].broj_aktivni)})`
        let NovozarazeniLine = `Novozarazeni: ${data[0].PodaciDetaljno[19].broj_zarazenih} (${diff(data[0].PodaciDetaljno[19].broj_zarazenih, data[1].PodaciDetaljno[19].broj_zarazenih)})`
        let UmrliLine = `Umrli: ${data[0].PodaciDetaljno[19].broj_umrlih} (${diff(data[0].PodaciDetaljno[19].broj_umrlih, data[1].PodaciDetaljno[19].broj_umrlih)})`

        let message = `**Zupanijski list ZADAR**\n---------------------\n*Izdanje:${data[0].Datum}*\n\n ${aktivniLine}\n ${NovozarazeniLine}\n ${UmrliLine}`;

        const channel = await client.channels.fetch('459666776054169602');

        await channel.send(message)
        console.log('(Zupanija) Sent list\n---------------------------------------');
    }
    else {
        let aktivniLine = `Zaraženo: ${data[0].SlucajeviHrvatska}`
            let tempUnoDay = diff(data[0].SlucajeviHrvatska, data[1].SlucajeviHrvatska);
        let NovozarazeniLine = `Novozaraženi: ${tempUnoDay} (${diff(tempUnoDay, diff(data[1].SlucajeviHrvatska, data[2].SlucajeviHrvatska))})`;
        let UmrliLine = `Umrli: ${data[0].UmrliHrvatska} (${diff(data[0].UmrliHrvatska, data[1].UmrliHrvatska)})`;
        let CijepljeniLine = `Cijepljeni: \n  ├─ Bruto utrošene doze: ${data[0].CijepljenjeBrUtrosenihDoza} (${diff(data[0].CijepljenjeBrUtrosenihDoza, data[1].CijepljenjeBrUtrosenihDoza)})` +
                            `\n  ├─ Prvom dozom: ${data[0].CijepljeniJednomDozom} (${diff(data[0].CijepljeniJednomDozom, data[1].CijepljeniJednomDozom)})` +
                            `\n  ├─ Drugom dozom: ${data[0].CijepljeniDvijeDoze} (${diff(data[0].CijepljeniDvijeDoze, data[1].CijepljeniDvijeDoze)})` + 
                            `\n  └─ Protekla 24 sata: ${data[0].CijepljeniUProtekla24} (${diff(data[0].CijepljeniUProtekla24, data[1].CijepljeniUProtekla24)})`;
        let IzlijeceniLine = `Izliječeni: ${data[0].IzlijeceniHrvatska} (${diff(data[0].IzlijeceniHrvatska, data[1].IzlijeceniHrvatska)})`

        let message = `**Narodni list HRVATISTAN**\n---------------------\n*Izdanje:${data[0].Datum}*\n\n ${aktivniLine}\n ${NovozarazeniLine}\n ${UmrliLine}\n ${CijepljeniLine}\n ${IzlijeceniLine}`;

        const channel = await client.channels.fetch('459666776054169602');

        await channel.send(message)
        console.log('(Hrvatska) Sent list\n---------------------------------------')
    }
}

function diff(a, b) 
{
    if(a - b > 0)
        return `+${a-b}`;
    else
        return `${a-b}`;
}