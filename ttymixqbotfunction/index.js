import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

const { TELEGRAM_BOT_TOKEN, WEBHOOK_ADDRESS } = process.env

const bot = new Telegraf(TELEGRAM_BOT_TOKEN, {
    telegram: { webhookReply: true }
})
bot.telegram.setWebhook(WEBHOOK_ADDRESS);

function parseMessage(text) {
  return text.toLowerCase().split(" ");
}

// Luetaan koodisanat ja niiden merkitykset
const tiedostoRaw = (tiedostonimi) => {
  return fs.readFileSync(path.resolve(__dirname, tiedostonimi), 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return "";
  }
  return data;
})};


// Vihjesanojen haku tiedostosta
const vihjeet = JSON.parse(tiedostoRaw('viestit.json'));
const vihjesanat = Object.keys(vihjeet);
console.log(vihjesanat);

const virheviestit = vihjeet.vituiksmanviestit;
const virheviestienLkm = virheviestit.length;

// Vihjekuvien (tiedostonimien) haku tiedostosta
const kuvavihjeet = JSON.parse(tiedostoRaw('kuvaviestit.json'));
const kuvavihjesanat = Object.keys(kuvavihjeet);
console.log(kuvavihjesanat);


bot.command('kukasiellaon', async (ctx) => {
  // Using context shortcut
  await ctx.reply(vihjeet.tervetuliaisviestiosa1)

  await new Promise(r => setTimeout(r, 5000));

  // Using context shortcut
  await ctx.reply(vihjeet.tervetuliaisviestiosa2)

  await new Promise(r => setTimeout(r, 5000));

  // Using context shortcut
  await ctx.reply(vihjeet.tervetuliaisviestiosa3)

})


bot.on(message('text'), async (ctx) => {

  const message = ctx.message.text;

  // Katsotaan, onko viestillä mitään merkitystä.
  const avainsanat = parseMessage(message);
  console.log(avainsanat);

  // Estetään liian monen avainsanan yrittäminen kerralla
  if (avainsanat.length > 5) {
    await ctx.reply(vihjeet.liikaasanoja);
    return;
  }

  let wordFound = false;

  // Tarkistetaan, antaako vihjesana vihjeen
  avainsanat.forEach(sana => {
    if (vihjeet[sana] != undefined) {
      // console.log(`OOSUMA LÖYTYI! Nimittäin teksti \n${vihjeet[sana]}`)
      // Using context shortcut
      ctx.reply(vihjeet[sana])
      wordFound = true;
    }
    else {
      console.log(`Ei täsmää sanavihjeistä sana ${sana}`)
    };
  });

  await new Promise(r => setTimeout(r, 5000));

  // Tarkistetaan, antaako vihjesana kuvavihjeen -- Ei toimi Azuressa
  // avainsanat.forEach(sana => {
  //   if (kuvavihjeet[sana] != undefined) {
  //     console.log(`OOSUMA LÖYTYI! Nimittäin teksti \n${kuvavihjeet[sana]}`)
  //     // Using context shortcut
  //     // ctx.reply(kuvavihjeet[sana])
  //     ctx.replyWithPhoto({source: kuvavihjeet[sana]})
  //     wordFound = true;
  //   }
  //   else {
  //     console.log(`Ei täsmää kuvavihjeistä sana ${sana}`)
  //   };
  // });

  
  const randomVastausInt = Math.floor(Math.random() * virheviestienLkm);
  // Mikäli vihjesanaa ei löytynyt viestistä
  wordFound ? "" : ctx.reply(virheviestit[randomVastausInt]);
  
})

// Azure Function:
module.exports = async function(context, req) {
    return bot.handleUpdate(req.body, context.res)
}
