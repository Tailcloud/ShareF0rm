const restify = require('restify');
const builder = require('botbuilder');

const MICROSOFT_APP_ID = 'f72a999a-24a2-4154-b6de-835aec6adbaf';
const MICROSOFT_APP_PASSWORD = 'Mu4H62kvb9w3Gg3By40p71Y';

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
