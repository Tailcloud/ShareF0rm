const restify = require('restify');
const builder = require('botbuilder');

const MICROSOFT_APP_ID = '';
const MICROSOFT_APP_PASSWORD = '';

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector,function(session){
  session.send('greeting: '+session.message.text);
});
