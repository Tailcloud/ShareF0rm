var restify = require('restify');
var builder = require('botbuilder');
var AuthenticationContext = require('adal-node').AuthenticationContext;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/oauthcallback',(req,res,next)=>{
  var authorizationCode = req.params.code;
  console.log('the authorizationCode is:'+authorizationCode);
})
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector,[function(session){
  session.send("如果需要求助，請輸入help；如果要開始新的表單，請輸入newreq");
}]);
bot.dialog('help',[(session,args,next)=>{
  session.send("請問需要什麼幫助?");
}]).triggerAction({
    matches: /^help$/i
});
bot.dialog('newreq',[
  (session,args,next) => {
     var msg = new builder.Message(session)
               .attachments([
                   new builder.SigninCard(session)
                       .text("Hello! Start with /start or get help with /help.")
                       .button("signin",'http://localhost:3000')
               ]);
  },
  (session,results,next) => {
    session.send("你的驗證碼是什麼?");
  }
  (session, results, next) => {
       session.dialogData.profile = {};
       builder.Prompts.choice(session,'Request Type :','BuildWith|SaleWith',{listStyle: builder.ListStyle.button})
  },
  (session, results, next) => {
       if (results.response) {
           session.dialogData.profile.name = results.response;
       }
       builder.Prompts.choice(session,'Request Segment :','CA Premium| CA| SMB| PSG| EPG| BuildWith',{listStyle: builder.ListStyle.button})
  },
  (session, results, next) => {
      session.dialogData.profile = {};
      builder.Prompts.text(session,'Custonmer Name :')
  },
  (session, results, next) => {
      session.dialogData.profile = {};
      builder.Prompts.number(session,'Opportunity or Booking ID : ',{retryPrompt:'error type?'})
  },
  (session, results, next) => {
      session.dialogData.profile = {};
      builder.Prompts.text(session,'Project Name :')
  },
  (session, results, next) => {
      session.dialogData.profile = {};
      builder.Prompts.number(session,'Est. Rev (K in $USD) :\n If request is Azure rev. = single month ACR * 12, If request are others, rev. = billed rev. ')
  },
  (session, results, next) => {
      session.dialogData.profile = {};
      builder.Message(session).addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          speak: "<s>Your  meeting about \"Adaptive Card design session\"<break strength='weak'/> is starting at 12:30pm</s><s>Do you want to snooze <break strength='weak'/> or do you want to send a late notification to the attendees?</s>",
          body: [
            {
              "type": "Input.Date",
              "placeholder": "Due Date",
              "id": "DateVal",
              "value": "2017-09-20"
            },
          ]
      }
      });
   },
  (session, results, next) => {
    session.dialogData.profile = {};
    builder.Prompts.choice(session,'Workload Type :','Apps & Infra(AI)| Business Applications(BA)| Data & Analytic(DA)| Modern Workplace(MW)',{listStyle: builder.ListStyle.button})
  },
  (session, results, next) => {
    session.dialogData.profile = {};
    builder.Prompts.text(session,'Workload Practice :')
  },
  (session, results, next) => {
    session.dialogData.profile = {};
    builder.Prompts.text(session,'Workload Scenario :')
  },
  (seesion,results,next) => {
    session.dialogData.profile={};
    builder.Prompts.text(session,'Business Justification:');
  },
  (session, results, next) => {
    session.dialogData.profile = {};
    builder.Prompts.choice(session,'Partner Type :','Channel Development(CD)| Independent Software Vendor(ISV)| Managed Service Provider(MSP)| SMB-NPL| System Integrators(SI)',{listStyle: builder.ListStyle.button})
  },
  (session, results, next) => {
    session.dialogData.profile = {};
    builder.Prompts.text(session,'Partner PDM :')
   },
  (session, args, next) => {
    session.dialogData.profile = {};
    builder.Prompts.text(session,'Partner List :')
  },
  (session, results) => {
    if (results.response) {
      session.dialogData.profile.from = results.response;
    }
    session.endDialogWithResult({ response: session.dialogData.profile });
   }
]).triggerAction({
    matches: /^newreq$/i
});
