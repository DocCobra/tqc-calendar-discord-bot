const { Client, MessageEmbed } = require('discord.js');
const Keyv = require('keyv');

const config = require('./config');

const vault = new Keyv(); // for in-memory storage
const bot = new Client({
  fetchAllMembers: false
});

bot.on('ready', () => {
  bot.user.setActivity('Revving up', { type: 'PLAYING' }); 
  console.log(`EVENT: (READY) Logged in as ${bot.user.tag}.`); 
});

function ShouldIgnoreMessage(message) {
  if (message.author.username !== "Charlemagne" ||
      message.author.discriminator !== "3214" ||
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

  vault.set(message.id, lfgEvent)
  .then(() => vault.get(message.id).then(
    p => console.log(JSON.stringify(p, null, 2))
  )); 
}); 

bot.on('messageUpdate', async (oldMessage, newMessage) => {
  if (ShouldIgnoreMessage(newMessage)) return; 

  console.log("EVENT: (UPDATE)"); 
  
  newMessage.reactions.cache
    .each(async (reaction) => console.log(reaction)); 
});

require('./server')();
bot.login(config.token);