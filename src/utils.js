const config = require('./config'); 

const platforms = [
  'psn',
  'steam', 
  'xbox',
  'stadia'
]; 

function ShouldIgnoreMessage(message) {
  if (message.author.username !== config.charlemagne.username ||
      message.author.discriminator !== config.charlemagne.discriminator ||
      message.embeds.length <= 0)
    return true; 

  return false;
}


module.exports.Platforms = platforms; 
module.exports.ShouldIgnoreMessage = ShouldIgnoreMessage; 