const { Client, MessageEmbed } = require('discord.js');

const Utils = require('./utils'); 

const https = require('https');
const config = require('./config');

const bot = new Client({
  fetchAllMembers: false
});

bot.on('ready', () => {
  bot.user.setActivity('Revving up', { type: 'PLAYING' }); 
  console.log(`EVENT: (READY) Logged in as ${bot.user.tag}.`); 
});

bot.on('message', async message => {  
  if (Utils.ShouldIgnoreMessage(message)) return; 
  
  const fields = message.embeds[0].fields; 
  const footer = message.embeds[0].footer; 

  if (fields.length <= 0) return; 

  console.log("EVENT: (WRITE)");  
  
  const platform = Utils.Platforms[Utils.Platforms.map(s => 
    footer.iconURL.includes(s)
  ).indexOf(true)]; 
  
  const joined = fields.find(f => { return f.name.startsWith('Guardians Joined') });  
  const alts = fields.find(f => { return f.name.startsWith('Alternates') }); 

  const lfgEvent = {
    'messageSnowflake': message.id, 
    'creator': footer.text.split(' | ')[1], 
    'activity': fields.find(f => { return f.name === 'Activity:' }).value, 
    'description': fields.find(f => { return f.name === 'Description:' }).value, 
    'platform': platform, 
    'startTime': fields.find(f => { return f.name === 'Start Time:' }).value, 
    'joinId': fields.find(f => { return f.name === 'Join Id:' }).value, 
    'joined': {
      'max': joined.name.includes('/') ? joined.name.split(': ')[1].split('/')[1] : 0,
      'current': joined.name.includes('/') ? joined.name.split(': ')[1].split('/')[0] : 0,
      'guardians': joined.value.split(', ')
    }, 
    'alternates': {
      'current': alts ? alts.value.split(', ').length : 0, 
      'guardians': alts ? alts.value.split(', ') : null
    } 
  };   

  const kvp = {
    key: lfgEvent.messageSnowflake,
    value: lfgEvent
  }

  const request = https.request(config.requestOptions, res => {
    console.log(`statusCode: ${res.statusCode}`); 
    res.on('data', d => {
      console.log(d);
    }) 
  }); 

  request.on('error', error => {
    console.error(error); 
  }); 

  request.write(JSON.stringify(kvp)); 
  request.end(); 
}); 

bot.on('messageUpdate', async (oldMessage, newMessage) => {
  if (Utils.ShouldIgnoreMessage(newMessage)) return; 

  console.log("EVENT: (UPDATE)"); 
  
  newMessage.reactions.cache
    .each(async (reaction) => console.log(reaction)); 
});

require('./server')();
bot.login(config.token);