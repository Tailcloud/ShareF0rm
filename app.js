var restify = require('restify');
var builder = require('botbuilder');
var AuthenticationContext = require('adal-node').AuthenticationContext;
// setup database
var MongoClient = require("mongodb").MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// var url = "mongodb://f0rmongodb:1XXXG3icYsO3hptov2ativVOlQbfzmk3s7oPYgWrkARroEHt32qzAm7crmVaa3FT34CwvNCeIdwaRKsV2CDtjw==@f0rmongodb.documents.azure.com:10255/?ssl=true";
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
// Enable Conversation Data persistence
// bot.set('persistConversationData', true);

bot.dialog('newreq',[
  (session) => {
    if (session.message && session.message.value) {
      processSubmitAction(session, session.message.value);
      return;
  }
    session.dialogData.f0rm = {};
    session.conversationData.data = {};
    var msg = new builder.Message(session)
               .attachments([
                   new builder.SigninCard(session)
                       .text("登入後請輸入驗證碼於此.")
                       .button("signin",'http://localhost:3000')
               ]);
    builder.Prompts.text(session,msg);
  },
  (session, results,next) => {
    if (session.conversationData.Autoken) {
      next();
    }
    session.conversationData.Autoken = results.response.entity;
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var rscols = db.collection("users");
    rscols.find({"AuthCode":results.response}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            res.status(500).send();
            session.endDialog("Error AuthCode");
          }else if(items.length==0){
            session.endDialog("Not Found");
          }else{
            console.log(items[0].name);
            userName = items[0].name;
            userEmail = items[0].email;
            userToken = items[0].token;
            session.conversationData.userName=items[0].name;
            session.conversationData.userEmail=items[0].email;
            session.conversationData.userToken=items[0].token;
          }
        });
      });
    builder.Prompts.choice(session,'Request Type :','BuildWith|SaleWith',{listStyle: builder.ListStyle.button})
  },
  (session, results,next) => {
    if (session.conversationData.ReqType) {
      next();
    }else{
      session.conversationData.ReqType = results.response.entity;
    }
    builder.Prompts.choice(session,'Request Segment :','CA Premium| CA| SMB| PSG| EPG| BuildWith',{listStyle: builder.ListStyle.button})
  },
  (session, results,next) => {
    if (session.conversationData.ReqSegment) {
      next();
    }else{
      session.conversationData.ReqSegment = results.response.entity;
    }
      builder.Prompts.text(session,'Customer Name :')
  },
  (session, results,next) => {
    if (session.conversationData.CustomerName) {
      next();
    }else{
      session.conversationData.CustomerName = results.response;
    }
      builder.Prompts.number(session,'Opportunity or Booking ID : ',{retryPrompt:'error type?'})
  },
  (session, results,next) => {
    if (session.conversationData.BookId) {
      next();
    }else{
      session.conversationData.BookId = results.response;
    }
      builder.Prompts.text(session,'Project Name :')
  },
  (session, results,next) => {
    if (session.conversationData.ProjectName) {
      next();
    }else{
      session.conversationData.ProjectName = results.response;
    }
      builder.Prompts.number(session,'Est. Rev (K in $USD) :\n If request is Azure rev. = single month ACR * 12, If request are others, rev. = billed rev. ',{retryPrompt:'請輸入數字好嗎'});
  },
  (session, results,next) => {
    if (session.conversationData.Rev) {
      next();
    }else{
      session.conversationData.Rev = results.response;
    }
    builder.Prompts.choice(session,'Est. Close Date: ',"Q1|Q2|Q3",{listStyle: builder.ListStyle.button});
   },
  (session, results,next) => {
    if (session.conversationData.Dat) {
      next();
    }else{
      session.conversationData.Dat = results.response;
    }
    console.log(results.response.entity);
    builder.Prompts.choice(session,'Workload Type :','Apps & Infra (AI)|Business Applications (BA)|Data & Analytics (DA)|Modern Workplace (MW)',{listStyle: builder.ListStyle.button})
  },
  (session, results,next) => {
    if (session.conversationData.WorkType) {
      next();
    }else{
      session.conversationData.WorkType = results.response.entity;
    }
    var tmparr=[];

    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var workprac = db.collection("workprac");
    // var cursor = events.find({"token":token});
    workprac.find({"worktype":results.response.entity}).toArray(function(err, items) {
          if (err) {
            res.status(500).send();
            builder.Prompts.text(session,'Error in searching');
          } else if(items.length==0){
            builder.Prompts.text(session,'No suitable Type');
          }else{
            for(var index = 0 ; index < items.length ; index++ ){
              tmparr.push(items[index]['workprac']);
            }
            builder.Prompts.choice(session,"Workload Practice",tmparr,{listStyle: builder.ListStyle.button});
          }
        });
      });
  },
  (session, results,next) => {
    if (session.conversationData.WorkPrac) {
      next();
    }else{
      session.conversationData.WorkPrac = results.response.entity;
    }
    var tmparr=[];

    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var worksce = db.collection("worksce");
    // var cursor = events.find({"token":token});
    worksce.find({"workprac":results.response.entity}).toArray(function(err, items) {
          if (err) {
            res.status(500).send();
            builder.Prompts.text(session,'Error in searching');
          } else if(items.length==0){
            builder.Prompts.text(session,'No suitable Type');
          }else{
            for(var index = 0 ; index < items.length ; index++ ){
              tmparr.push(items[index]['worksce']);
            }
            builder.Prompts.choice(session,"Workload Scenario",tmparr,{listStyle: builder.ListStyle.button});
          }
        });
      });
  },
  (session,results,next) => {
    if (session.conversationData.WorkSce) {
      next();
    }else{
      session.conversationData.WorkSce = results.response.entity;
    }
    builder.Prompts.text(session,'Business Justification:');
  },
  (session, results,next) => {
    if (session.conversationData.Just) {
      next();
    }else{
      session.conversationData.Just = results.response;
    }
    builder.Prompts.choice(session,'Partner Type :','Channel Development (CD)|Independent Software Vendor (ISV)|Managed Service Provider (MSP)|SMB-NPL|System Integrators (SI)',{listStyle: builder.ListStyle.button})
  },
  (session, results,next) => {
    if (session.conversationData.PartnerType) {
      next();
    }else{
      session.conversationData.PartnerType = results.response.entity;
      MongoClient.connect(url, function(err, db) {
        assert.equal(null,err);
        console.log("connected correctly to server");

        var rscols = db.collection("partner");
        rscols.distinct("Partner PDM",{"Partner Type":results.response.entity},function(err, items) {
              if (err) {
                console.log(err);
                builder.Prompts.text(session,'Error in searching');
              }else{
                // console.log(items[0].password);
                builder.Prompts.choice(session,'Partner PDM',items,{listStyle: builder.ListStyle.button});

              }
            });
      });
    }
   },
  (session, result,next) => {
    if (session.conversationData.PDM) {
      next();
    }else{
      session.conversationData.PDM = result.response.entity;
    }
    MongoClient.connect(url, function(err, db) {
    assert.equal(null,err);
    console.log("connected correctly to server");

    var partnerList = db.collection("partner");
    var salesData = {
    "west": {
        units: 200,
        total: "$6,000"
    },
    "central": {
        units: 100,
        total: "$3,000"
    },
    "east": {
        units: 300,
        total: "$9,000"
    }
};
var tmparr=[];
    partnerList.find({"Partner PDM":result.response.entity}).toArray(function(err, items) {
          if (err) {
            console.log(err);
            builder.Prompts.text(session,'500 Error :')
          } else if(items.length==0){
            builder.Prompts.text(session,'No Lists :')
          }else{
            // console.log(items[0].password);
            for(var index = 0 ; index < items.length ; index++ ){
              tmparr.push(items[index]['Title']);
            }
            builder.Prompts.choice(session,"Partner List",tmparr,{listStyle: builder.ListStyle.button});
          }
        });
  });
  },
  (session,results,next) => {
    if (session.conversationData.List) {
      next();
    }else{
      session.conversationData.List = results.response.entity;
    }
    var msg = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            type: "AdaptiveCard",
            body: [
              {
                "type": "TextBlock",
                "text": "Request Type: "+session.conversationData.ReqType
              },
              {
                "type": "TextBlock",
                "text": "Request Segment: "+session.conversationData.ReqSegment
              },
              {
                "type": "TextBlock",
                "text": "Customer Name: "+session.conversationData.CustomerName
              },
              {
                "type": "TextBlock",
                "text": "Opportunity or Booking ID: "+session.conversationData.BookId
              },
              {
                "type": "TextBlock",
                "text": "Project Name: "+session.conversationData.ProjectName
              },
              {
                "type": "TextBlock",
                "text": "Est. Rev (K in $USD): "+session.conversationData.Rev
              },
              {
                "type": "TextBlock",
                "text": "Est. Close Date: "+session.conversationData.Dat
              },
              {
                "type": "TextBlock",
                "text": "Workload Type: "+session.conversationData.WorkType
              },
              {
                "type": "TextBlock",
                "text": "Workload Practice: "+session.conversationData.WorkPrac
              },
              {
                "type": "TextBlock",
                "text": "Workload Scenario: "+session.conversationData.WorkSce
              },
              {
                "type": "TextBlock",
                "text": "Business Justification: "+session.conversationData.Just
              },
              {
                "type": "TextBlock",
                "text": "Partner Type: "+session.conversationData.PartnerType
              },
              {
                "type": "TextBlock",
                "text": "Partner PDM: "+session.conversationData.PDM
              },
              {
                "type": "TextBlock",
                "text": "Partner List: "+session.conversationData.List
              }
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

    if (results.response) {
      session.dialogData.profile.from = results.response;
    }

    session.endDialogWithResult({
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
          session.beginDialog('newreq');
        //     // Search, validate parameters
        //     if (validateHotelSearch(value)) {
        //         // proceed to search
        //         session.beginDialog('-search', value);
        //     } else {
        //         session.send(defaultErrorMessage);
        //     }
        //     break;
        // case '':
        //     sendHotlection(session, value);
            break;
        default:
            session.send(defaultErrorMessage);
    }
}
