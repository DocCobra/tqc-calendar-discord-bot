module.exports = {
  prefix: '$$',
  token: process.env.TOKEN, 

  charlemagne: {
    username: "Charlemagne", 
    discriminator: "3214"
  }, 
   
  requestOptions: {
    hostname : 'tqc-calendar-proxy-db.doccobra.repl.co',
    port : 443,
    path : '/', 
    method : 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};