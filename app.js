                               var restify = require('restify');
var builder = require('botbuilder');
var AuthenticationContext = require('adal-node').AuthenticationContext;
// setup database
var MongoClient = require("mongodb").MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/requestf0rmdb';

// Setup Restify Server
var server = restify.createServer();
var userName = "";
var userEmail = "";
var userToken = "";

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/oauthcallback',(req,res,next)=>{
  var authorizationCode = req.params.code;
  console.log('the authorizationCode is:'+authorizationCode);
})

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

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
  (session) => {
    if (session.message && session.message.value) {
      processSubmitAction(session, session.message.value);
      return;
  }
    session.dialogData.f0rm = {};
    var msg = new builder.Message(session)
               .attachments([
                   new builder.SigninCard(session)
                       .text("登入後請輸入驗證碼於此.")
                       .button("signin",'http://localhost:3000')
               ]);
    builder.Prompts.text(session,msg,next);
  },
  (session, results) => {
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var rscols = db.collection("users");
    rscols.find({"AuthCode":results.response}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            res.status(500).send();
            session.endDialog("Error AuthCode");
          }else{
            console.log(items[0].name);
            userName = items[0].name;
            userEmail = items[0].email;
            userToken = items[0].token;
          }
        });
      });
    builder.Prompts.choice(session,'Request Type :','BuildWith|SaleWith',{listStyle: builder.ListStyle.button})
  },
  (session, results) => {
    // builder.Prompts.text(session,results.response.entity);
    builder.Prompts.choice(session,'Request Segment :','CA Premium| CA| SMB| PSG| EPG| BuildWith',{listStyle: builder.ListStyle.button})
  },
  (session, results) => {
      builder.Prompts.text(session,'Custonmer Name :')
  },
  (session, results) => {
      builder.Prompts.number(session,'Opportunity or Booking ID : ',{retryPrompt:'error type?'})
  },
  (session, results) => {
      builder.Prompts.text(session,'Project Name :')
  },
  (session, results) => {
      builder.Prompts.number(session,'Est. Rev (K in $USD) :\n If request is Azure rev. = single month ACR * 12, If request are others, rev. = billed rev. ',{retryPrompt:'請輸入數字好嗎'});
  },
  (session, results) => {
    // session.sendTyping();
    var msg = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            type: "AdaptiveCard",
            body: [
              {
                "type": "Input.Date",
                "id": "dueDate",
                "title": "bolder"
              },
              {
                "type": "TextBlock",
                "text": "12:30 PM - 1:30 PM"
              },
            ],
            "actions": [
				    {
				        "type": "Action.Submit",
				        "title": "OK",
                'data':{
                  'type':'date'
                }
			        }
				]

        }
    });
    session.send(msg);
   },
  (session, results) => {
    console.log(results.response.entity);
    builder.Prompts.choice(session,'Workload Type :','Apps & Infra(AI)| Business Applications(BA)| "Data & Analytics (DA)| Modern Workplace(MW)',{listStyle: builder.ListStyle.button})
  },
  (session, results) => {
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var worktypes = db.collection("workload");
    // var cursor = events.find({"token":token});
    worktypes.find({"Workload Type":results.response.entity}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            res.status(500).send();
            builder.Prompts.text(session,'Error in searching');
          } else if(items.length==0){
            builder.Prompts.text(session,'No suitable Type');
          }else{
            builder.Prompts.choice(session,items);
          }
        });
  });
    // builder.Prompts.text(session,'Workload Practice :')
  },
  (session, results) => {
    builder.Prompts.text(session,'Workload Scenario :')
  },
  (seesion,results) => {
    builder.Prompts.text(session,'Business Justification:');
  },
  (session, results) => {
    builder.Prompts.choice(session,'Partner Type :','Channel Development(CD)| Independent Software Vendor(ISV)| Managed Service Provider(MSP)| SMB-NPL| System Integrators(SI)',{listStyle: builder.ListStyle.button})
  },
  (session, results) => {
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var rscols = db.collection("workload");
    // var cursor = events.find({"token":token});
    rscols.find({"token":tokens}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else if(items.length==0){
            rscols.insert({
                    "token":tokens,
                    "AuthCode": authCode,
                    "name": req.user.profile.displayName,
                    "email": req.user.profile.emails[0].address
                    },function(err,docs){
                      if(err){
                        db.close();
                        console.log("Data inserted failed:"+err);
                      }else{
                        console.log("Data inserted successfully:"+docs)
                      }
                  });
            res.status(200).send();
          }else{
            console.log(items[0].password);
            res.status(409).send();

          }
        });
  });
    builder.Prompts.text(session,'Partner PDM :')
   },
  (session, result) => {
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var rscols = db.collection("workload");
    rscols.find({"token":tokens}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else if(items.length==0){
            rscols.insert({
                    "token":tokens,
                    "AuthCode": authCode,
                    "name": req.user.profile.displayName,
                    "email": req.user.profile.emails[0].address
                    },function(err,docs){
                      if(err){
                        db.close();
                        console.log("Data inserted failed:"+err);
                      }else{
                        console.log("Data inserted successfully:"+docs)
                      }
                  });
            res.status(200).send();
          }else{
            console.log(items[0].password);
            res.status(409).send();

          }
        });
  });
    builder.Prompts.text(session,'Partner List :')
  },
  (session, results) => {
    if (results.response) {
      session.dialogData.profile.from = results.response;
    }
    session.endDialogWithResult({
      response:{

      }
    });
   }
]).triggerAction({
    matches: /^newreq$/i
});

function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Please complete all the search parameters';
    switch (value.type) {
        case 'date':
          console.log("processSub: " + JSON.stringify(value));
          session.conversationData = value;
            break;
        default:
            session.send(defaultErrorMessage);
    }
}
