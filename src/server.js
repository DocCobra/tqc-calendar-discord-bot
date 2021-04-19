const app = require('express')();

app.get('/', (req, res) => res.send('NodeJS server up. Bot is living.'));

module.exports = () => {
  app.listen(3000);
}