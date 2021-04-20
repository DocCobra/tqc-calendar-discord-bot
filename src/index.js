const { Client, MessageEmbed } = require('discord.js');

const https = require('https');
const config = require('./config');

const bot = new Client({
  fetchAllMembers: false
});

bot.on('ready', () => {
  bot.user.setActivity('Revving up', { type: 'PLAYING' }); 
  console.log(`EVENT: (READY) Logged in as ${bot.user.tag}.`); 
});

function ShouldIgnoreMessage(message) {
  if (message.author.username !== config.charlemagne.username ||
      message.author.discriminator !== config.charlemagne.discriminator ||
      message.embeds.length <= 0)
    return true; 

  return false;
}


bot.on('message', async message => {  
  if (ShouldIgnoreMessage(message)) return; 
  
  const fields = message.embeds[0].fields; 
  const footer = message.embeds[0].footer; 

  if (fields.length <= 0) return; 

  console.log("EVENT: (WRITE)");  
  
  const joined = fields.find(f => { return f.name.startsWith('Guardians Joined') });  
  const alts = fields.find(f => { return f.name.startsWith('Alternates') }); 

  const lfgEvent = {
    'messageSnowflake': message.id, 
    'creator': footer.text.split(' | ')[1], 
    'activity': fields.find(f => { return f.name === 'Activity:' }).value, 
    'description': fields.find(f => { return f.name === 'Description:' }).value, 
    'startTime': fields.find(f => { return f.name === 'Start Time:' }).value, 
    'joinId': fields.find(f => { return f.name === 'Join Id:' }).value, 
    'joined': {
      'max': joined.name.split(': ')[1].split('/')[1],
      'current': joined.name.split(': ')[1].split('/')[0], 
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
  if (ShouldIgnoreMessage(newMessage)) return; 

  console.log("EVENT: (UPDATE)"); 
  
  newMessage.reactions.cache
    .each(async (reaction) => console.log(reaction)); 
});

require('./server')();
bot.login(config.token);