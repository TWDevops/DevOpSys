/*jshint sub: true es5:true*/
/**
 * API Manager Module
 */
var dbase = new require('../utils/DataBase.js');
var testModule = new require('./testModules.js');
var slackbot = new require('./slackbotModule.js');
/*
 *  Method List(head, get, post)
 */
var headHander = {};
var getHandler = {};
var postHandler = {};

function testcaseview(req, res, next) {
    if(req.session.apiId){
        console.log("session.apiId: " + req.session.apiId);
        req.session.apiId=null;
    }

    console.log("session.apiId: " + req.session.apiId);
    

    testModule.getAllTestCase(null, null, function(sucess, result){
        //console.log(result);
        res.render('testcase',{
            title: "Test Case List",
            testCaseList: result
        });
    });

}
getHandler["testcaseview"]=testcaseview;

function trytestcase(req, res, next) {
    if(req.session.apiId){
        console.log("session.apiId: " + req.session.apiId);
        req.session.apiId=null;
    }

    //var slackMsg = "Andy Test"; 
    //slackbot.sendMsg(slackMsg, function(sucess, result){
            //console.log("slack: " + result);
    //});

    //console.log("req: " + JSON.stringify(req.body));
    var deployid = 'ui_test01';
    var seleniumtaskid = 'ui_test01';
    if(req.body.testIdArray[0].testid != null){
        testModule.sendToTestServer (deployid, null, seleniumtaskid, req.body.testIdArray, function(sucess, result){
            //console.log(result);
            res.send(result);
        });
    }else{
        res.send('prem error');
    }
}
postHandler["tryTestCase"]=trytestcase;

function testserverview(req, res, next){
    var db = dbase.getDb();
    var sendData={};
    var apiOid = null;
    res.send('OK');
}
getHandler["testserverview"] = testserverview;


exports.headHander = headHander;
exports.getHandler = getHandler;
exports.postHandler = postHandler;
